package org.cmp.backend.service;

import lombok.RequiredArgsConstructor;
import org.cmp.backend.dto.DoctorRequest;
import org.cmp.backend.dto.DoctorResponse;
import org.cmp.backend.dto.DoctorSummaryResponse;
import org.cmp.backend.dto.PageResponse;
import org.cmp.backend.entity.Department;
import org.cmp.backend.entity.Doctor;
import org.cmp.backend.exception.ConflictException;
import org.cmp.backend.exception.ResourceNotFoundException;
import org.cmp.backend.repository.DepartmentRepository;
import org.cmp.backend.repository.DoctorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;

    public PageResponse<DoctorSummaryResponse> list(String name, UUID departmentId, Boolean active, Pageable pageable) {
        Specification<Doctor> spec = Specification.unrestricted();

        if (name != null && !name.isBlank()) {
            String pattern = "%" + name.toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(cb.concat(cb.concat(root.get("firstName"), " "), root.get("lastName"))), pattern));
        }
        if (departmentId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("department").get("id"), departmentId));
        }
        if (active != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("active"), active));
        }

        Page<Doctor> page = doctorRepository.findAll(spec, pageable);

        return new PageResponse<>(
                page.getContent().stream().map(this::toSummaryResponse).toList(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize()
        );
    }

    public DoctorResponse getById(UUID id) {
        return toResponse(findEntity(id));
    }

    public DoctorResponse create(DoctorRequest request) {
        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + request.departmentId()));

        if (doctorRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email is already taken.");
        }
        if (doctorRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new ConflictException("Phone number is already taken.");
        }

        Doctor doctor = new Doctor();
        applyRequest(doctor, request, department);

        return toResponse(doctorRepository.save(doctor));
    }

    public DoctorResponse update(UUID id, DoctorRequest request) {
        Doctor doctor = findEntity(id);

        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + request.departmentId()));

        if (doctorRepository.existsByEmailAndIdNot(request.email(), id)) {
            throw new ConflictException("Email is already taken.");
        }
        if (doctorRepository.existsByPhoneNumberAndIdNot(request.phoneNumber(), id)) {
            throw new ConflictException("Phone number is already taken.");
        }

        applyRequest(doctor, request, department);

        return toResponse(doctorRepository.save(doctor));
    }

    public void deactivate(UUID id) {
        Doctor doctor = findEntity(id);
        doctor.setActive(false);
        doctorRepository.save(doctor);
    }

    private void applyRequest(Doctor doctor, DoctorRequest request, Department department) {
        doctor.setFirstName(request.firstName());
        doctor.setLastName(request.lastName());
        doctor.setEmail(request.email());
        doctor.setPhoneNumber(request.phoneNumber());
        doctor.setDepartment(department);
        doctor.setSpecialty(request.specialty());
    }

    private Doctor findEntity(UUID id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + id));
    }

    private DoctorResponse toResponse(Doctor d) {
        return new DoctorResponse(
                d.getId(), d.getFirstName(), d.getLastName(), d.getEmail(), d.getPhoneNumber(),
                d.getDepartment().getId(), d.getDepartment().getName(), d.getSpecialty(), d.isActive(),
                d.getCreatedAt(), d.getCreatedBy(), d.getUpdatedAt(), d.getUpdatedBy()
        );
    }

    private DoctorSummaryResponse toSummaryResponse(Doctor d) {
        return new DoctorSummaryResponse(
                d.getId(), d.getFirstName(), d.getLastName(),
                d.getDepartment().getName(), d.getSpecialty(), d.isActive()
        );
    }
}