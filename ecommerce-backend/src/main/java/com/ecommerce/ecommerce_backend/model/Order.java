package com.ecommerce.ecommerce_backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private double totalAmount;

    // ❌ REMOVE this line - status is now per item
    // private String status;

    private LocalDateTime orderDate;

    // Address fields
    private String shippingStreet;
    private String shippingCity;
    private String shippingState;
    private String shippingPincode;
    private String shippingCountry;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<OrderItem> items = new ArrayList<>();
}