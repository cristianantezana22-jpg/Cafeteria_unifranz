package com.cafeteria.cafeteria_unifranz.service;

import com.cafeteria.cafeteria_unifranz.dto.KioskOrderRequest;
import com.cafeteria.cafeteria_unifranz.dto.KioskOrderResponse;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class KioskService {

    private final ConcurrentHashMap<String, AtomicInteger> blockCounters = new ConcurrentHashMap<>();

    public KioskOrderResponse processOrder(KioskOrderRequest request) {

        String rawBlock = (request.getBlock() != null) ? request.getBlock().toUpperCase() : "A";
        String blockLetter = rawBlock.contains("B") ? "B" : "A";

        blockCounters.putIfAbsent(blockLetter, new AtomicInteger(0));
        AtomicInteger counter = blockCounters.get(blockLetter);

        int ticketNum = counter.incrementAndGet();
        if (ticketNum > 100) {
            counter.set(1);
            ticketNum = 1;
        }

        String formattedTicket = String.format("%s%02d", blockLetter, ticketNum);

        return new KioskOrderResponse(
            "SUCCESS",
            formattedTicket,
            "Pedido creado correctamente desde la pantalla",
            10
        );
    }
}