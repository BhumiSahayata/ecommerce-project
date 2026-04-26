package com.ecommerce.ecommerce_backend.service;

import com.ecommerce.ecommerce_backend.dto.LoginResponse;
import com.ecommerce.ecommerce_backend.model.User;
import com.ecommerce.ecommerce_backend.repository.UserRepository;
import com.ecommerce.ecommerce_backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(User user) {
        // Check if email exists
        User existingUser = repo.findByEmail(user.getEmail());
        if (existingUser != null) {
            throw new RuntimeException("Email already exists");
        }

        // IMPORTANT: Log the incoming role
        System.out.println("=== INCOMING REGISTRATION ===");
        System.out.println("Email: " + user.getEmail());
        System.out.println("Raw role from request: '" + user.getRole() + "'");

        // Set role correctly - THIS IS THE CRITICAL PART
        String requestedRole = user.getRole();
        String finalRole;

        if (requestedRole == null || requestedRole.trim().isEmpty()) {
            finalRole = "ROLE_USER";
            System.out.println("Role was null/empty, setting to ROLE_USER");
        } else if (requestedRole.equalsIgnoreCase("MERCHANT")) {
            finalRole = "ROLE_MERCHANT";
            System.out.println("Role is MERCHANT, setting to ROLE_MERCHANT");
        } else if (requestedRole.equalsIgnoreCase("USER")) {
            finalRole = "ROLE_USER";
            System.out.println("Role is USER, setting to ROLE_USER");
        } else {
            finalRole = "ROLE_" + requestedRole.toUpperCase();
            System.out.println("Role is other, setting to: " + finalRole);
        }

        user.setRole(finalRole);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User savedUser = repo.save(user);
        System.out.println("SAVED USER ROLE: " + savedUser.getRole());
        System.out.println("============================");

        return savedUser;
    }

    public LoginResponse login(String email, String password) {
        User user = repo.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Wrong password");
        }

        String cleanRole = user.getRole().replace("ROLE_", "");
        String token = JwtUtil.generateToken(user.getEmail(), user.getRole());

        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                cleanRole,
                token
        );
    }
}