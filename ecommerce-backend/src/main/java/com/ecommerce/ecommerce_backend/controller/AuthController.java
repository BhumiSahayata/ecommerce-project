package com.ecommerce.ecommerce_backend.controller;

import com.ecommerce.ecommerce_backend.dto.ChangePasswordRequest;
import com.ecommerce.ecommerce_backend.model.User;
import com.ecommerce.ecommerce_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        try {

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
}
public class AuthController {
}
