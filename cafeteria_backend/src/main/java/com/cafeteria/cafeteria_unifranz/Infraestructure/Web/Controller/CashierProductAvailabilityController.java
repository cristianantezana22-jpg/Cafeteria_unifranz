package com.cafeteria.cafeteria_unifranz.Infraestructure.Web.Controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.cafeteria.cafeteria_unifranz.application.dto.AuthenticatedUser;
import com.cafeteria.cafeteria_unifranz.application.dto.ProductAvailabilityRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.ProductAvailabilityResponse;
import com.cafeteria.cafeteria_unifranz.application.service.CatalogService;

@RestController
@RequestMapping("/api/cajero/menu/products")
@PreAuthorize("hasRole('CAJERO')")
public class CashierProductAvailabilityController {

    private final CatalogService catalogService;

    public CashierProductAvailabilityController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @PatchMapping("/{id}/availability")
    public ProductAvailabilityResponse changeAvailability(
            @PathVariable Long id,
            @Valid @RequestBody ProductAvailabilityRequest request,
            @AuthenticationPrincipal AuthenticatedUser cajero) {
        return catalogService.changeAvailability(id, request.available(), cajero.email());
    }
}