package com.cafeteria.cafeteria_unifranz.infrastructure.persistence;

import com.cafeteria.cafeteria_unifranz.domain.model.ItemPedido;
import com.cafeteria.cafeteria_unifranz.domain.model.MetodoPago;
import com.cafeteria.cafeteria_unifranz.domain.model.Pedido;
import com.cafeteria.cafeteria_unifranz.domain.repository.PedidoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;

@Repository
public class PedidoRepositoryEnMemoria implements PedidoRepository {

    private final List<Pedido> pedidos = new CopyOnWriteArrayList<>();

    public PedidoRepositoryEnMemoria() {
        pedidos.add(new Pedido(1L, "Mesa 3", List.of(
                new ItemPedido("Almuerzo Ejecutivo", 2, 15.0),
                new ItemPedido("Jugo Natural", 2, 6.0)), MetodoPago.QR));

        pedidos.add(new Pedido(2L, "Carlos M.", List.of(
                new ItemPedido("Café Pasado", 1, 4.0),
                new ItemPedido("Empanada de Queso", 2, 5.0)), MetodoPago.EFECTIVO));

        pedidos.add(new Pedido(3L, "Lucía R.", List.of(
                new ItemPedido("Jugo Natural", 1, 6.0)), MetodoPago.QR));

        pedidos.add(new Pedido(4L, "Mesa 7", List.of(
                new ItemPedido("Almuerzo Ejecutivo", 1, 15.0)), MetodoPago.EFECTIVO));

        pedidos.get(2).avanzarEstado();
        pedidos.get(3).avanzarEstado();
        pedidos.get(3).avanzarEstado();
    }

    @Override
    public List<Pedido> obtenerTodos() {
        return List.copyOf(pedidos);
    }

    @Override
    public Optional<Pedido> buscarPorId(Long id) {
        return pedidos.stream().filter(p -> p.getId().equals(id)).findFirst();
    }

    @Override
    public Pedido guardar(Pedido pedido) {
        for (int i = 0; i < pedidos.size(); i++) {
            if (pedidos.get(i).getId().equals(pedido.getId())) {
                pedidos.set(i, pedido);
                return pedido;
            }
        }
        pedidos.add(pedido);
        return pedido;
    }
}