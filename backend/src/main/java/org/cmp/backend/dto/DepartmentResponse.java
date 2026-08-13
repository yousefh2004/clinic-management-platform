package org.cmp.backend.dto;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

public record DepartmentResponse(
        UUID id,
        String name,
        String code,
        Instant createdAt,
        String createdBy,
        Instant updatedAt,
        String updatedBy
) {}
