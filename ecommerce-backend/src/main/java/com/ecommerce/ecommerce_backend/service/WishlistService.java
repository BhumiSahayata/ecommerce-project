package com.ecommerce.ecommerce_backend.service;

import com.ecommerce.ecommerce_backend.model.User;
import com.ecommerce.ecommerce_backend.model.WishlistItem;
import com.ecommerce.ecommerce_backend.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository repo;

    public WishlistItem addToWishlist(User user, Long productId) {
        if (repo.existsByUserAndProductId(user, productId)) {
            throw new RuntimeException("Product already in wishlist");
        }
        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setProductId(productId);
        return repo.save(item);
    }

    public List<WishlistItem> getWishlist(User user) {
        return repo.findByUser(user);
    }

    public void removeFromWishlist(User user, Long productId) {
        Optional<WishlistItem> item = repo.findByUserAndProductId(user, productId);
        item.ifPresent(repo::delete);
    }

    public boolean isInWishlist(User user, Long productId) {
        return repo.existsByUserAndProductId(user, productId);
    }
}