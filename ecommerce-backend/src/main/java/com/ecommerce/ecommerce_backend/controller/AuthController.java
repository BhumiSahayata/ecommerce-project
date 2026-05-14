package com.ecommerce.ecommerce_backend.controller;

import com.ecommerce.ecommerce_backend.dto.ChangePasswordRequest;
import com.ecommerce.ecommerce_backend.dto.LoginRequest;
import com.ecommerce.ecommerce_backend.dto.LoginResponse;
import com.ecommerce.ecommerce_backend.model.User;
import com.ecommerce.ecommerce_backend.repository.UserRepository;
import com.ecommerce.ecommerce_backend.service.UserService;
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

    @Autowired
    private UserService userService;

    // REGISTER
    @PostMapping("/register")
    public LoginResponse register(@RequestBody User user) {
        User savedUser = userService.register(user);

        return new LoginResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().replace("ROLE_", ""),
                "Registered Successfully"
        );
    }

    // LOGIN
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest req) {
        return userService.login(req.getEmail(), req.getPassword());
    }

    // CHANGE PASSWORD
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication auth) {

        User user = userRepository.findByEmail(auth.getName());

        if (user == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "User not found"));
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.status(400)
                    .body(Map.of("error", "Current password is incorrect"));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Password changed successfully"
        ));
    }
}