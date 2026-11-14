package com.cafeteria.cafeteria_unifranz.Infraestructure.Web.Controller;

import java.security.SecureRandom;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import com.cafeteria.cafeteria_unifranz.application.dto.AuthenticatedUser;

/**
 * Panel de administración: usuarios y personal.
 *
 * ELIMINACIÓN
 *  - Lógica  (Personal → DELETE /empleados/{id}): el empleado desaparece de Personal y su cuenta
 *    queda marcada como eliminada (usuarios.eliminado_cuando). Se puede rehabilitar.
 *  - Permanente (Gestionar Usuarios → DELETE /usuarios/{id}): borra la cuenta de la base de datos.
 *    Falla con 409 si el usuario tiene pedidos u otros registros asociados.
 *  - Rehabilitar (POST /usuarios/{id}/rehabilitar): quita la marca de eliminado.
 *
 * ACCESO DE EMPLEADOS
 *  Al crear un empleado se crea su cuenta: correo generado a partir del nombre y contraseña aleatoria
 *  guardada cifrada (BCrypt). La contraseña se devuelve UNA sola vez.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    /* ───────────────────────────── DTOs ───────────────────────────── */

    public record UsuarioAdminDto(Integer id, String nombreCompleto, String email, String rol, boolean eliminado) {
    }

    /** email y password solo se llenan en la respuesta; password únicamente al crear al empleado. */
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
            Boolean activo,
            String email,
            String password) {
    }

    public record CredencialesDto(String email, String password) {
    }

    private record CuentaNueva(Integer usuarioId, String email, String password) {
    }

    private record FilaEmpleado(String nombre, String cargo, Integer usuarioId) {
    }

    /* ───────────────────────────── SQL ───────────────────────────── */

    private static final String SELECT_EMPLEADOS = """
            SELECT e.id, e.nombre, e.cargo, e.bloque, e.activo, u.email
            FROM empleados e
            LEFT JOIN usuarios u ON u.id = e.usuario_id
            """;

    // Sin caracteres ambiguos (0/O, 1/l/I) para que sea fácil de dictar o copiar.
    private static final String ALFABETO_PASSWORD = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    private static final int LARGO_PASSWORD = 10;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final JdbcClient jdbc;
    private final PasswordEncoder passwordEncoder;
    private final String dominioCorreo;

    public AdminController(JdbcClient jdbc,
                           PasswordEncoder passwordEncoder,
                           @Value("${app.empleados.email-domain:unifranz.edu.bo}") String dominioCorreo) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
        this.dominioCorreo = dominioCorreo;
    }

    /* ───────────────────────────── USUARIOS ───────────────────────────── */

    /** Lista todas las cuentas, incluidas las eliminadas lógicamente (campo "eliminado"). */
    @GetMapping("/usuarios")
    public List<UsuarioAdminDto> listarUsuarios() {
        return jdbc.sql("""
                        SELECT id, nombre_completo, email, rol, (eliminado_cuando IS NOT NULL) AS eliminado
                        FROM usuarios
                        ORDER BY id
                        """)
                .query((rs, rowNum) -> new UsuarioAdminDto(
                        rs.getInt("id"),
                        rs.getString("nombre_completo"),
                        rs.getString("email"),
                        rs.getString("rol"),
                        rs.getBoolean("eliminado")))
                .list();
    }

    /** Quita la marca de eliminado de la cuenta y de su empleado (queda "fuera de turno"). */
    @PostMapping("/usuarios/{id}/rehabilitar")
    @Transactional
    public ResponseEntity<Void> rehabilitarUsuario(@PathVariable Integer id,
                                                   @AuthenticationPrincipal AuthenticatedUser admin) {
        String actor = actor(admin);
        int actualizados = jdbc.sql("""
                        UPDATE usuarios
                        SET eliminado_por = NULL, eliminado_cuando = NULL,
                            modificado_por = :actor, modificado_cuando = CURRENT_TIMESTAMP
                        WHERE id = :id
                        """)
                .param("actor", actor)
                .param("id", id)
                .update();
        if (actualizados == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró el usuario.");
        }
        jdbc.sql("""
                        UPDATE empleados
                        SET eliminado_por = NULL, eliminado_cuando = NULL, activo = FALSE,
                            modificado_por = :actor, modificado_cuando = CURRENT_TIMESTAMP
                        WHERE usuario_id = :id
                        """)
                .param("actor", actor)
                .param("id", id)
                .update();
        return ResponseEntity.noContent().build();
    }

    /** Eliminación PERMANENTE: borra la cuenta (y el empleado enlazado) de la base de datos. */
    @DeleteMapping("/usuarios/{id}")
    @Transactional
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Integer id,
                                                @AuthenticationPrincipal AuthenticatedUser admin) {
        boolean existe = jdbc.sql("SELECT EXISTS (SELECT 1 FROM usuarios WHERE id = :id)")
                .param("id", id)
                .query(Boolean.class)
                .single();
        if (!existe) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró el usuario.");
        }
        validarPuedeQuitarCuenta(id, admin);

        try {
            jdbc.sql("DELETE FROM empleados WHERE usuario_id = :id").param("id", id).update();
            jdbc.sql("DELETE FROM usuarios WHERE id = :id").param("id", id).update();
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede eliminar permanentemente: el usuario tiene pedidos o registros asociados. "
                            + "Déjalo como eliminado (deshabilitado).");
        }
        return ResponseEntity.noContent().build();
    }

    /* ───────────────────────────── EMPLEADOS ───────────────────────────── */

    @GetMapping("/empleados")
    public List<EmpleadoDto> listarEmpleados() {
        return jdbc.sql(SELECT_EMPLEADOS + " WHERE e.eliminado_cuando IS NULL ORDER BY e.id")
                .query(this::mapEmpleado)
                .list();
    }

    @PostMapping("/empleados")
    @Transactional
    public EmpleadoDto guardarEmpleado(@Valid @RequestBody EmpleadoDto request,
                                       @AuthenticationPrincipal AuthenticatedUser admin) {
        String actor = actor(admin);
        String nombre = request.nombre().trim();
        String cargo = request.cargo().trim();
        String bloque = request.bloque() == null ? "BLOQUE_A" : request.bloque();
        boolean activo = request.activo() == null || request.activo();

        Integer id = request.id();
        String password = null;

        if (id == null) {
            // Alta: primero la cuenta de acceso y luego el empleado enlazado a ella.
            CuentaNueva cuenta = crearCuenta(nombre, cargo, actor);
            password = cuenta.password();
            id = jdbc.sql("""
                            INSERT INTO empleados (nombre, cargo, bloque, activo, usuario_id, creado_por)
                            VALUES (:nombre, :cargo, :bloque, :activo, :usuarioId, :actor)
                            RETURNING id
                            """)
                    .param("nombre", nombre)
                    .param("cargo", cargo)
                    .param("bloque", bloque)
                    .param("activo", activo)
                    .param("usuarioId", cuenta.usuarioId())
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
                    .param("nombre", nombre)
                    .param("cargo", cargo)
                    .param("bloque", bloque)
                    .param("activo", activo)
                    .param("actor", actor)
                    .param("id", id)
                    .update();
            if (actualizados == 0) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró al empleado.");
            }
        }

        EmpleadoDto guardado = jdbc.sql(SELECT_EMPLEADOS + " WHERE e.id = :id")
                .param("id", id)
                .query(this::mapEmpleado)
                .single();
        return new EmpleadoDto(guardado.id(), guardado.nombre(), guardado.cargo(), guardado.bloque(),
                guardado.activo(), guardado.email(), password);
    }

    /**
     * Crea el acceso de un empleado que todavía no lo tiene, o genera una contraseña nueva si ya tiene
     * cuenta. Devuelve correo y contraseña (se muestra una sola vez).
     */
    @PostMapping("/empleados/{id}/credenciales")
    @Transactional
    public CredencialesDto generarCredenciales(@PathVariable Integer id,
                                               @AuthenticationPrincipal AuthenticatedUser admin) {
        String actor = actor(admin);
        FilaEmpleado fila = buscarEmpleado(id);

        if (fila.usuarioId() == null) {
            CuentaNueva cuenta = crearCuenta(fila.nombre(), fila.cargo(), actor);
            jdbc.sql("""
                            UPDATE empleados
                            SET usuario_id = :usuarioId, modificado_por = :actor, modificado_cuando = CURRENT_TIMESTAMP
                            WHERE id = :id
                            """)
                    .param("usuarioId", cuenta.usuarioId())
                    .param("actor", actor)
                    .param("id", id)
                    .update();
            return new CredencialesDto(cuenta.email(), cuenta.password());
        }

        String password = generarPassword();
        int actualizados = jdbc.sql("""
                        UPDATE usuarios
                        SET password_hash = :hash, modificado_por = :actor, modificado_cuando = CURRENT_TIMESTAMP
                        WHERE id = :id
                        """)
                .param("hash", passwordEncoder.encode(password))
                .param("actor", actor)
                .param("id", fila.usuarioId())
                .update();
        if (actualizados == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró la cuenta del empleado.");
        }
        String email = jdbc.sql("SELECT email FROM usuarios WHERE id = :id")
                .param("id", fila.usuarioId())
                .query(String.class)
                .single();
        return new CredencialesDto(email, password);
    }

    /** Eliminación LÓGICA: oculta al empleado de Personal y deshabilita su cuenta. Se puede rehabilitar. */
    @DeleteMapping("/empleados/{id}")
    @Transactional
    public ResponseEntity<Void> eliminarEmpleado(@PathVariable Integer id,
                                                 @AuthenticationPrincipal AuthenticatedUser admin) {
        String actor = actor(admin);
        FilaEmpleado fila = buscarEmpleado(id);

        if (fila.usuarioId() != null) {
            validarPuedeQuitarCuenta(fila.usuarioId(), admin);
            jdbc.sql("""
                            UPDATE usuarios
                            SET eliminado_por = :actor, eliminado_cuando = CURRENT_TIMESTAMP
                            WHERE id = :id AND eliminado_cuando IS NULL
                            """)
                    .param("actor", actor)
                    .param("id", fila.usuarioId())
                    .update();
        }
        jdbc.sql("""
                        UPDATE empleados
                        SET activo = FALSE, eliminado_por = :actor, eliminado_cuando = CURRENT_TIMESTAMP
                        WHERE id = :id
                        """)
                .param("actor", actor)
                .param("id", id)
                .update();
        return ResponseEntity.noContent().build();
    }

    /* ───────────────────────────── Reglas de seguridad ───────────────────────────── */

    /** Impide quitar la cuenta propia o la del último administrador activo. */
    private void validarPuedeQuitarCuenta(Integer usuarioId, AuthenticatedUser admin) {
        if (admin != null && Objects.equals(admin.id(), usuarioId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No puedes eliminar tu propia cuenta.");
        }
        boolean esAdminActivo = jdbc.sql("""
                        SELECT EXISTS (
                            SELECT 1 FROM usuarios
                            WHERE id = :id AND rol = 'ADMIN' AND eliminado_cuando IS NULL
                        )
                        """)
                .param("id", usuarioId)
                .query(Boolean.class)
                .single();
        if (!esAdminActivo) {
            return;
        }
        Integer otrosAdmins = jdbc.sql("""
                        SELECT COUNT(*) FROM usuarios
                        WHERE rol = 'ADMIN' AND eliminado_cuando IS NULL AND id <> :id
                        """)
                .param("id", usuarioId)
                .query(Integer.class)
                .single();
        if (otrosAdmins == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede eliminar al último administrador activo.");
        }
    }

    /* ───────────────────────────── Cuentas de acceso ───────────────────────────── */

    private FilaEmpleado buscarEmpleado(Integer id) {
        return jdbc.sql("""
                        SELECT nombre, cargo, usuario_id
                        FROM empleados
                        WHERE id = :id AND eliminado_cuando IS NULL
                        """)
                .param("id", id)
                .query((rs, rowNum) -> new FilaEmpleado(
                        rs.getString("nombre"),
                        rs.getString("cargo"),
                        rs.getObject("usuario_id", Integer.class)))
                .optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró al empleado."));
    }

    private CuentaNueva crearCuenta(String nombre, String cargo, String actor) {
        String email = generarCorreoUnico(nombre);
        String password = generarPassword();
        Integer usuarioId = jdbc.sql("""
                        INSERT INTO usuarios (nombre_completo, email, password_hash, rol, creado_por)
                        VALUES (:nombre, :email, :hash, :rol, :actor)
                        RETURNING id
                        """)
                .param("nombre", nombre)
                .param("email", email)
                .param("hash", passwordEncoder.encode(password))
                .param("rol", rolPorCargo(cargo))
                .param("actor", actor)
                .query(Integer.class)
                .single();
        return new CuentaNueva(usuarioId, email, password);
    }

    /** Cajero → CAJERO, Cocinero → COCINA, Administrador → ADMIN (roles permitidos por la tabla usuarios). */
    private String rolPorCargo(String cargo) {
        String c = cargo.trim().toLowerCase(Locale.ROOT);
        if (c.startsWith("cocin")) {
            return "COCINA";
        }
        if (c.startsWith("admin")) {
            return "ADMIN";
        }
        return "CAJERO";
    }

    private String generarCorreoUnico(String nombre) {
        String base = baseCorreo(nombre);
        String candidato = base + "@" + dominioCorreo;
        int numero = 2;
        while (existeCorreo(candidato)) {
            candidato = base + numero + "@" + dominioCorreo;
            numero++;
        }
        return candidato;
    }

    /** "Miguel Ángel Hurtado" → "miguel.hurtado" (sin tildes ni símbolos). */
    private String baseCorreo(String nombre) {
        String limpio = Normalizer.normalize(nombre, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .trim();
        String[] partes = limpio.split("\\s+");
        String primero = soloAlfanumerico(partes[0]);
        String ultimo = partes.length > 1 ? soloAlfanumerico(partes[partes.length - 1]) : "";
        String base = (ultimo.isEmpty() || ultimo.equals(primero)) ? primero : primero + "." + ultimo;
        return base.isEmpty() ? "empleado" : base;
    }

    private String soloAlfanumerico(String texto) {
        return texto.replaceAll("[^a-z0-9]", "");
    }

    private boolean existeCorreo(String email) {
        return jdbc.sql("SELECT EXISTS (SELECT 1 FROM usuarios WHERE LOWER(email) = LOWER(:email))")
                .param("email", email)
                .query(Boolean.class)
                .single();
    }

    private String generarPassword() {
        StringBuilder sb = new StringBuilder(LARGO_PASSWORD);
        for (int i = 0; i < LARGO_PASSWORD; i++) {
            sb.append(ALFABETO_PASSWORD.charAt(RANDOM.nextInt(ALFABETO_PASSWORD.length())));
        }
        return sb.toString();
    }

    /* ───────────────────────────── Utilidades ───────────────────────────── */

    private String actor(AuthenticatedUser admin) {
        return admin == null ? "admin" : admin.email();
    }

    private EmpleadoDto mapEmpleado(ResultSet rs, int rowNum) throws SQLException {
        return new EmpleadoDto(
                rs.getInt("id"),
                rs.getString("nombre"),
                rs.getString("cargo"),
                rs.getString("bloque"),
                rs.getBoolean("activo"),
                rs.getString("email"),
                null);
    }
}
