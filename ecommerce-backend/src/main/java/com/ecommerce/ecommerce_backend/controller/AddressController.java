package com.ecommerce.ecommerce_backend.controller;

import com.ecommerce.ecommerce_backend.model.Address;
import com.ecommerce.ecommerce_backend.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/address")
public class AddressController {

    @Autowired
    private AddressService service;

    @PostMapping
    public Address add(@RequestBody Address address) {
        return service.addAddress(address);
    }

    @GetMapping("/{userId}")
    public List<Address> get(@PathVariable Long userId) {
        return service.getUserAddresses(userId);
    }
}