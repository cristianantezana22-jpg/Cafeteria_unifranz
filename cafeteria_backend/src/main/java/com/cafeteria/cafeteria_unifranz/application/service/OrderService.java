package com.cafeteria.cafeteria_unifranz.application.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.cafeteria.cafeteria_unifranz.Domain.NuevoPedido;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoClienteRepository;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoNoEncontradoException;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoRegistrado;
import com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence.ProductEntity;
import com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence.ProductJpaRepository;
import com.cafeteria.cafeteria_unifranz.application.dto.AuthenticatedUser;
import com.cafeteria.cafeteria_unifranz.application.dto.CreateOrderItemRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.CreateOrderRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.OrderItemResponse;
import com.cafeteria.cafeteria_unifranz.application.dto.OrderResponse;
import com.cafeteria.cafeteria_unifranz.application.dto.PedidoEstadoResponse;

@Service
public class OrderService {

    private static final Set<String> SERVICE_MODES = Set.of("COMER_AQUI", "LLEVAR");
    private static final Set<String> PAYMENT_METHODS = Set.of("QR", "EFECTIVO", "TARJETA", "YA_PAGO");

    private final ProductJpaRepository products;
    private final PedidoClienteRepository pedidos;
    private final NotificadorTiempoReal notificador;

    public OrderService(
            ProductJpaRepository products,
            PedidoClienteRepository pedidos,
            NotificadorTiempoReal notificador) {
        this.products = products;
        this.pedidos = pedidos;
        this.notificador = notificador;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, AuthenticatedUser user) {
        validateCheckoutOptions(request);

        Map<Long, Integer> quantities = new LinkedHashMap<>();
        for (CreateOrderItemRequest requestedItem : request.items()) {
            quantities.merge(parseProductId(requestedItem.productId()), requestedItem.quantity(), Integer::sum);
        }

        List<NuevoPedido.Linea> lines = new ArrayList<>();
        for (Map.Entry<Long, Integer> entry : quantities.entrySet()) {
            ProductEntity product = products.findById(entry.getKey())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "El producto " + entry.getKey() + " ya no está disponible."));
            if (!product.isAvailable()) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Producto agotado: " + product.getName() + ".");
            }
            lines.add(new NuevoPedido.Linea(
                    product.getId().intValue(), product.getName(), entry.getValue(), product.getPrice()));
        }

        String requestedMethod = request.paymentMethod() == null ? "EFECTIVO" : request.paymentMethod();
        boolean alreadyPaid = "YA_PAGO".equals(requestedMethod);
        NuevoPedido newOrder = new NuevoPedido(
                user == null ? null : user.id(),
                user == null ? null : user.email(),
                user != null && "PANTALLA".equals(user.role().name()) ? "PANTALLA_TACTIL" : "WEB_MOVIL",
                alreadyPaid ? "QR" : requestedMethod,
                alreadyPaid ? "YA_PAGO" : null,
                lines);

        PedidoRegistrado saved = pedidos.registrar(newOrder);
        notificador.pedidosActualizados(saved.id());

        List<OrderItemResponse> items = lines.stream()
                .map(line -> new OrderItemResponse(
                        line.productoId().longValue(), line.nombre(), line.precioUnitario(),
                        line.cantidad(), line.subtotal()))
                .toList();
        BigDecimal total = newOrder.total();
        return new OrderResponse(
                saved.id().longValue(), saved.ticket(), user == null ? null : user.id().longValue(),
                request.serviceMode(), requestedMethod, items, total, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public PedidoEstadoResponse estadoDePedido(Integer pedidoId, AuthenticatedUser user) {
        return pedidos.estadoDe(pedidoId, user.id())
                .map(estado -> new PedidoEstadoResponse(estado.name()))
                .orElseThrow(PedidoNoEncontradoException::new);
    }

    private void validateCheckoutOptions(CreateOrderRequest request) {
        if (request.serviceMode() != null && !SERVICE_MODES.contains(request.serviceMode())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La modalidad debe ser COMER_AQUI o LLEVAR.");
        }
        if (request.paymentMethod() != null && !PAYMENT_METHODS.contains(request.paymentMethod())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El método de pago no es válido.");
        }
    }

    private long parseProductId(String productId) {
        try {
            long id = Long.parseLong(productId);
            if (id > 0) {
                return id;
            }
        } catch (NumberFormatException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de producto no es válido.",
                    exception);
        }
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El identificador de producto no es válido.");
    }
}