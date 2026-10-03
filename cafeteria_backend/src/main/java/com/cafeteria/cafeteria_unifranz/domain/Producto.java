package com.cafeteria.cafeteria_unifranz.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "productos")
@Data
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String descripcion;

    @Column(nullable = false)
    private BigDecimal precio;

    @Column(nullable = false)
    private String categoria; // 'Almuerzo', 'Bebida', 'Snack'

    @Column(nullable = false)
    private String bloque; // 'BLOQUE_A', 'BLOQUE_B', 'AMBOS'

    private Boolean disponible = true;

    private String imagenUrl;
}