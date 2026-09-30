package com.cafeteria.cafeteria_unifranz.domain.repository;

import com.cafeteria.cafeteria_unifranz.domain.model.Pedido;
import java.util.List;
import java.util.Optional;

public interface PedidoRepository {
    List<Pedido> obtenerTodos();
    Optional<Pedido> buscarPorId(Long id);
    Pedido guardar(Pedido pedido);
}