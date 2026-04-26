package com.ecommerce.ecommerce_backend.service;

import com.ecommerce.ecommerce_backend.model.Payment;
import com.ecommerce.ecommerce_backend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository repo;

    // CREATE PAYMENT (AUTO FOR COD)
    public Payment createPayment(Long orderId, double amount) {

        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setAmount(amount);
        payment.setPaymentMethod("COD");
        payment.setStatus("PENDING");

        return repo.save(payment);
    }

    // UPDATE PAYMENT STATUS
    public Payment updateStatus(Long paymentId, String status) {
        Payment payment = repo.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(status);
        return repo.save(payment);
    }
}