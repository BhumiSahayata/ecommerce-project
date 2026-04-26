package com.ecommerce.ecommerce_backend.controller;

import com.ecommerce.ecommerce_backend.model.Payment;
import com.ecommerce.ecommerce_backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Autowired
    private PaymentService service;

    @PostMapping("/{orderId}/{amount}")
    public Payment create(@PathVariable Long orderId,
                          @PathVariable double amount) {
        return service.createPayment(orderId, amount);
    }

    @PutMapping("/update/{id}")
    public Payment update(@PathVariable Long id,
                          @RequestParam String status) {
        return service.updateStatus(id, status);
    }
}