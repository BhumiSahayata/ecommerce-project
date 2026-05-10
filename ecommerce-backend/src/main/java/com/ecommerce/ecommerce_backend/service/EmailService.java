package com.ecommerce.ecommerce_backend.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    // EMAIL TEMPORARILY DISABLED

    public void sendOrderConfirmation(
            String toEmail,
            String userName,
            Long orderId,
            double amount
    ) {

        System.out.println(
                "Mock Order Confirmation Email Sent to: " + toEmail
        );
    }

    public void sendOrderStatusUpdate(
            String toEmail,
            String userName,
            Long orderId,
            String status
    ) {

        System.out.println(
                "Mock Status Update Email Sent to: " + toEmail
        );
    }
}