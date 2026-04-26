package com.ecommerce.ecommerce_backend.repository;

import com.ecommerce.ecommerce_backend.model.User;
import com.ecommerce.ecommerce_backend.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Cart findByUser(User user);
}
