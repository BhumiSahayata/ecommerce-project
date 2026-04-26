package com.ecommerce.ecommerce_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOrderConfirmation(String toEmail, String userName, Long orderId, double amount) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("🎉 Order Confirmed! - ShopEase Order #" + orderId);
            message.setText(
                    "Dear " + userName + ",\n\n" +
                            "Thank you for shopping with ShopEase! 🛍️\n\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "✅ ORDER CONFIRMED\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                            "Order ID: #" + orderId + "\n" +
                            "Total Amount: ₹" + String.format("%.2f", amount) + "\n" +
                            "Payment Method: Cash on Delivery\n\n" +
                            "Your order has been placed successfully.\n" +
                            "You can track your order status in your account.\n\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "Thank you for shopping with ShopEase!\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                            "Best regards,\n" +
                            "ShopEase Team\n" +
                            "📧 support@shopease.com"
            );
            mailSender.send(message);
            System.out.println("✅ Order confirmation email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email: " + e.getMessage());
        }
    }

    public void sendOrderStatusUpdate(String toEmail, String userName, Long orderId, String status) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("📦 Order Status Update - ShopEase Order #" + orderId);

            String statusMessage = "";
            switch(status.toUpperCase()) {
                case "PLACED":
                    statusMessage = "✅ Your order has been placed and is awaiting confirmation.";
                    break;
                case "PACKED":
                    statusMessage = "📦 Your order has been packed and is ready for shipping.";
                    break;
                case "SHIPPED":
                    statusMessage = "🚚 Your order is on the way! It has been shipped.";
                    break;
                case "DELIVERED":
                    statusMessage = "🎉 Your order has been delivered! Thank you for shopping with us.";
                    break;
                case "CANCELLED":
                    statusMessage = "❌ Your order has been cancelled. Contact support for details.";
                    break;
            }

            message.setText(
                    "Dear " + userName + ",\n\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "📦 ORDER STATUS UPDATE\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                            "Order ID: #" + orderId + "\n" +
                            "New Status: " + status.toUpperCase() + "\n" +
                            "Status: " + statusMessage + "\n\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "Track your order in your account dashboard.\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                            "Thank you for shopping with ShopEase!\n\n" +
                            "Best regards,\n" +
                            "ShopEase Team"
            );
            mailSender.send(message);
            System.out.println("✅ Status update email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send status email: " + e.getMessage());
        }
    }
}