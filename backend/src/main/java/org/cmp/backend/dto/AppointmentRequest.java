package org.cmp.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AppointmentRequest(
        @NotNull(message = "Doctor is required")
        UUID doctorId,

        @NotNull(message = "Patient is required")
        UUID patientId,

        @NotNull(message = "Appointment date and time is required")
        OffsetDateTime appointmentDateTime
) {}