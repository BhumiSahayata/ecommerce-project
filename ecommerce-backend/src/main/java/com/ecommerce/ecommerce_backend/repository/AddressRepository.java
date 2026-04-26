package com.ecommerce.ecommerce_backend.repository;

import com.ecommerce.ecommerce_backend.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserId(Long userId);
}