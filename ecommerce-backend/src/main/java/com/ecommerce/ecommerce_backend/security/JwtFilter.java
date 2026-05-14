package com.ecommerce.ecommerce_backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {

            // Allow OPTIONS (CORS)
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                filterChain.doFilter(request, response);
                return;
            }

            String path = request.getRequestURI();

            // ✅ PUBLIC APIs ONLY (NO TOKEN REQUIRED)
            if (
                    path.equals("/auth/login") ||
                            path.equals("/auth/register") ||
                            path.startsWith("/uploads") ||
                            path.equals("/products/all") ||
                            path.matches("/products/\\d+")
            ) {
                filterChain.doFilter(request, response);
                return;
            }

            // 🔐 ALL OTHER APIs REQUIRE TOKEN
            String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"Missing token\"}");
                return;
            }

            String token = authHeader.substring(7);

            if (!JwtUtil.validateToken(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
                return;
            }

            String email = JwtUtil.extractEmail(token);
            String role = JwtUtil.extractRole(token);

            if (email == null || role == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"Invalid token\"}");
                return;
            }

            // FIX ROLE FORMAT
            if (!role.startsWith("ROLE_")) {
                role = "ROLE_" + role;
            }

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            List.of(new SimpleGrantedAuthority(role))
                    );

            SecurityContextHolder.getContext().setAuthentication(auth);

            request.setAttribute("email", email);
            request.setAttribute("role", role);

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Auth failed\"}");
        }
    }
}