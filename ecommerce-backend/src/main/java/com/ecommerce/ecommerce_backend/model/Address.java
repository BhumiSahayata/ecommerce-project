package com.ecommerce.ecommerce_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String street;
    private String city;
    private String state;
    private String pincode;
    private String country;
}