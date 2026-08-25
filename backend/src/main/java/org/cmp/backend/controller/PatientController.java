package org.cmp.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.cmp.backend.dto.PatientRequest;
import org.cmp.backend.dto.PatientResponse;
import org.cmp.backend.dto.PageResponse;
import org.cmp.backend.dto.PatientSummaryResponse;
import org.cmp.backend.service.PatientService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    public ResponseEntity<PageResponse<PatientSummaryResponse>> list(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        return ResponseEntity.ok(patientService.list(name, phoneNumber, active, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(patientService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<PatientResponse> create(@Valid @RequestBody PatientRequest request) {
        PatientResponse response = patientService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<PatientResponse> update(
            @PathVariable UUID id, @Valid @RequestBody PatientRequest request) {
        return ResponseEntity.ok(patientService.update(id, request));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivate(@PathVariable UUID id) {
        patientService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}