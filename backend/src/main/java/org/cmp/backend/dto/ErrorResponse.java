package org.cmp.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.OffsetDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
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