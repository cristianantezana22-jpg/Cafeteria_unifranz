package com.cafeteria.cafeteria_unifranz.application.mapper;

import com.cafeteria.cafeteria_unifranz.application.dto.ItemPedidoResponse;
import com.cafeteria.cafeteria_unifranz.application.dto.PedidoResponse;
import com.cafeteria.cafeteria_unifranz.domain.model.Pedido;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class PedidoMapper {

    public PedidoResponse aRespuesta(Pedido pedido) {
        List<ItemPedidoResponse> items = pedido.getItems().stream()
                .map(i -> new ItemPedidoResponse(i.nombre(), i.cantidad(), i.precio(), i.getSubtotal()))
                .toList();

        return new PedidoResponse(
                pedido.getId(),
                pedido.getCliente(),
                items,
                pedido.getMetodoPago().name(),
                pedido.getEstado().name(),
                pedido.getTotal());
    }
}