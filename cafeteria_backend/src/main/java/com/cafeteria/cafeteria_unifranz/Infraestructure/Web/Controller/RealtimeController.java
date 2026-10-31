package com.cafeteria.cafeteria_unifranz.Infraestructure.Web.Controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.cafeteria.cafeteria_unifranz.Infraestructure.Web.Config.SseNotificadorAdapter;

@RestController
@RequestMapping("/api/stream")
public class RealtimeController {

    private final SseNotificadorAdapter notificador;

    public RealtimeController(SseNotificadorAdapter notificador) {
        this.notificador = notificador;
    }

    @GetMapping(path = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter events() {
        return notificador.suscribir();
    }
}