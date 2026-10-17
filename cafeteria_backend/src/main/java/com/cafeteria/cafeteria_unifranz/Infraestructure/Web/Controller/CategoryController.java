package com.cafeteria.cafeteria_unifranz.Infraestructure.Web.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cafeteria.cafeteria_unifranz.application.dto.CategoryResponse;
import com.cafeteria.cafeteria_unifranz.application.service.CatalogService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/categories")
public class CategoryController {

    private final CatalogService catalogService;

    public CategoryController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public List<CategoryResponse> getCategories() {
        return catalogService.getCategories();
    }
}
