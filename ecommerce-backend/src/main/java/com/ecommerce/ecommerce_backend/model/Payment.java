package com.ecommerce.ecommerce_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;

    private String paymentMethod;
    // COD, CARD (future)

    private String status;
    // PENDING, PAID, FAILED

    private double amount;
}