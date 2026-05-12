package com.ecommerce.ecommerce_backend.controller;

import com.ecommerce.ecommerce_backend.dto.LoginRequest;
import com.ecommerce.ecommerce_backend.dto.LoginResponse;
import com.ecommerce.ecommerce_backend.model.User;
import com.ecommerce.ecommerce_backend.repository.UserRepository;
import com.ecommerce.ecommerce_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class UserController {

    @Autowired
    private UserService service;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ================= REGISTER =================
    @PostMapping("/register")
    public LoginResponse register(@RequestBody User user) {
        System.out.println("Received registration: " + user.getName() + ", " + user.getEmail());

        User savedUser = service.register(user);

        return new LoginResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().replace("ROLE_", ""),
                "Registered Successfully"
        );
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest req) {
        return service.login(req.getEmail(), req.getPassword());
    }

    // ================= PROFILE UPDATE =================
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> updates,
                                           Authentication auth) {
        try {

            // ✅ FIX 1: Prevent null crash
            User user = userRepository.findByEmail(auth.getName());
            if (user == null) {
                return ResponseEntity.status(404)
                        .body(Map.of("error", "User not found"));
            }

            if (updates.containsKey("name")) {
                user.setName(updates.get("name"));
            }

            if (updates.containsKey("email")) {

                User existing = userRepository.findByEmail(updates.get("email"));

                if (existing != null && !existing.getId().equals(user.getId())) {
                    return ResponseEntity.status(400)
                            .body(Map.of("error", "Email already exists"));
                }

                user.setEmail(updates.get("email"));
            }

            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }

    // ================= CHANGE PASSWORD =================
    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwords,
                                            Authentication auth) {

        try {

            System.out.println("===== CHANGE PASSWORD API =====");

            if (auth == null) {
                System.out.println("AUTH IS NULL");
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Unauthorized"));
            }

            System.out.println("Authenticated user: " + auth.getName());

            User user = userRepository.findByEmail(auth.getName());

            if (user == null) {
                System.out.println("USER NOT FOUND IN DB");
                return ResponseEntity.status(404)
                        .body(Map.of("error", "User not found"));
            }

            String currentPassword = passwords.get("currentPassword");
            String newPassword = passwords.get("newPassword");

            System.out.println("Current password received");
            System.out.println("New password received");

            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.status(400)
                        .body(Map.of("error", "Passwords are required"));
            }

            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.status(400)
                        .body(Map.of("error", "Current password is incorrect"));
            }

            user.setPassword(passwordEncoder.encode(newPassword));

            userRepository.save(user);

            System.out.println("PASSWORD UPDATED SUCCESSFULLY");

            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}