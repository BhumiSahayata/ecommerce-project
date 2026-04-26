package com.ecommerce.ecommerce_backend.controller;

import com.ecommerce.ecommerce_backend.model.User;
import com.ecommerce.ecommerce_backend.model.WishlistItem;
import com.ecommerce.ecommerce_backend.repository.UserRepository;
import com.ecommerce.ecommerce_backend.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService service;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/add")
    public WishlistItem add(@RequestParam Long productId) {
        return service.addToWishlist(getLoggedInUser(), productId);
    }

    @GetMapping
    public List<WishlistItem> get() {
        return service.getWishlist(getLoggedInUser());
    }

    @DeleteMapping("/remove")
    public String remove(@RequestParam Long productId) {
        service.removeFromWishlist(getLoggedInUser(), productId);
        return "Removed from wishlist";
    }

    private User getLoggedInUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName());
    }
}