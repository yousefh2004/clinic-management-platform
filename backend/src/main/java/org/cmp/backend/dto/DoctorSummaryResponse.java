package org.cmp.backend.dto;

import java.util.UUID;

public record DoctorSummaryResponse(
        UUID id,
        String firstName,
        String lastName,
        String departmentName,
        String specialty,
        boolean active
) {}