package org.cmp.backend.service;

import lombok.RequiredArgsConstructor;
import org.cmp.backend.dto.PatientRequest;
import org.cmp.backend.dto.PatientResponse;
import org.cmp.backend.dto.PageResponse;
import org.cmp.backend.dto.PatientSummaryResponse;
import org.cmp.backend.entity.Patient;
import org.cmp.backend.exception.ConflictException;
import org.cmp.backend.exception.ResourceNotFoundException;
import org.cmp.backend.repository.PatientRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    public PageResponse<PatientSummaryResponse> list(String name, String phoneNumber, Boolean active, Pageable pageable) {
        Specification<Patient> spec = Specification.unrestricted();
        if (name != null && !name.isBlank()) {
            String pattern = "%" + name.toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(cb.concat(cb.concat(root.get("firstName"), " "), root.get("lastName"))), pattern));
        }
        if (phoneNumber != null && !phoneNumber.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("phoneNumber"), phoneNumber));
        }
        if (active != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("active"), active));
        }
        Page<Patient> page = patientRepository.findAll(spec, pageable);
        return new PageResponse<>(
                page.getContent().stream().map(this::toSummaryResponse).toList(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize()
        );
    }

    public PatientResponse getById(UUID id) {
        return toResponse(findEntity(id));
    }

    public PatientResponse create(PatientRequest request) {
        validateUniqueness(request, null);
        Patient patient = new Patient();
        applyRequest(patient, request);
        return toResponse(patientRepository.save(patient));
    }

    public PatientResponse update(UUID id, PatientRequest request) {
        Patient patient = findEntity(id);
        validateUniqueness(request, id);
        applyRequest(patient, request);
        return toResponse(patientRepository.save(patient));
    }

    public void deactivate(UUID id) {
        Patient patient = findEntity(id);
        patient.setActive(false);
        patientRepository.save(patient);
    }

    private void validateUniqueness(PatientRequest request, UUID excludeId) {
        boolean phoneTaken = (excludeId == null)
                ? patientRepository.existsByPhoneNumber(request.phoneNumber())
                : patientRepository.existsByPhoneNumberAndIdNot(request.phoneNumber(), excludeId);
        if (phoneTaken) {
            throw new ConflictException("Phone number is already taken.");
        }

        if (request.email() != null && !request.email().isBlank()) {
            boolean emailTaken = (excludeId == null)
                    ? patientRepository.existsByEmail(request.email())
                    : patientRepository.existsByEmailAndIdNot(request.email(), excludeId);
            if (emailTaken) {
                throw new ConflictException("Email is already taken.");
            }
        }
    }

    private void applyRequest(Patient patient, PatientRequest request) {
        patient.setFirstName(request.firstName());
        patient.setLastName(request.lastName());
        patient.setDateOfBirth(request.dateOfBirth());
        patient.setGender(request.gender());
        patient.setPhoneNumber(request.phoneNumber());
        patient.setEmail(request.email());
        patient.setAddress(request.address());
    }

    private Patient findEntity(UUID id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + id));
    }

    private PatientResponse toResponse(Patient p) {
        return new PatientResponse(
                p.getId(), p.getFirstName(), p.getLastName(), p.getDateOfBirth(), p.getGender(),
                p.getPhoneNumber(), p.getEmail(), p.getAddress(), p.isActive(),
                p.getCreatedAt(), p.getCreatedBy(), p.getUpdatedAt(), p.getUpdatedBy()
        );
    }

    private PatientSummaryResponse toSummaryResponse(Patient p) {
        return new PatientSummaryResponse(
                p.getId(), p.getFirstName(), p.getLastName(), p.getPhoneNumber(), p.getEmail(), p.isActive()
        );
    }
}