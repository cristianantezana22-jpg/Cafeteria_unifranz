package com.cafeteria.cafeteria_unifranz.application.service;

import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence.CustomerOrderEntity;
import com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence.CustomerOrderJpaRepository;
import com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence.OrderItemEntity;
import com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence.ProductEntity;
import com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence.ProductJpaRepository;
import com.cafeteria.cafeteria_unifranz.application.dto.AuthenticatedUser;
import com.cafeteria.cafeteria_unifranz.application.dto.CreateOrderItemRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.CreateOrderRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.OrderItemResponse;
import com.cafeteria.cafeteria_unifranz.application.dto.OrderResponse;

@Service
public class OrderService {

    private static final Set<String> SERVICE_MODES = Set.of("COMER_AQUI", "LLEVAR");
    private static final Set<String> PAYMENT_METHODS = Set.of("QR", "EFECTIVO", "TARJETA");

    private final CustomerOrderJpaRepository orders;
    private final ProductJpaRepository products;

    public OrderService(
            CustomerOrderJpaRepository orders,
            ProductJpaRepository products) {
        this.orders = orders;
        this.products = products;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, AuthenticatedUser user) {
        validateCheckoutOptions(request);

        Long customerId = user == null ? null : user.id().longValue();
        CustomerOrderEntity order = new CustomerOrderEntity(
                customerId,
                request.serviceMode(),
                request.paymentMethod());

        for (CreateOrderItemRequest requestedItem : request.items()) {
            long productId = parseProductId(requestedItem.productId());
            ProductEntity product = products.findById(productId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "El producto " + requestedItem.productId() + " ya no está disponible."));
            order.addItem(new OrderItemEntity(product, requestedItem.quantity()));
        }

        CustomerOrderEntity savedOrder = orders.saveAndFlush(order);
        savedOrder.setOrderNumber(Long.toString(100L + savedOrder.getId()));
        return toResponse(orders.saveAndFlush(savedOrder));
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

    private OrderResponse toResponse(CustomerOrderEntity order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getProductId(),
                        item.getProductName(),
                        item.getUnitPrice(),
                        item.getQuantity(),
                        item.getSubtotal()))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getCustomerId(),
                order.getServiceMode(),
                order.getPaymentMethod(),
                items,
                order.getTotalAmount(),
                order.getCreatedAt());
    }
}
