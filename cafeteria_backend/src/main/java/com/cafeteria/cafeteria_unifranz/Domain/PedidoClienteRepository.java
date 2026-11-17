package com.cafeteria.cafeteria_unifranz.Domain;

import java.util.Optional;

public interface PedidoClienteRepository {

    PedidoRegistrado registrar(NuevoPedido pedido);

    Optional<PedidoClienteEstado> estadoDe(Integer pedidoId, Integer usuarioId);
}