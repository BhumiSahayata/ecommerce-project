package com.ecommerce.ecommerce_backend.repository;

import com.ecommerce.ecommerce_backend.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}