package com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "productos")
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false, unique = true, length = 120)
    private String name;

    @Column(name = "descripcion", nullable = false, length = 500)
    private String description;

    @Column(name = "precio", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "imagen_url", nullable = false, length = 1000)
    private String imageUrl;

    @Column(name = "disponible")
    private Boolean available;

    @Column(name = "modificado_por", length = 100)
    private String modifiedBy;

    @Column(name = "modificado_cuando")
    private LocalDateTime modifiedAt;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private CategoryEntity category;

    protected ProductEntity() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public CategoryEntity getCategory() {
        return category;
    }
    public boolean isAvailable() {
    return available == null || available;
    }
    public void changeAvailability(boolean available, String modifiedBy) {
    this.available = available;
    this.modifiedBy = modifiedBy;
    this.modifiedAt = LocalDateTime.now();
    } 
}
