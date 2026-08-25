package org.cmp.backend.dto;

import org.cmp.backend.entity.AppointmentStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AppointmentSummaryResponse(
        UUID id,
        String doctorName,
        String patientName,
        OffsetDateTime appointmentDateTime,
        AppointmentStatus status
) {}