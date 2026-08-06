package org.cmp.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.cmp.backend.dto.CreateUserRequest;
import org.cmp.backend.dto.LoginRequest;
import org.cmp.backend.dto.LoginResponse;
import org.cmp.backend.dto.RefreshRequest;
import org.cmp.backend.dto.UserResponse;
import org.cmp.backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request.refreshToken()));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(authService.getCurrentUser(username));
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createStaffUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse created = authService.createStaffUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/users/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateUser(@PathVariable UUID id) {
        authService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }
}