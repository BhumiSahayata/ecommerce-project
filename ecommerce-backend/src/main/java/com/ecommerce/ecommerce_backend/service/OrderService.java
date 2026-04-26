package com.ecommerce.ecommerce_backend.service;

import com.ecommerce.ecommerce_backend.dto.AddressRequest;
import com.ecommerce.ecommerce_backend.model.*;
import com.ecommerce.ecommerce_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private CartRepository cartRepo;

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private EmailService emailService;

    public Order placeOrder(User user, AddressRequest address) {
        Cart cart = cartRepo.findByUser(user);
        if (cart == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Check stock before placing order
        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepo.findById(cartItem.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + cartItem.getProductId()));

            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for " + product.getName() +
                        ". Only " + product.getStockQuantity() + " left!");
            }
        }

        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PLACED");

        order.setShippingStreet(address.getStreet());
        order.setShippingCity(address.getCity());
        order.setShippingState(address.getState());
        order.setShippingPincode(address.getPincode());
        order.setShippingCountry(address.getCountry());

        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0;

        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepo.findById(cartItem.getProductId()).orElse(null);
            if (product == null) continue;

            // Reduce stock quantity
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            product.setInStock(product.getStockQuantity() > 0);
            productRepo.save(product);

            OrderItem item = new OrderItem();
            item.setProductId(cartItem.getProductId());
            item.setQuantity(cartItem.getQuantity());
            item.setPrice(product.getPrice());
            item.setOrder(order);

            total += product.getPrice() * cartItem.getQuantity();
            orderItems.add(item);
        }

        order.setItems(orderItems);
        order.setTotalAmount(total);
        Order savedOrder = orderRepo.save(order);
        cartService.clearCart(user);

        // Send email notification
        emailService.sendOrderConfirmation(user.getEmail(), user.getName(), savedOrder.getId(), total);

        return savedOrder;
    }

    public List<Order> getOrders(User user) {
        return orderRepo.findByUser(user);
    }

    // ✅ FIXED: Merchants can see ALL orders (not just their products)
    public List<Order> getOrdersForMerchant(Long merchantId) {
        // Merchants can see all orders regardless of their products
        return orderRepo.findAll();
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        Order updatedOrder = orderRepo.save(order);

        // Send email notification
        emailService.sendOrderStatusUpdate(
                order.getUser().getEmail(),
                order.getUser().getName(),
                order.getId(),
                status
        );

        return updatedOrder;
    }

    public Order cancelOrder(Long orderId, User user) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only cancel your own orders");
        }

        if (order.getStatus().equals("SHIPPED") || order.getStatus().equals("DELIVERED")) {
            throw new RuntimeException("Order cannot be cancelled. Already " + order.getStatus().toLowerCase());
        }

        // Restore stock for cancelled order items
        for (OrderItem item : order.getItems()) {
            Product product = productRepo.findById(item.getProductId()).orElse(null);
            if (product != null) {
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                product.setInStock(true);
                productRepo.save(product);
            }
        }

        order.setStatus("CANCELLED");
        return orderRepo.save(order);
    }
}