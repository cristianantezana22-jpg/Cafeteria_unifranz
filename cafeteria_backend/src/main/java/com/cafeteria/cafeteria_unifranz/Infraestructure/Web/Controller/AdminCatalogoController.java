package com.cafeteria.cafeteria_unifranz.Infraestructure.Web.Controller;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import com.cafeteria.cafeteria_unifranz.application.dto.AuthenticatedUser;

/**
 * Endpoints del panel de administración para Menú (productos) y Personal (empleados).
 * Comparte la ruta base /api/admin con AdminController (que maneja /usuarios).
 *
 * El POST funciona como "guardar": si el cuerpo trae id actualiza, si no lo trae crea.
 * El frontend lo usa así también para marcar un platillo como agotado o iniciar un turno.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminCatalogoController {

    /* ───────────────────────────── DTOs ───────────────────────────── */

    public record ProductoAdminDto(
            Integer id,
            @NotBlank(message = "El nombre del platillo es obligatorio.")
            @Size(max = 100, message = "El nombre no puede superar los 100 caracteres.")
            String nombre,
            @Size(max = 1000, message = "La descripción es demasiado larga.")
            String descripcion,
            @NotNull(message = "El precio es obligatorio.")
            @DecimalMin(value = "0.0", message = "El precio no puede ser negativo.")
            @DecimalMax(value = "999999.99", message = "El precio es demasiado alto.")
            BigDecimal precio,
            @NotBlank(message = "La categoría es obligatoria.")
            @Size(max = 50, message = "La categoría no puede superar los 50 caracteres.")
            String categoria,
            @Pattern(regexp = "BLOQUE_A|BLOQUE_B|AMBOS", message = "El bloque no es válido.")
            String bloque,
            Boolean disponible) {
    }

    public record EmpleadoDto(
            Integer id,
            @NotBlank(message = "El nombre del empleado es obligatorio.")
            @Size(max = 120, message = "El nombre no puede superar los 120 caracteres.")
            String nombre,
            @NotBlank(message = "El cargo es obligatorio.")
            @Size(max = 50, message = "El cargo no puede superar los 50 caracteres.")
            String cargo,
            @Pattern(regexp = "BLOQUE_A|BLOQUE_B|AMBOS", message = "El bloque no es válido.")
            String bloque,
            Boolean activo) {
    }

    /* ───────────────────────────── SQL ───────────────────────────── */

    private static final String SELECT_PRODUCTOS = """
            SELECT p.id, p.nombre, COALESCE(p.descripcion, '') AS descripcion, p.precio,
                   c.nombre AS categoria, p.bloque, COALESCE(p.disponible, TRUE) AS disponible
            FROM productos p
            JOIN categorias c ON c.id = p.categoria_id
            """;

    private static final String SELECT_EMPLEADOS = """
            SELECT id, nombre, cargo, bloque, activo
            FROM empleados
            """;

    private final JdbcClient jdbc;

    public AdminCatalogoController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    /* ───────────────────────────── PRODUCTOS ───────────────────────────── */

    @GetMapping("/productos")
    public List<ProductoAdminDto> listarProductos() {
        return jdbc.sql(SELECT_PRODUCTOS + " WHERE p.eliminado_cuando IS NULL ORDER BY p.id DESC")
                .query(this::mapProducto)
                .list();
    }

    @PostMapping("/productos")
    public ProductoAdminDto guardarProducto(@Valid @RequestBody ProductoAdminDto request,
                                            @AuthenticationPrincipal AuthenticatedUser admin) {
        String actor = actor(admin);
        Integer categoriaId = obtenerOCrearCategoria(request.categoria().trim());
        String descripcion = request.descripcion() == null ? "" : request.descripcion().trim();
        String bloque = request.bloque() == null ? "AMBOS" : request.bloque();
        boolean disponible = request.disponible() == null || request.disponible();

        Integer id = request.id();
        if (id == null) {
            id = jdbc.sql("""
                            INSERT INTO productos (categoria_id, nombre, descripcion, precio, disponible, bloque, creado_por)
                            VALUES (:categoriaId, :nombre, :descripcion, :precio, :disponible, :bloque, :actor)
                            RETURNING id
                            """)
                    .param("categoriaId", categoriaId)
                    .param("nombre", request.nombre().trim())
                    .param("descripcion", descripcion)
                    .param("precio", request.precio())
                    .param("disponible", disponible)
                    .param("bloque", bloque)
                    .param("actor", actor)
                    .query(Integer.class)
                    .single();
        } else {
            int actualizados = jdbc.sql("""
                            UPDATE productos
                            SET categoria_id = :categoriaId, nombre = :nombre, descripcion = :descripcion,
                                precio = :precio, disponible = :disponible, bloque = :bloque,
                                modificado_por = :actor, modificado_cuando = CURRENT_TIMESTAMP
                            WHERE id = :id AND eliminado_cuando IS NULL
                            """)
                    .param("categoriaId", categoriaId)
                    .param("nombre", request.nombre().trim())
                    .param("descripcion", descripcion)
                    .param("precio", request.precio())
                    .param("disponible", disponible)
                    .param("bloque", bloque)
                    .param("actor", actor)
                    .param("id", id)
                    .update();
            if (actualizados == 0) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró el platillo.");
            }
        }
        return jdbc.sql(SELECT_PRODUCTOS + " WHERE p.id = :id")
                .param("id", id)
                .query(this::mapProducto)
                .single();
    }

    /* ───────────────────────────── EMPLEADOS ───────────────────────────── */

    @GetMapping("/empleados")
    public List<EmpleadoDto> listarEmpleados() {
        return jdbc.sql(SELECT_EMPLEADOS + " WHERE eliminado_cuando IS NULL ORDER BY id")
                .query(this::mapEmpleado)
                .list();
    }

    @PostMapping("/empleados")
    public EmpleadoDto guardarEmpleado(@Valid @RequestBody EmpleadoDto request,
                                       @AuthenticationPrincipal AuthenticatedUser admin) {
        String actor = actor(admin);
        String bloque = request.bloque() == null ? "BLOQUE_A" : request.bloque();
        boolean activo = request.activo() == null || request.activo();

        Integer id = request.id();
        if (id == null) {
            id = jdbc.sql("""
                            INSERT INTO empleados (nombre, cargo, bloque, activo, creado_por)
                            VALUES (:nombre, :cargo, :bloque, :activo, :actor)
                            RETURNING id
                            """)
                    .param("nombre", request.nombre().trim())
                    .param("cargo", request.cargo().trim())
                    .param("bloque", bloque)
                    .param("activo", activo)
                    .param("actor", actor)
                    .query(Integer.class)
                    .single();
        } else {
            int actualizados = jdbc.sql("""
                            UPDATE empleados
                            SET nombre = :nombre, cargo = :cargo, bloque = :bloque, activo = :activo,
                                modificado_por = :actor, modificado_cuando = CURRENT_TIMESTAMP
                            WHERE id = :id AND eliminado_cuando IS NULL
                            """)
                    .param("nombre", request.nombre().trim())
                    .param("cargo", request.cargo().trim())
                    .param("bloque", bloque)
                    .param("activo", activo)
                    .param("actor", actor)
                    .param("id", id)
                    .update();
            if (actualizados == 0) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró al empleado.");
            }
        }
        return jdbc.sql(SELECT_EMPLEADOS + " WHERE id = :id")
                .param("id", id)
                .query(this::mapEmpleado)
                .single();
    }

    /* ───────────────────────────── Utilidades ───────────────────────────── */

    /** Busca la categoría por nombre (sin distinguir mayúsculas) y la crea si todavía no existe. */
    private Integer obtenerOCrearCategoria(String nombre) {
        return jdbc.sql("SELECT id FROM categorias WHERE LOWER(nombre) = LOWER(:nombre)")
                .param("nombre", nombre)
                .query(Integer.class)
                .optional()
                .orElseGet(() -> jdbc.sql("INSERT INTO categorias (nombre) VALUES (:nombre) RETURNING id")
                        .param("nombre", nombre)
                        .query(Integer.class)
                        .single());
    }

    private String actor(AuthenticatedUser admin) {
        return admin == null ? "admin" : admin.email();
    }

    private ProductoAdminDto mapProducto(ResultSet rs, int rowNum) throws SQLException {
        return new ProductoAdminDto(
                rs.getInt("id"),
                rs.getString("nombre"),
                rs.getString("descripcion"),
                rs.getBigDecimal("precio"),
                rs.getString("categoria"),
                rs.getString("bloque"),
                rs.getBoolean("disponible"));
    }

    private EmpleadoDto mapEmpleado(ResultSet rs, int rowNum) throws SQLException {
        return new EmpleadoDto(
                rs.getInt("id"),
                rs.getString("nombre"),
                rs.getString("cargo"),
                rs.getString("bloque"),
                rs.getBoolean("activo"));
    }
}
