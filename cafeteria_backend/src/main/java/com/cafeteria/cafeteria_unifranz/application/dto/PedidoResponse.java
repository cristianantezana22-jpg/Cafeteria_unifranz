package com.cafeteria.cafeteria_unifranz.application.dto;

import java.util.List;

public record PedidoResponse(
        Long id,
        String cliente,
        List<ItemPedidoResponse> items,
        String metodoPago,
        String estado,
        double total) { }