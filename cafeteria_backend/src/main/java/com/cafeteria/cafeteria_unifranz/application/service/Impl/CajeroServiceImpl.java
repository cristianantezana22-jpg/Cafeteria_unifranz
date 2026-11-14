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
import com.cafeteria.cafeteria_unifranz.application.service.NotificadorTiempoReal;

@Service
public class CajeroServiceImpl implements CajeroService {

    private final PedidoCajaRepository pedidoRepository;
    private final NotificadorTiempoReal notificador;

    public CajeroServiceImpl(PedidoCajaRepository pedidoRepository, NotificadorTiempoReal notificador) {
    this.pedidoRepository = pedidoRepository;
    this.notificador = notificador;
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
        if (!permiteTransicion(pedido, nuevoEstado)) {
            throw new TransicionEstadoInvalidaException(pedido.estado(), nuevoEstado);
        }

        pedidoRepository.cambiarEstado(pedido.id(), pedido.estado(), nuevoEstado, cajero.id(), cajero.email());
        notificador.pedidosActualizados(pedidoId);

        PedidoCaja actualizado = pedidoRepository.buscarPorId(pedidoId)
                .orElseThrow(PedidoNoEncontradoException::new);
        return toResponse(actualizado, bloque);
    }

    private BloqueCaja resolverBloque(AuthenticatedUser cajero) {
        return pedidoRepository.bloqueDeCajero(cajero.id())
                .flatMap(BloqueCaja::deId)
                .orElseThrow(CajeroSinBloqueException::new);
    }

    private boolean esOrigenPantalla(String origen) {
        return "PANTALLA_TACTIL".equals(origen);
    }

    private boolean permiteTransicion(PedidoCaja pedido, EstadoPedido nuevoEstado) {
        if (!esOrigenPantalla(pedido.origen())) {
            return pedido.estado().puedeTransicionarA(nuevoEstado);
        }
        if (nuevoEstado == EstadoPedido.CANCELADO) {
            return pedido.estado().puedeCancelarse();
        }
        return switch (pedido.estado()) {
            case PENDIENTE -> nuevoEstado == EstadoPedido.EN_PREPARACION
                    || nuevoEstado == EstadoPedido.ENTREGADO;
            case EN_PREPARACION, LISTO -> nuevoEstado == EstadoPedido.ENTREGADO;
            default -> false;
        };
    }

    private String siguienteEstadoPara(PedidoCaja pedido) {
        if (!esOrigenPantalla(pedido.origen())) {
            return pedido.estado().siguiente().map(EstadoPedido::name).orElse(null);
        }
        return switch (pedido.estado()) {
            case PENDIENTE -> EstadoPedido.EN_PREPARACION.name();
            case EN_PREPARACION, LISTO -> EstadoPedido.ENTREGADO.name();
            default -> null;
        };
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
                siguienteEstadoPara(pedido),
                pedido.estado().puedeCancelarse(),
                pedido.items().stream()
                        .map(item -> new PedidoCajaResponse.Item(item.nombre(), item.cantidad(), item.subtotal()))
                        .toList());
    }
}
