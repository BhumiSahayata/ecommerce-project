package com.ecommerce.ecommerce_backend.service;

import com.ecommerce.ecommerce_backend.model.Product;
import com.ecommerce.ecommerce_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repo;

    public Product addProduct(Product product) {
        if (product.getMerchantId() == null) {
            throw new RuntimeException("merchantId is required");
        }
        return repo.save(product);
    }

    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public List<Product> getByMerchant(Long merchantId) {
        return repo.findByMerchantId(merchantId);
    }

    public Product getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public void deleteProduct(Long id) {
        repo.deleteById(id);
    }

}