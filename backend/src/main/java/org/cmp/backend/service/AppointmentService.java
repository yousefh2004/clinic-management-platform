package org.cmp.backend.service;

import lombok.RequiredArgsConstructor;
import org.cmp.backend.dto.AppointmentRequest;
import org.cmp.backend.dto.AppointmentResponse;
import org.cmp.backend.dto.PageResponse;
import org.cmp.backend.entity.Appointment;
import org.cmp.backend.entity.AppointmentStatus;
import org.cmp.backend.entity.Doctor;
import org.cmp.backend.entity.Patient;
import org.cmp.backend.exception.BadRequestException;
import org.cmp.backend.exception.ConflictException;
import org.cmp.backend.exception.ResourceNotFoundException;
import org.cmp.backend.repository.AppointmentRepository;
import org.cmp.backend.repository.DoctorRepository;
import org.cmp.backend.repository.PatientRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public PageResponse<AppointmentResponse> list(
            UUID doctorId, UUID patientId, OffsetDateTime fromDate, OffsetDateTime toDate,
            AppointmentStatus status, Pageable pageable) {

        Specification<Appointment> spec = Specification.unrestricted();

        if (doctorId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("doctor").get("id"), doctorId));
        }
        if (patientId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("patient").get("id"), patientId));
        }
        if (fromDate != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("appointmentDateTime"), fromDate));
        }
        if (toDate != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("appointmentDateTime"), toDate));
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }

        Page<Appointment> page = appointmentRepository.findAll(spec, pageable);

        return new PageResponse<>(
                page.getContent().stream().map(this::toResponse).toList(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize()
        );
    }

    public AppointmentResponse getById(UUID id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public AppointmentResponse create(AppointmentRequest request) {
        Doctor doctor = findActiveDoctor(request.doctorId());
        Patient patient = findActivePatient(request.patientId());

        validateFutureDate(request.appointmentDateTime());
        validateNoConflict(doctor.getId(), request.appointmentDateTime(), null);

        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setAppointmentDateTime(request.appointmentDateTime());
        appointment.setStatus(AppointmentStatus.SCHEDULED);

        return saveWithConflictFallback(appointment);
    }

    @Transactional
    public AppointmentResponse update(UUID id, AppointmentRequest request) {
        Appointment appointment = findEntity(id);

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new ConflictException("A completed appointment cannot be edited.");
        }

        Doctor doctor = findActiveDoctor(request.doctorId());
        Patient patient = findActivePatient(request.patientId());

        boolean dateTimeChanged = !appointment.getAppointmentDateTime().isEqual(request.appointmentDateTime())
                || !appointment.getDoctor().getId().equals(doctor.getId());

        if (dateTimeChanged) {
            validateFutureDate(request.appointmentDateTime());
            validateNoConflict(doctor.getId(), request.appointmentDateTime(), id);
        }

        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setAppointmentDateTime(request.appointmentDateTime());

        return saveWithConflictFallback(appointment);
    }

    public AppointmentResponse cancel(UUID id) {
        Appointment appointment = findEntity(id);

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new ConflictException("A completed appointment cannot be cancelled.");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        return toResponse(appointmentRepository.save(appointment));
    }

    public AppointmentResponse complete(UUID id) {
        Appointment appointment = findEntity(id);

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new ConflictException("A cancelled appointment cannot be completed.");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        return toResponse(appointmentRepository.save(appointment));
    }

    private void validateFutureDate(OffsetDateTime dateTime) {
        if (!dateTime.isAfter(OffsetDateTime.now())) {
            throw new BadRequestException("Appointment date and time must be in the future.");
        }
    }

    private void validateNoConflict(UUID doctorId, OffsetDateTime dateTime, UUID excludeId) {
        boolean conflict = (excludeId == null)
                ? appointmentRepository.existsByDoctorIdAndAppointmentDateTimeAndStatusNot(
                doctorId, dateTime, AppointmentStatus.CANCELLED)
                : appointmentRepository.existsByDoctorIdAndAppointmentDateTimeAndStatusNotAndIdNot(
                doctorId, dateTime, AppointmentStatus.CANCELLED, excludeId);

        if (conflict) {
            throw new ConflictException("This doctor already has an appointment at that date and time.");
        }
    }

    private AppointmentResponse saveWithConflictFallback(Appointment appointment) {
        try {
            return toResponse(appointmentRepository.save(appointment));
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("This doctor already has an appointment at that date and time.");
        }
    }

    private Doctor findActiveDoctor(UUID id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + id));
        if (!doctor.isActive()) {
            throw new BadRequestException("Cannot book an appointment with an inactive doctor.");
        }
        return doctor;
    }

    private Patient findActivePatient(UUID id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + id));
        if (!patient.isActive()) {
            throw new BadRequestException("Cannot book an appointment with an inactive patient.");
        }
        return patient;
    }

    private Appointment findEntity(UUID id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));
    }

    private AppointmentResponse toResponse(Appointment a) {
        return new AppointmentResponse(
                a.getId(),
                a.getDoctor().getId(),
                a.getDoctor().getFirstName() + " " + a.getDoctor().getLastName(),
                a.getPatient().getId(),
                a.getPatient().getFirstName() + " " + a.getPatient().getLastName(),
                a.getAppointmentDateTime(),
                a.getStatus(),
                a.getCreatedAt(), a.getCreatedBy(), a.getUpdatedAt(), a.getUpdatedBy()
        );
    }
}