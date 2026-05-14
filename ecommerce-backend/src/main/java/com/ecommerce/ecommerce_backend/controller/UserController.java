package com.ecommerce.ecommerce_backend.controller;

import com.ecommerce.ecommerce_backend.dto.UpdateProfileRequest;
import com.ecommerce.ecommerce_backend.model.User;
import com.ecommerce.ecommerce_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // GET PROFILE
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {

        User user = userRepository.findByEmail(auth.getName());

        if (user == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "User not found"));
        }

        return ResponseEntity.ok(user);
    }

    // UPDATE PROFILE (NAME + EMAIL)
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication auth) {

        User user = userRepository.findByEmail(auth.getName());

        if (user == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "User not found"));
        }

        // email already exists check
        User existing = userRepository.findByEmail(request.getEmail());
        if (existing != null && !existing.getId().equals(user.getId())) {
            return ResponseEntity.status(400)
                    .body(Map.of("error", "Email already in use"));
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "user", user
        ));
    }
}