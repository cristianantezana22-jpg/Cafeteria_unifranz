package com.cafeteria.cafeteria_unifranz.presentation.controller;

import com.cafeteria.cafeteria_unifranz.application.service.ProductoService;
import com.cafeteria.cafeteria_unifranz.domain.model.Producto;
import com.cafeteria.cafeteria_unifranz.presentation.dto.ProductoResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public List<ProductoResponseDTO> listarTodos() {
        return productoService.listarTodos().stream().map(this::toDto).toList();
    }

    @GetMapping("/categoria/{categoriaId}")
    public List<ProductoResponseDTO> listarPorCategoria(@PathVariable Long categoriaId) {
        return productoService.listarPorCategoria(categoriaId).stream().map(this::toDto).toList();
    }

    private ProductoResponseDTO toDto(Producto p) {
        return new ProductoResponseDTO(p.id(), p.nombre(), p.precio(), p.imagenUrl(), p.categoriaId());
    }
}