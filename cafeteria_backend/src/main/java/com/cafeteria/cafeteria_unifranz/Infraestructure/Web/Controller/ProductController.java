package com.cafeteria.cafeteria_unifranz.Infraestructure.Web.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cafeteria.cafeteria_unifranz.application.dto.ProductResponse;
import com.cafeteria.cafeteria_unifranz.application.service.CatalogService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/products")
public class ProductController {

    private final CatalogService catalogService;

    public ProductController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public List<ProductResponse> getProducts() {
        return catalogService.getProducts();
    }

    @GetMapping("/featured")
    public List<ProductResponse> getFeaturedProducts() {
        return catalogService.getProducts();
    }
}
