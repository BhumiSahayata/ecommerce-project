package com.ecommerce.ecommerce_backend.repository;

import com.ecommerce.ecommerce_backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}