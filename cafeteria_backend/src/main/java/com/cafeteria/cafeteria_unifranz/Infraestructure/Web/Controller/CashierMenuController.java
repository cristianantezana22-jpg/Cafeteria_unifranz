package com.cafeteria.cafeteria_unifranz.Infraestructure.Web.Controller;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;

import com.cafeteria.cafeteria_unifranz.application.dto.MenuCategoryResponse;
import com.cafeteria.cafeteria_unifranz.application.dto.MenuProductRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.MenuProductResponse;

@RestController
@RequestMapping("/api/cajero/menu")
@PreAuthorize("hasRole('CAJERO')")
public class CashierMenuController {

    private static final String SELECT_PRODUCTS = """
            SELECT p.id, p.nombre, p.precio, p.menu_del_dia, c.id AS categoria_id, c.nombre AS categoria
            FROM productos p
            JOIN categorias c ON c.id = p.categoria_id
            """;

    private final JdbcClient jdbc;

    public CashierMenuController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/products")
    public List<MenuProductResponse> products() {
        return jdbc.sql(SELECT_PRODUCTS + " ORDER BY p.id DESC")
                .query(this::mapProduct)
                .list();
    }

    @GetMapping("/categories")
    public List<MenuCategoryResponse> categories() {
        return jdbc.sql("SELECT id, nombre FROM categorias ORDER BY nombre")
                .query((resultSet, rowNum) -> new MenuCategoryResponse(
                        resultSet.getInt("id"),
                        resultSet.getString("nombre")))
                .list();
    }

    @PostMapping("/products")
    public MenuProductResponse create(@Valid @RequestBody MenuProductRequest request) {
        requireCategory(request.categoryId());
        Integer id = jdbc.sql("""
                        INSERT INTO productos (categoria_id, nombre, precio, menu_del_dia)
                        VALUES (:categoryId, :name, :price, :featured)
                        RETURNING id
                        """)
                .param("categoryId", request.categoryId())
                .param("name", request.name().trim())
                .param("price", request.price())
                .param("featured", request.featured())
                .query(Integer.class)
                .single();
        return product(id);
    }

    @PutMapping("/products/{id}")
    public MenuProductResponse update(
            @PathVariable Integer id,
            @Valid @RequestBody MenuProductRequest request) {
        requireCategory(request.categoryId());
        int updated = jdbc.sql("""
                        UPDATE productos
                        SET categoria_id = :categoryId, nombre = :name, precio = :price, menu_del_dia = :featured
                        WHERE id = :id
                        """)
                .param("categoryId", request.categoryId())
                .param("name", request.name().trim())
                .param("price", request.price())
                .param("featured", request.featured())
                .param("id", id)
                .update();
        if (updated == 0) throw notFound();
        return product(id);
    }

    @DeleteMapping("/products/{id}")
    public void delete(@PathVariable Integer id) {
        if (!productExists(id)) throw notFound();
        boolean usedByOrder = jdbc.sql("""
                        SELECT EXISTS (
                            SELECT 1 FROM detalle_pedidos WHERE producto_id = :id
                        )
                        """)
                .param("id", id)
                .query(Boolean.class)
                .single();
        if (usedByOrder) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede eliminar un producto asociado a pedidos registrados.");
        }
        jdbc.sql("DELETE FROM productos WHERE id = :id")
                .param("id", id)
                .update();
    }

    private MenuProductResponse product(Integer id) {
        return jdbc.sql(SELECT_PRODUCTS + " WHERE p.id = :id")
                .param("id", id)
                .query(this::mapProduct)
                .optional()
                .orElseThrow(this::notFound);
    }

    private boolean productExists(Integer id) {
        return jdbc.sql("SELECT EXISTS (SELECT 1 FROM productos WHERE id = :id)")
                .param("id", id)
                .query(Boolean.class)
                .single();
    }

    private void requireCategory(Integer id) {
        boolean exists = jdbc.sql("SELECT EXISTS (SELECT 1 FROM categorias WHERE id = :id)")
                .param("id", id)
                .query(Boolean.class)
                .single();
        if (!exists) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "La categoría seleccionada no existe.");
        }
    }

    private MenuProductResponse mapProduct(ResultSet resultSet, int rowNum) throws SQLException {
        return new MenuProductResponse(
                resultSet.getInt("id"),
                resultSet.getString("nombre"),
                "",
                resultSet.getBigDecimal("precio"),
                resultSet.getString("categoria"),
                resultSet.getInt("categoria_id"),
                "",
                resultSet.getBoolean("menu_del_dia"));
    }

    private ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró el producto.");
    }
}
