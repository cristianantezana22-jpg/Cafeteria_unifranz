package com.cafeteria.cafeteria_unifranz.Infraestructure.Web.Controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.cafeteria.cafeteria_unifranz.application.dto.ActualizarEstadoRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.AuthenticatedUser;
import com.cafeteria.cafeteria_unifranz.application.dto.CajeroPerfilResponse;
import com.cafeteria.cafeteria_unifranz.application.dto.PedidoCajaResponse;
import com.cafeteria.cafeteria_unifranz.application.service.CajeroService;

@RestController
@RequestMapping("/api/cajero")
@PreAuthorize("hasRole('CAJERO')")
public class CajeroController {

    private final CajeroService cajeroService;

    public CajeroController(CajeroService cajeroService) {
        this.cajeroService = cajeroService;
    }

    @GetMapping("/perfil")
    public CajeroPerfilResponse perfil(@AuthenticationPrincipal AuthenticatedUser cajero) {
        return cajeroService.perfil(cajero);
    }

    @GetMapping("/pedidos")
    public List<PedidoCajaResponse> pedidos(@AuthenticationPrincipal AuthenticatedUser cajero) {
        return cajeroService.listarPedidos(cajero);
    }

    @PatchMapping("/pedidos/{id}/estado")
    public PedidoCajaResponse actualizarEstado(@AuthenticationPrincipal AuthenticatedUser cajero,
                                               @PathVariable Integer id,
                                               @Valid @RequestBody ActualizarEstadoRequest request) {
        return cajeroService.actualizarEstado(cajero, id, request.estado());
    }
}
