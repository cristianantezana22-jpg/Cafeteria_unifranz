package com.cafeteria.cafeteria_unifranz.Infraestructure.Web.Controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.cafeteria.cafeteria_unifranz.application.dto.AuthenticatedUser;
import com.cafeteria.cafeteria_unifranz.application.dto.CreateOrderRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.ErrorResponse;
import com.cafeteria.cafeteria_unifranz.application.dto.OrderResponse;
import com.cafeteria.cafeteria_unifranz.application.service.OrderService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.cafeteria.cafeteria_unifranz.application.dto.PedidoEstadoResponse;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping({"/api/orders", "/api/pedidos"})
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return orderService.createOrder(request, user);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handlePersistenceFailure(DataAccessException exception) {
        log.error("No se pudo persistir el pedido.", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("No se pudo registrar el pedido."));
    }

    @GetMapping("/{id}/estado")
    public PedidoEstadoResponse estado(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user) {
    return orderService.estadoDePedido(id, user);
    }
}
