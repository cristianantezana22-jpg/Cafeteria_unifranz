package com.cafeteria.cafeteria_unifranz.controller;

import com.cafeteria.cafeteria_unifranz.dto.KioskOrderRequest;
import com.cafeteria.cafeteria_unifranz.dto.KioskOrderResponse;
import com.cafeteria.cafeteria_unifranz.service.KioskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/kiosk")
@CrossOrigin(origins = "*")
public class KioskController {

    private final KioskService kioskService;

    public KioskController(KioskService kioskService) {
        this.kioskService = kioskService;
    }

    @PostMapping("/orders")
    public ResponseEntity<KioskOrderResponse> createOrder(@RequestBody KioskOrderRequest orderRequest) {
        KioskOrderResponse response = kioskService.processOrder(orderRequest);
        return ResponseEntity.ok(response);
    }
}