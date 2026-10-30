package com.cafeteria.cafeteria_unifranz.application.service.Impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cafeteria.cafeteria_unifranz.Domain.BloqueCaja;
import com.cafeteria.cafeteria_unifranz.Domain.CajeroSinBloqueException;
import com.cafeteria.cafeteria_unifranz.Domain.EstadoPedido;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoAlmuerzoRestringidoException;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoCaja;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoCajaRepository;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoNoEncontradoException;
import com.cafeteria.cafeteria_unifranz.Domain.TransicionEstadoInvalidaException;
import com.cafeteria.cafeteria_unifranz.application.dto.AuthenticatedUser;
import com.cafeteria.cafeteria_unifranz.application.dto.CajeroPerfilResponse;
import com.cafeteria.cafeteria_unifranz.application.dto.PedidoCajaResponse;
import com.cafeteria.cafeteria_unifranz.application.service.CajeroService;

@Service
public class CajeroServiceImpl implements CajeroService {

    private final PedidoCajaRepository pedidoRepository;

    public CajeroServiceImpl(PedidoCajaRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @Override
    public CajeroPerfilResponse perfil(AuthenticatedUser cajero) {
        BloqueCaja bloque = resolverBloque(cajero);
        return new CajeroPerfilResponse(bloque.etiqueta(), bloque.gestionaAlmuerzos());
    }

    @Override
    public List<PedidoCajaResponse> listarPedidos(AuthenticatedUser cajero) {
        BloqueCaja bloque = resolverBloque(cajero);
        return pedidoRepository.listarVigentes().stream()
                .map(pedido -> toResponse(pedido, bloque))
                .toList();
    }

    @Override
    @Transactional
    public PedidoCajaResponse actualizarEstado(AuthenticatedUser cajero, Integer pedidoId, EstadoPedido nuevoEstado) {
        BloqueCaja bloque = resolverBloque(cajero);
        PedidoCaja pedido = pedidoRepository.buscarPorId(pedidoId)
                .orElseThrow(PedidoNoEncontradoException::new);

        if (!bloque.puedeGestionar(pedido)) {
            throw new PedidoAlmuerzoRestringidoException(bloque.etiqueta());
        }
        if (!pedido.estado().puedeTransicionarA(nuevoEstado)) {
            throw new TransicionEstadoInvalidaException(pedido.estado(), nuevoEstado);
        }

        pedidoRepository.cambiarEstado(pedido.id(), pedido.estado(), nuevoEstado, cajero.id(), cajero.email());

        PedidoCaja actualizado = pedidoRepository.buscarPorId(pedidoId)
                .orElseThrow(PedidoNoEncontradoException::new);
        return toResponse(actualizado, bloque);
    }

    private BloqueCaja resolverBloque(AuthenticatedUser cajero) {
        return pedidoRepository.bloqueDeCajero(cajero.id())
                .flatMap(BloqueCaja::deId)
                .orElseThrow(CajeroSinBloqueException::new);
    }

    private PedidoCajaResponse toResponse(PedidoCaja pedido, BloqueCaja bloque) {
        return new PedidoCajaResponse(
                pedido.id(),
                pedido.ticket(),
                pedido.estado().name(),
                pedido.origen(),
                pedido.cliente(),
                pedido.metodoPago(),
                pedido.estadoPago(),
                pedido.total(),
                pedido.creadoEn(),
                pedido.almuerzo(),
                bloque.puedeGestionar(pedido),
                pedido.estado().siguiente().map(EstadoPedido::name).orElse(null),
                pedido.estado().puedeCancelarse(),
                pedido.items().stream()
                        .map(item -> new PedidoCajaResponse.Item(item.nombre(), item.cantidad(), item.subtotal()))
                        .toList());
    }
}
