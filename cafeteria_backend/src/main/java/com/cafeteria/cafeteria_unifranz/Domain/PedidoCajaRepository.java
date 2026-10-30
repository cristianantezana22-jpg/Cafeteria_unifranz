package com.cafeteria.cafeteria_unifranz.Domain;

import java.util.List;
import java.util.Optional;

public interface PedidoCajaRepository {

    List<PedidoCaja> listarVigentes();

    Optional<PedidoCaja> buscarPorId(Integer id);

    void cambiarEstado(Integer pedidoId, EstadoPedido anterior, EstadoPedido nuevo, Integer usuarioId, String usuarioEmail);

    Optional<Integer> bloqueDeCajero(Integer usuarioId);
}
