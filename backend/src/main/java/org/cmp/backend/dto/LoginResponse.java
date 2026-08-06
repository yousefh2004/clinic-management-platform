package org.cmp.backend.dto;

public record LoginResponse(
        String accessToken,
        String refreshToken
) {}