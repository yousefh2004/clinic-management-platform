package org.cmp.backend.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record ErrorResponse(
        String title,
        int status,
        String detail,
        String path,
        OffsetDateTime timestamp,
        List<FieldError> errors
) {
    public record FieldError(String field, String message) {}
}