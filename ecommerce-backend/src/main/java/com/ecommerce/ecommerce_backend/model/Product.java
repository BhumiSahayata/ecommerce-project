package com.ecommerce.ecommerce_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private double price;

    private String category;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    private double rating;

    private Long merchantId;

    // Add these new fields
    private int stockQuantity = 0;
    private boolean inStock = true;
}