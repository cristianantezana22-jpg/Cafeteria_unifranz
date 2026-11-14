package com.cafeteria.cafeteria_unifranz.Infraestructure.Web.Config;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.cafeteria.cafeteria_unifranz.application.service.NotificadorTiempoReal;

import jakarta.annotation.PreDestroy;

@Component
public class SseNotificadorAdapter implements NotificadorTiempoReal {

    private final Set<SseEmitter> emisores = ConcurrentHashMap.newKeySet();
    private final ScheduledExecutorService latido = Executors.newSingleThreadScheduledExecutor(tarea -> {
        Thread hilo = new Thread(tarea, "sse-latido");
        hilo.setDaemon(true);
        return hilo;
    });

    public SseNotificadorAdapter() {
        latido.scheduleAtFixedRate(this::enviarLatido, 20, 20, TimeUnit.SECONDS);
    }

    public SseEmitter suscribir() {
        SseEmitter emisor = new SseEmitter(0L); // sin timeout: EventSource reconecta solo
        emisores.add(emisor);
        emisor.onCompletion(() -> emisores.remove(emisor));
        emisor.onTimeout(() -> emisores.remove(emisor));
        emisor.onError(error -> emisores.remove(emisor));
        try {
            emisor.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException ex) {
            emisores.remove(emisor);
        }
        return emisor;
    }

    @Override
    public void pedidosActualizados(Integer pedidoId) {
        despuesDelCommit(() -> emitir("orders-changed", pedidoId));
    }

    @Override
    public void productosActualizados(Integer productoId) {
        despuesDelCommit(() -> emitir("products-changed", productoId));
    }


    private void despuesDelCommit(Runnable accion) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    accion.run();
                }
            });
        } else {
            accion.run();
        }
    }

    private void emitir(String evento, Object id) {
        for (SseEmitter emisor : emisores) {
            try {
                emisor.send(SseEmitter.event().name(evento).data(String.valueOf(id)));
            } catch (Exception ex) {
                emisores.remove(emisor);
            }
        }
    }

    private void enviarLatido() {
        for (SseEmitter emisor : emisores) {
            try {
                emisor.send(SseEmitter.event().comment("ping"));
            } catch (Exception ex) {
                emisores.remove(emisor);
            }
        }
    }

    @PreDestroy
    void cerrar() {
        latido.shutdownNow();
    }
}