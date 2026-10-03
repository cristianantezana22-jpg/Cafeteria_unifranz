package com.cafeteria.cafeteria_unifranz.domain.model;

import java.util.List;

public class Pedido {

    private final Long id;
    private final String cliente;
    private final List<ItemPedido> items;
    private final MetodoPago metodoPago;
    private EstadoPedido estado;

    public Pedido(Long id, String cliente, List<ItemPedido> items, MetodoPago metodoPago) {
        this.id = id;
        this.cliente = cliente;
        this.items = items;
        this.metodoPago = metodoPago;
        this.estado = EstadoPedido.CONFIRMANDO_PAGO;
    }

    public double getTotal() {
        return items.stream().mapToDouble(ItemPedido::getSubtotal).sum();
    }

    public void avanzarEstado() {
        this.estado = this.estado.siguiente();
    }

    public Long getId() { return id; }
    public String getCliente() { return cliente; }
    public List<ItemPedido> getItems() { return items; }
    public MetodoPago getMetodoPago() { return metodoPago; }
    public EstadoPedido getEstado() { return estado; }
}