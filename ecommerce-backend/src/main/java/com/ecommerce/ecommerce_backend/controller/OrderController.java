package com.ecommerce.ecommerce_backend.controller;

import com.ecommerce.ecommerce_backend.dto.AddressRequest;
import com.ecommerce.ecommerce_backend.model.Order;
import com.ecommerce.ecommerce_backend.model.User;
import com.ecommerce.ecommerce_backend.repository.UserRepository;
import com.ecommerce.ecommerce_backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService service;

    @Autowired
    private UserRepository userRepository;

    // USER: place order from cart with address
    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@RequestBody AddressRequest address) {
        try {
            User user = getLoggedInUser();
            Order order = service.placeOrder(user, address);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // USER: get own orders
    @GetMapping
    public List<Order> getOrders() {
        return service.getOrders(getLoggedInUser());
    }




    // MERCHANT: get orders containing their products
    @GetMapping("/merchant")
    @PreAuthorize("hasRole('MERCHANT')")
    public List<Order> getMerchantOrders() {
        User user = getLoggedInUser();
        return service.getOrdersForMerchant(user.getId());
    }

    // MERCHANT: update order status
    @PutMapping("/{orderId}/status")
    public Order updateStatus(@PathVariable Long orderId, @RequestParam String status) {
        return service.updateOrderStatus(orderId, status);
    }

    // Add this method to OrderController.java
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        try {
            User user = getLoggedInUser();
            Order order = service.cancelOrder(orderId, user);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    private User getLoggedInUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName());
    }
}