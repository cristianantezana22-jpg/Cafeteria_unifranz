package com.cafeteria.cafeteria_unifranz.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.cafeteria.cafeteria_unifranz.Domain.NuevoPedido;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoClienteRepository;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoRegistrado;
import com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence.ProductEntity;
import com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence.ProductJpaRepository;
import com.cafeteria.cafeteria_unifranz.application.dto.AuthenticatedUser;
import com.cafeteria.cafeteria_unifranz.application.dto.CreateOrderItemRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.CreateOrderRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.OrderResponse;

class OrderServiceTest {

    private final ProductJpaRepository products = mock(ProductJpaRepository.class);
    private final PedidoClienteRepository orders = mock(PedidoClienteRepository.class);
    private final NotificadorTiempoReal notifier = mock(NotificadorTiempoReal.class);
    private final OrderService service = new OrderService(products, orders, notifier);

    @BeforeEach
    void setUp() {
        ProductEntity product = mock(ProductEntity.class);
        when(product.getId()).thenReturn(11L);
        when(product.getName()).thenReturn("Café");
        when(product.getPrice()).thenReturn(new BigDecimal("8.50"));
        when(product.isAvailable()).thenReturn(true);
        when(products.findById(11L)).thenReturn(Optional.of(product));
        when(orders.registrar(any(NuevoPedido.class)))
                .thenReturn(new PedidoRegistrado(42, "42"));
    }

    @Test
    void createsGuestOrderWithSafeDefaultsForMissingCheckoutOptions() {
        CreateOrderRequest request = new CreateOrderRequest(
                List.of(new CreateOrderItemRequest("11", 2)),
                null,
                null,
                null);

        OrderResponse response = service.createOrder(request, null);

        assertEquals("COMER_AQUI", response.serviceMode());
        assertEquals("QR", response.paymentMethod());
        assertEquals(new BigDecimal("17.00"), response.totalAmount());

        ArgumentCaptor<NuevoPedido> orderCaptor = ArgumentCaptor.forClass(NuevoPedido.class);
        verify(orders).registrar(orderCaptor.capture());
        assertNull(orderCaptor.getValue().usuarioId());
        assertEquals("QR", orderCaptor.getValue().metodoPago());
        assertEquals("WEB_MOVIL", orderCaptor.getValue().origen());
        verify(notifier).pedidosActualizados(42);
    }

    @Test
    void handlesAnAuthenticatedPrincipalWithoutARole() {
        AuthenticatedUser user = new AuthenticatedUser(7, "customer@example.test", null);
        CreateOrderRequest request = new CreateOrderRequest(
                List.of(new CreateOrderItemRequest("11", 1)),
                null,
                null,
                null);

        OrderResponse response = service.createOrder(request, user);

        assertEquals("COMER_AQUI", response.serviceMode());
        assertEquals("QR", response.paymentMethod());
        ArgumentCaptor<NuevoPedido> orderCaptor = ArgumentCaptor.forClass(NuevoPedido.class);
        verify(orders).registrar(orderCaptor.capture());
        assertEquals("WEB_MOVIL", orderCaptor.getValue().origen());
    }
}
