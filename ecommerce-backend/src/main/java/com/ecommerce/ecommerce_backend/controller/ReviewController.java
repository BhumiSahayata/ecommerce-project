package com.ecommerce.ecommerce_backend.controller;

import com.ecommerce.ecommerce_backend.model.Product;
import com.ecommerce.ecommerce_backend.model.Review;
import com.ecommerce.ecommerce_backend.model.User;
import com.ecommerce.ecommerce_backend.repository.ProductRepository;
import com.ecommerce.ecommerce_backend.repository.ReviewRepository;
import com.ecommerce.ecommerce_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;  // ✅ ADD THIS LINE

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody Review review) {
        try {
            User user = getLoggedInUser();
            review.setUserId(user.getId());
            review.setUserName(user.getName());
            review.setCreatedAt(LocalDateTime.now());
            Review savedReview = reviewRepository.save(review);
            return ResponseEntity.ok(savedReview);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/product/{productId}")
    public List<Review> getProductReviews(@PathVariable Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    // ✅ GET reviews for merchant's products
    @GetMapping("/merchant")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<?> getMerchantReviews() {
        try {
            User user = getLoggedInUser();
            // Get all products of this merchant
            List<Product> merchantProducts = productRepository.findByMerchantId(user.getId());
            List<Long> productIds = merchantProducts.stream()
                    .map(Product::getId)
                    .collect(Collectors.toList());

            // Get reviews for those products
            List<Review> merchantReviews = reviewRepository.findByProductIdInOrderByCreatedAtDesc(productIds);
            return ResponseEntity.ok(merchantReviews);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    private User getLoggedInUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName());
    }
}