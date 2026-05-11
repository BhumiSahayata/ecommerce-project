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
    private OrderItemRepository orderItemRepo;

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductRepository productRepo;

    public Order placeOrder(User user, AddressRequest address) {

        Cart cart = cartRepo.findByUser(user);

        if (cart == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Check stock
        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepo.findById(cartItem.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for " + product.getName() + ". Only " + product.getStockQuantity() + " left!");
            }
        }

        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PLACED"); // ✅ Set initial status

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

            // Reduce stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            product.setInStock(product.getStockQuantity() > 0);
            productRepo.save(product);

            OrderItem item = new OrderItem();
            item.setProductId(cartItem.getProductId());
            item.setQuantity(cartItem.getQuantity());
            item.setPrice(product.getPrice());
            item.setStatus("PLACED");
            item.setOrder(order);

            total += product.getPrice() * cartItem.getQuantity();
            orderItems.add(item);
        }

        order.setItems(orderItems);
        order.setTotalAmount(total);

        Order savedOrder = orderRepo.save(order);
        cartService.clearCart(user);

        return savedOrder;
    }

    public List<Order> getOrders(User user) {
        return orderRepo.findByUser(user);
    }

    // Merchant updates individual order item status
    public OrderItem updateOrderItemStatus(Long orderItemId, String status, Long merchantId) {
        OrderItem orderItem = orderItemRepo.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Order item not found"));

        Product product = productRepo.findById(orderItem.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // ✅ Fix: Use merchantId correctly
        if (!product.getMerchantId().equals(merchantId)) {
            throw new RuntimeException("You can only update your own products");
        }

        orderItem.setStatus(status);
        return orderItemRepo.save(orderItem);
    }

    // ✅ FIXED: Update main order status
    public Order updateOrderStatus(Long orderId, String status, Long merchantId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // ✅ FIXED: Verify this order belongs to merchant's products
        boolean isMerchantOrder = order.getItems().stream()
                .anyMatch(item -> {
                    Product product = productRepo.findById(item.getProductId()).orElse(null);
                    return product != null && product.getMerchantId().equals(merchantId);
                });

        if (!isMerchantOrder) {
            throw new RuntimeException("You are not authorized to update this order");
        }

        // Update the main order status
        order.setStatus(status);

        // Update all order items to same status (optional but consistent)
        for (OrderItem item : order.getItems()) {
            item.setStatus(status);
            orderItemRepo.save(item);
        }

        return orderRepo.save(order);
    }

    // Merchant Orders - Get orders containing merchant's products
    public List<Order> getOrdersForMerchant(Long merchantId) {
        List<Product> myProducts = productRepo.findByMerchantId(merchantId);

        if (myProducts.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> myProductIds = myProducts.stream()
                .map(Product::getId)
                .collect(Collectors.toList());

        List<Order> allOrders = orderRepo.findAll();
        List<Order> myOrders = new ArrayList<>();

        for (Order order : allOrders) {
            List<OrderItem> myItems = order.getItems().stream()
                    .filter(item -> myProductIds.contains(item.getProductId()))
                    .collect(Collectors.toList());

            if (!myItems.isEmpty()) {
                Order filteredOrder = new Order();
                filteredOrder.setId(order.getId());
                filteredOrder.setUser(order.getUser());
                filteredOrder.setStatus(order.getStatus()); // ✅ Include status
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

    // Cancel order - User side
    public Order cancelOrder(Long orderId, User user) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Check if user owns this order
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only cancel your own orders");
        }

        // Check if order can be cancelled (not already shipped/delivered)
        String currentStatus = order.getStatus();
        if (currentStatus.equals("SHIPPED") || currentStatus.equals("DELIVERED")) {
            throw new RuntimeException("Order cannot be cancelled. Already " + currentStatus.toLowerCase());
        }

        // Update order status to CANCELLED
        order.setStatus("CANCELLED");

        // Update each item status to CANCELLED and restore stock
        for (OrderItem item : order.getItems()) {
            String itemStatus = item.getStatus();
            if (!itemStatus.equals("SHIPPED") && !itemStatus.equals("DELIVERED")) {
                item.setStatus("CANCELLED");
                orderItemRepo.save(item);

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