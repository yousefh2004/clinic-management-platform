package org.cmp.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record DepartmentRequest(
        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "Code is required")
        String code
) {}
