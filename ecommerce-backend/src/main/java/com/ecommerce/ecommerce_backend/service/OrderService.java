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
    private OrderItemRepository orderItemRepo;  // ✅ Add this

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
            item.setStatus("PLACED");  // ✅ Each item starts with PLACED
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

    // ✅ Merchant: Update status for a specific order item (product)
    public OrderItem updateOrderItemStatus(Long orderItemId, String status, Long merchantId) {
        OrderItem orderItem = orderItemRepo.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Order item not found"));

        // Verify this product belongs to this merchant
        Product product = productRepo.findById(orderItem.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getMerchantId().equals(merchantId)) {
            throw new RuntimeException("You can only update status for your own products");
        }

        orderItem.setStatus(status);
        OrderItem updatedItem = orderItemRepo.save(orderItem);

        // Send email notification to user
        Order order = orderRepo.findById(updatedItem.getOrder().getId()).orElse(null);
        if (order != null) {
            emailService.sendOrderStatusUpdate(
                    order.getUser().getEmail(),
                    order.getUser().getName(),
                    order.getId(),
                    product.getName() + ": " + status
            );
        }

        return updatedItem;
    }

    // Get orders for merchant (filtered by their products)
    public List<Order> getOrdersForMerchant(Long merchantId) {
        List<Product> myProducts = productRepo.findByMerchantId(merchantId);
        if (myProducts.isEmpty()) return new ArrayList<>();

        List<Long> myProductIds = myProducts.stream()
                .map(Product::getId)
                .collect(Collectors.toList());

        List<Order> allOrders = orderRepo.findAll();
        List<Order> myOrders = new ArrayList<>();

        for (Order order : allOrders) {
            // Check if order contains merchant's products
            List<OrderItem> myItems = order.getItems().stream()
                    .filter(item -> myProductIds.contains(item.getProductId()))
                    .collect(Collectors.toList());

            if (!myItems.isEmpty()) {
                Order filteredOrder = new Order();
                filteredOrder.setId(order.getId());
                filteredOrder.setUser(order.getUser());
                filteredOrder.setTotalAmount(myItems.stream()
                        .mapToDouble(item -> item.getPrice() * item.getQuantity())
                        .sum());
                filteredOrder.setOrderDate(order.getOrderDate());
                filteredOrder.setShippingStreet(order.getShippingStreet());
                filteredOrder.setShippingCity(order.getShippingCity());
                filteredOrder.setShippingState(order.getShippingState());
                filteredOrder.setShippingPincode(order.getShippingPincode());
                filteredOrder.setShippingCountry(order.getShippingCountry());
                filteredOrder.setItems(myItems);
                myOrders.add(filteredOrder);
            }
        }
        return myOrders;
    }

    public Order cancelOrder(Long orderId, User user) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only cancel your own orders");
        }

        // Cancel all items that are not yet shipped/delivered
        for (OrderItem item : order.getItems()) {
            if (!item.getStatus().equals("SHIPPED") && !item.getStatus().equals("DELIVERED")) {
                item.setStatus("CANCELLED");

                // Restore stock
                Product product = productRepo.findById(item.getProductId()).orElse(null);
                if (product != null) {
                    product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                    product.setInStock(true);
                    productRepo.save(product);
                }
            }
        }

        return orderRepo.save(order);
    }
}