package com.ecommerce.ecommerce_backend.controller;

import com.ecommerce.ecommerce_backend.model.Cart;
import com.ecommerce.ecommerce_backend.model.User;
import com.ecommerce.ecommerce_backend.repository.UserRepository;
import com.ecommerce.ecommerce_backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService service;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/add")
    public Cart addToCart(
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") int quantity
    ) {
        User user = getLoggedInUser();
        return service.addToCart(user, productId, quantity);
    }

    @DeleteMapping("/remove")
    public Cart removeFromCart(@RequestParam Long productId) {
        User user = getLoggedInUser();
        return service.removeFromCart(user, productId);
    }

    @GetMapping
    public Cart getCart() {
        User user = getLoggedInUser();
        return service.getCart(user);
    }

    @DeleteMapping("/clear")
    public String clearCart() {
        User user = getLoggedInUser();
        service.clearCart(user);
        return "Cart cleared";
    }

    private User getLoggedInUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName());
    }
}