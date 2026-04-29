package com.ecommerce.ecommerce_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Use the EXACT absolute path
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/")
                .addResourceLocations("file:D:\\ecommerce site\\ecommerce-backend\\uploads/")
                .setCachePeriod(0);

        System.out.println("=== WebConfig Loaded ===");
        System.out.println("Serving images from: file:D:/ecommerce-backend/uploads/");
    }
}