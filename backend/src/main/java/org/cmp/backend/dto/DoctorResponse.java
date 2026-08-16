package org.cmp.backend.dto;

import java.time.Instant;
import java.util.UUID;

public record DoctorResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        UUID departmentId,
        String departmentName,
        String specialty,
        boolean active,
        Instant createdAt,
        String createdBy,
        Instant updatedAt,
        String updatedBy
) {}