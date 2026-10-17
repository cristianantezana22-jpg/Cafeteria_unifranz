package com.cafeteria.cafeteria_unifranz.application.service;

import java.util.List;

import com.cafeteria.cafeteria_unifranz.Domain.EstadoPedido;
import com.cafeteria.cafeteria_unifranz.application.dto.AuthenticatedUser;
import com.cafeteria.cafeteria_unifranz.application.dto.CajeroPerfilResponse;
import com.cafeteria.cafeteria_unifranz.application.dto.PedidoCajaResponse;

public interface CajeroService {

    CajeroPerfilResponse perfil(AuthenticatedUser cajero);

    List<PedidoCajaResponse> listarPedidos(AuthenticatedUser cajero);

    PedidoCajaResponse actualizarEstado(AuthenticatedUser cajero, Integer pedidoId, EstadoPedido nuevoEstado);
}
