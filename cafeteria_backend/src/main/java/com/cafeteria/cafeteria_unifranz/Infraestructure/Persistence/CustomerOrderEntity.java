package com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "pedidos")
public class CustomerOrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_pedido", unique = true, length = 30)
    private String orderNumber;

    @Column(name = "cliente_id")
    private Long customerId;

    @Column(name = "modalidad_servicio", length = 20)
    private String serviceMode;

    @Column(name = "metodo_pago", length = 20)
    private String paymentMethod;

    @Column(name = "monto_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItemEntity> items = new ArrayList<>();

    protected CustomerOrderEntity() {
    }

    public CustomerOrderEntity(Long customerId, String serviceMode, String paymentMethod) {
        this.customerId = customerId;
        this.serviceMode = serviceMode;
        this.paymentMethod = paymentMethod;
        this.totalAmount = BigDecimal.ZERO;
    }

    public void addItem(OrderItemEntity item) {
        items.add(item);
        item.setOrder(this);
        totalAmount = totalAmount.add(item.getSubtotal());
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    @PrePersist
    void setCreatedAt() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getServiceMode() {
        return serviceMode;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<OrderItemEntity> getItems() {
        return List.copyOf(items);
    }
}
