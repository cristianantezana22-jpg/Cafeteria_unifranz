package com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios")
public class UsuarioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nombre_completo", nullable = false, length = 120)
    private String nombreCompleto;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 30)
    private String rol;

    @Column(length = 20)
    private String telefono;

    @Column(name = "eliminado_cuando")
    private LocalDateTime eliminadoCuando;

    protected UsuarioEntity() {
        // requerido por JPA
    }

    public Integer getId() {
        return id;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getRol() {
        return rol;
    }

    public String getTelefono() {
        return telefono;
    }

    public LocalDateTime getEliminadoCuando() {
        return eliminadoCuando;
    }
}
