package com.cafeteria.cafeteria_unifranz.application.service;

import com.cafeteria.cafeteria_unifranz.application.dto.PedidoResponse;
import java.util.List;

public interface PedidoService {
    List<PedidoResponse> listar();
    PedidoResponse avanzarEstado(Long idPedido);
}