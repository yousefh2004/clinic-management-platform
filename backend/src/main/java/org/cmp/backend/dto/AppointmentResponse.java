package org.cmp.backend.dto;

import org.cmp.backend.entity.AppointmentStatus;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        UUID doctorId,
        String doctorName,
        UUID patientId,
        String patientName,
        OffsetDateTime appointmentDateTime,
        AppointmentStatus status,
        Instant createdAt,
        String createdBy,
        Instant updatedAt,
        String updatedBy
) {}