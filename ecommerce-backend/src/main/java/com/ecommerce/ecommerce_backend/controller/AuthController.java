package com.ecommerce.ecommerce_backend.controller;

import com.ecommerce.ecommerce_backend.dto.ChangePasswordRequest;
import com.ecommerce.ecommerce_backend.model.User;
import com.ecommerce.ecommerce_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import com.ecommerce.ecommerce_backend.dto.UpdateProfileRequest;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        try {

            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Unauthorized"));
            }

            User user = userRepository.findByEmail(authentication.getName());

            if (user == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "User not found"));
            }

            // Check current password
            if (!passwordEncoder.matches(
                    request.getCurrentPassword(),
                    user.getPassword()
            )) {

                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Current password is incorrect"));
            }

            // Set new encoded password
            user.setPassword(
                    passwordEncoder.encode(request.getNewPassword())
            );

            userRepository.save(user);

            return ResponseEntity.ok(
                    Map.of("message", "Password changed successfully")
            );

        } catch (Exception e) {

            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {

        try {

            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Unauthorized"));
            }

            User user = userRepository.findByEmail(authentication.getName());

            if (user == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "User not found"));
            }

            // Check if email already exists
            User existingUser = userRepository.findByEmail(request.getEmail());

            if (existingUser != null &&
                    !existingUser.getId().equals(user.getId())) {

                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email already in use"));
            }

            user.setName(request.getName());
            user.setEmail(request.getEmail());

            userRepository.save(user);

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Profile updated successfully",
                            "user", user
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
