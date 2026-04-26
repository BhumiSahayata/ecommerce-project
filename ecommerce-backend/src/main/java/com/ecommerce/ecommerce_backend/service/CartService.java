package com.ecommerce.ecommerce_backend.service;

import com.ecommerce.ecommerce_backend.model.Cart;
import com.ecommerce.ecommerce_backend.model.CartItem;
import com.ecommerce.ecommerce_backend.model.Product;
import com.ecommerce.ecommerce_backend.model.User;
import com.ecommerce.ecommerce_backend.repository.CartRepository;
import com.ecommerce.ecommerce_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepo;

    @Autowired
    private ProductRepository productRepo;  // Add this

    public Cart addToCart(User user, Long productId, int quantity) {
        // ✅ STOCK CHECK - Added here
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Not enough stock available. Only " +
                    product.getStockQuantity() + " left!");
        }

        Cart cart = cartRepo.findByUser(user);
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
        }

        CartItem existingItem = cart.getItems()
                .stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + quantity;
            if (product.getStockQuantity() < newQuantity) {
                throw new RuntimeException("Not enough stock. You already have " +
                        existingItem.getQuantity() + " in cart, only " +
                        product.getStockQuantity() + " available!");
            }
            existingItem.setQuantity(newQuantity);
        } else {
            CartItem item = new CartItem();
            item.setProductId(productId);
            item.setQuantity(quantity);
            item.setCart(cart);
            cart.getItems().add(item);
        }

        return cartRepo.save(cart);
    }

    public Cart removeFromCart(User user, Long productId) {
        Cart cart = cartRepo.findByUser(user);
        if (cart != null) {
            cart.getItems().removeIf(item -> item.getProductId().equals(productId));
            return cartRepo.save(cart);
        }
        throw new RuntimeException("Cart not found");
    }

    public Cart getCart(User user) {
        Cart cart = cartRepo.findByUser(user);
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            return cartRepo.save(cart);
        }
        return cart;
    }

    public void clearCart(User user) {
        Cart cart = cartRepo.findByUser(user);
        if (cart != null) {
            cart.getItems().clear();
            cartRepo.save(cart);
        }
    }
}