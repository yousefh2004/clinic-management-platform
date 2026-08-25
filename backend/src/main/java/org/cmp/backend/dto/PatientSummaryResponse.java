package org.cmp.backend.dto;

public record PatientSummaryResponse(
        java.util.UUID id,
        String firstName,
        String lastName,
        String phoneNumber,
        String email,
        boolean active
) {}