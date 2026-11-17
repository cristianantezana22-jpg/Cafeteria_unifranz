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
import com.cafeteria.cafeteria_unifranz.Domain.PedidoClienteEstado;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoClienteRepository;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoNoEncontradoException;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoRegistrado;
import com.cafeteria.cafeteria_unifranz.Domain.UserRole;
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
    private static final Set<String> PAYMENT_METHODS = Set.of("QR", "EFECTIVO", "YA_PAGO");

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
        CheckoutOptions options = validateCheckoutOptions(request);

        Map<Long, Integer> quantities = new LinkedHashMap<>();
        for (CreateOrderItemRequest requestedItem : request.items()) {
            if (requestedItem == null || requestedItem.quantity() <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Cada producto debe tener una cantidad mayor que cero.");
            }
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

        String requestedMethod = options.paymentMethod();
        boolean alreadyPaid = "YA_PAGO".equals(requestedMethod);
        boolean placedAtKiosk = user != null && user.role() == UserRole.PANTALLA;
        NuevoPedido newOrder = new NuevoPedido(
                user == null ? null : user.id(),
                user == null ? null : user.email(),
                placedAtKiosk ? "PANTALLA_TACTIL" : "WEB_MOVIL",
                alreadyPaid ? "QR" : requestedMethod,
        boolean origenPantalla = user != null && user.role() == UserRole.PANTALLA;
        String paymentMethod = alreadyPaid ? "QR" : requestedMethod;
        if (origenPantalla && !Set.of("QR", "EFECTIVO").contains(paymentMethod)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Las pantallas solo admiten pago QR o en efectivo.");
        }
        if (!origenPantalla && !"QR".equals(paymentMethod)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los pedidos de clientes solo admiten pago QR.");
        }
        String serviceMode = request.serviceMode() == null ? "COMER_AQUI" : request.serviceMode();
        NuevoPedido newOrder = new NuevoPedido(
                user == null ? null : user.id(),
                user == null ? null : user.email(),
                origenPantalla ? "PANTALLA_TACTIL" : "WEB_MOVIL",
                serviceMode,
                paymentMethod,
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
                options.serviceMode(), requestedMethod, items, total, LocalDateTime.now());
                serviceMode, requestedMethod, items, total, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public PedidoEstadoResponse estadoDePedido(Integer pedidoId, AuthenticatedUser user) {
        if (user == null) {
            throw new PedidoNoEncontradoException();
        }
        return pedidos.estadoDe(pedidoId, user.id())
                .map(this::toOrderStatus)
                .orElseThrow(PedidoNoEncontradoException::new);
    }

    private CheckoutOptions validateCheckoutOptions(CreateOrderRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El pedido es obligatorio.");
        }
        if (request.items() == null || request.items().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El pedido debe incluir al menos un producto.");
        }

        String serviceMode = request.serviceMode() == null ? "COMER_AQUI" : request.serviceMode();
        String paymentMethod = request.paymentMethod() == null ? "QR" : request.paymentMethod();
        if (!SERVICE_MODES.contains(serviceMode)) {
    private PedidoEstadoResponse toOrderStatus(PedidoClienteEstado estado) {
        return new PedidoEstadoResponse(estado.estado().name(), estado.ticket(), estado.estadoPago());
    }

    private void validateCheckoutOptions(CreateOrderRequest request) {
        if (request.serviceMode() != null && !SERVICE_MODES.contains(request.serviceMode())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La modalidad debe ser COMER_AQUI o LLEVAR.");
        }
        if (!PAYMENT_METHODS.contains(paymentMethod)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El método de pago no es válido.");
        }
        return new CheckoutOptions(serviceMode, paymentMethod);
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

    private record CheckoutOptions(String serviceMode, String paymentMethod) {
    }
}