package com.cafeteria.cafeteria_unifranz.Infraestructure.Web.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.cafeteria.cafeteria_unifranz.application.dto.AuthenticatedUser;
import com.cafeteria.cafeteria_unifranz.application.dto.CreateOrderRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.OrderResponse;
import com.cafeteria.cafeteria_unifranz.application.service.OrderService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping({"/api/orders", "/api/pedidos"})
public class OrderController {

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
}
