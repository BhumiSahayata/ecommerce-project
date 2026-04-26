package com.ecommerce.ecommerce_backend.service;

import com.ecommerce.ecommerce_backend.model.Address;
import com.ecommerce.ecommerce_backend.repository.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {

    @Autowired
    private AddressRepository repo;

    public Address addAddress(Address address) {
        return repo.save(address);
    }

    public List<Address> getUserAddresses(Long userId) {
        return repo.findByUserId(userId);
    }
}