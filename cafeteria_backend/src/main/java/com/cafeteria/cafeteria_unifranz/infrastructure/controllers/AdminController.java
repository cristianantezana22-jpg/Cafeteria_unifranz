package com.cafeteria.cafeteria_unifranz.infrastructure.controllers;

import com.cafeteria.cafeteria_unifranz.domain.Producto;
import com.cafeteria.cafeteria_unifranz.domain.ProductoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*") // Permite la conexión desde el frontend de React
public class AdminController {

    private final ProductoRepository productoRepository;

    public AdminController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @GetMapping("/dashboard")
    public String getDashboardStatus() {
        return "Panel de Administrador Activo";
    }

    // Obtener la lista completa de productos para el menú
    @GetMapping("/productos")
    public List<Producto> getProductos() {
        return productoRepository.findAll();
    }

    // Guardar o actualizar un producto
    @PostMapping("/productos")
    public Producto guardarProducto(@RequestBody Producto producto) {
        return productoRepository.save(producto);
    }
}