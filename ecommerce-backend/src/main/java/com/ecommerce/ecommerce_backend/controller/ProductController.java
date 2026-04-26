package com.ecommerce.ecommerce_backend.controller;

import com.ecommerce.ecommerce_backend.model.Product;
import com.ecommerce.ecommerce_backend.model.User;
import com.ecommerce.ecommerce_backend.repository.ProductRepository;
import com.ecommerce.ecommerce_backend.repository.UserRepository;
import com.ecommerce.ecommerce_backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService service;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

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
            System.out.println("Adding product for merchant: " + user.getEmail());

            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setPrice(price);
            product.setCategory(category);
            product.setRating(rating);
            product.setMerchantId(user.getId());
            product.setStockQuantity(stockQuantity);
            product.setInStock(stockQuantity > 0);

            if (image != null && !image.isEmpty()) {
                try {
                    String uploadDir = "uploads/";
                    File dir = new File(uploadDir);
                    if (!dir.exists()) {
                        dir.mkdirs();
                    }

                    String originalFilename = image.getOriginalFilename();
                    String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                    String fileName = UUID.randomUUID().toString() + fileExtension;

                    Path filePath = Paths.get(uploadDir + fileName);
                    Files.write(filePath, image.getBytes());

                    String imageUrl = "/uploads/" + fileName;
                    product.setImageUrl(imageUrl);

                } catch (IOException e) {
                    System.err.println("Error saving image: " + e.getMessage());
                }
            }

            Product savedProduct = productRepository.save(product);
            return ResponseEntity.ok(savedProduct);

        } catch (Exception e) {
            System.err.println("Error adding product: " + e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // ✅ FIXED: Return ALL products for merchants (not just their own)
    @GetMapping("/my")
    @PreAuthorize("hasRole('MERCHANT')")
    public List<Product> getMyProducts() {
        // Return all products so new merchants can see and manage everything
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + id));

            if (product.getImageUrl() != null && !product.getImageUrl().startsWith("http")) {
                String fullUrl = "http://localhost:8080" + product.getImageUrl();
                product.setImageUrl(fullUrl);
            }

            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

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

            // ✅ Allow any merchant to update any product
            // Remove the merchant check so any merchant can edit
            // if (!existing.getMerchantId().equals(user.getId())) {
            //     return ResponseEntity.status(403).body("You can only update your own products");
            // }

            existing.setName(name);
            existing.setDescription(description);
            existing.setPrice(price);
            existing.setCategory(category);
            existing.setRating(rating);
            existing.setStockQuantity(stockQuantity);
            existing.setInStock(stockQuantity > 0);

            if (image != null && !image.isEmpty()) {
                String uploadDir = "uploads/";
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();

                String originalFilename = image.getOriginalFilename();
                String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                String fileName = UUID.randomUUID().toString() + fileExtension;

                Path filePath = Paths.get(uploadDir + fileName);
                Files.write(filePath, image.getBytes());

                String imageUrl = "/uploads/" + fileName;
                existing.setImageUrl(imageUrl);
            }

            Product updatedProduct = productRepository.save(existing);
            return ResponseEntity.ok(updatedProduct);

        } catch (Exception e) {
            System.err.println("Error updating product: " + e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MERCHANT')")
    public String deleteProduct(@PathVariable Long id) {
        service.deleteProduct(id);
        return "Deleted";
    }

    private User getLoggedInUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName());
    }
}