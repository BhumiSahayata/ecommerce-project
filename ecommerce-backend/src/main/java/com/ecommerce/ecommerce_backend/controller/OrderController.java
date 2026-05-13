package com.ecommerce.ecommerce_backend.controller;

import com.ecommerce.ecommerce_backend.dto.AddressRequest;
import com.ecommerce.ecommerce_backend.model.Order;
import com.ecommerce.ecommerce_backend.model.OrderItem;
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
import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService service;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@RequestBody AddressRequest address) {
        try {
            User user = getLoggedInUser();
            Order order = service.placeOrder(user, address);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public List<Order> getOrders() {
        return service.getOrders(getLoggedInUser());
    }

    @GetMapping("/merchant")
    @PreAuthorize("hasRole('MERCHANT')")
    public List<Order> getMerchantOrders() {
        User user = getLoggedInUser();
        return service.getOrdersForMerchant(user.getId());
    }

    // ✅ Update status for a specific order item
    @PutMapping("/item/{orderItemId}/status")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<?> updateOrderItemStatus(
            @PathVariable Long orderItemId,
            @RequestParam String status) {
        try {
            User user = getLoggedInUser();
            OrderItem updatedItem = service.updateOrderItemStatus(orderItemId, status, user.getId());
            return ResponseEntity.ok(updatedItem);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ ADD THIS MISSING ENDPOINT - Update MAIN ORDER status
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        try {
            User user = getLoggedInUser();
            Order updatedOrder = service.updateOrderStatus(orderId, status, user.getId());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Order status updated to " + status,
                    "order", updatedOrder
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        try {
            User user = getLoggedInUser();
            Order order = service.cancelOrder(orderId, user);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    private User getLoggedInUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        User user = userRepository.findByEmail(auth.getName());

        if(user == null){
            throw new RuntimeException("User not found");
        }

        return user;
    }
}