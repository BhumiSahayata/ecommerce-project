package com.ecommerce.ecommerce_backend.dto;

import lombok.Data;

@Data
public class AddressRequest {
    private String street;
    private String city;
    private String state;
    private String pincode;
    private String country;
}