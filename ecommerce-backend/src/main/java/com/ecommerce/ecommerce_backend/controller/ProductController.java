package com.ecommerce.ecommerce_backend.controller;

import com.ecommerce.ecommerce_backend.model.Product;
import com.ecommerce.ecommerce_backend.model.User;
import com.ecommerce.ecommerce_backend.repository.ProductRepository;
import com.ecommerce.ecommerce_backend.repository.UserRepository;
import com.ecommerce.ecommerce_backend.service.ImageKitService;
import com.ecommerce.ecommerce_backend.service.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService service;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ImageKitService imageKitService;

    // ✅ ADD PRODUCT
    @PostMapping("/add")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<?> addProduct(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam double price,
            @RequestParam String category,
            @RequestParam(defaultValue = "0") double rating,
            @RequestParam(defaultValue = "0") int stockQuantity,
            @RequestParam(required = false) MultipartFile image
    ) {
        try {
            User user = getLoggedInUser();

            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setPrice(price);
            product.setCategory(category);
            product.setRating(rating);
            product.setMerchantId(user.getId());
            product.setStockQuantity(stockQuantity);
            product.setInStock(stockQuantity > 0);

            // ✅ Upload to ImageKit ONLY (no fallback)
            if (image != null && !image.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                String imageUrl = imageKitService.uploadImage(image, fileName);
                product.setImageUrl(imageUrl);
            }

            Product savedProduct = productRepository.save(product);
            return ResponseEntity.ok(savedProduct);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // ✅ GET ALL PRODUCTS
    @GetMapping("/all")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // ✅ GET MY PRODUCTS
    @GetMapping("/my")
    @PreAuthorize("hasRole('MERCHANT')")
    public List<Product> getMyProducts() {
        User user = getLoggedInUser();
        return productRepository.findByMerchantId(user.getId());
    }

    // ✅ GET PRODUCT BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // ✅ UPDATE PRODUCT (FIXED → IMAGEKIT USED)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam double price,
            @RequestParam String category,
            @RequestParam(defaultValue = "0") double rating,
            @RequestParam(defaultValue = "0") int stockQuantity,
            @RequestParam(required = false) MultipartFile image
    ) {
        try {
            User user = getLoggedInUser();

            Product existing = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (!existing.getMerchantId().equals(user.getId())) {
                return ResponseEntity.status(403).body("You can only update your own products");
            }

            existing.setName(name);
            existing.setDescription(description);
            existing.setPrice(price);
            existing.setCategory(category);
            existing.setRating(rating);
            existing.setStockQuantity(stockQuantity);
            existing.setInStock(stockQuantity > 0);

            // ✅ Upload new image to ImageKit
            if (image != null && !image.isEmpty()) {
                String imageUrl = imageKitService.uploadImage(image, image.getOriginalFilename());
                existing.setImageUrl(imageUrl);
            }

            Product updated = productRepository.save(existing);
            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // ✅ DELETE PRODUCT
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            User user = getLoggedInUser();

            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (!product.getMerchantId().equals(user.getId())) {
                return ResponseEntity.status(403).body("You can only delete your own products");
            }

            service.deleteProduct(id);
            return ResponseEntity.ok("Deleted successfully");

        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    private User getLoggedInUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName());
    }
}