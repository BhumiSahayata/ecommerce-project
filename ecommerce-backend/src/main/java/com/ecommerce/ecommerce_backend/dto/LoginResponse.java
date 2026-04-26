package com.ecommerce.ecommerce_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String token;

    // Add this for debugging
    @Override
    public String toString() {
        return "LoginResponse{id=" + id + ", name=" + name + ", email=" + email + ", role=" + role + "}";
    }
}