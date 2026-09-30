package com.cafeteria.cafeteria_unifranz.presentation.controller;

import com.cafeteria.cafeteria_unifranz.application.dto.PedidoResponse;
import com.cafeteria.cafeteria_unifranz.application.service.PedidoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping
    public List<PedidoResponse> listar() {
        return pedidoService.listar();
    }

    @PatchMapping("/{id}/avanzar")
    public PedidoResponse avanzar(@PathVariable Long id) {
        return pedidoService.avanzarEstado(id);
    }
}