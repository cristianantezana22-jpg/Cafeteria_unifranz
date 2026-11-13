package com.cafeteria.cafeteria_unifranz.Domain;

import java.util.Arrays;
import java.util.Optional;

public enum BloqueCaja {
    A(1, "Bloque A", true),
    B(2, "Bloque B", false);

    private final int id;
    private final String etiqueta;
    private final boolean gestionaAlmuerzos;

    BloqueCaja(int id, String etiqueta, boolean gestionaAlmuerzos) {
        this.id = id;
        this.etiqueta = etiqueta;
        this.gestionaAlmuerzos = gestionaAlmuerzos;
    }

    public int id() {
        return id;
    }

    public String etiqueta() {
        return etiqueta;
    }

    public boolean gestionaAlmuerzos() {
        return gestionaAlmuerzos;
    }

    public boolean puedeGestionar(PedidoCaja pedido) {
        return !pedido.almuerzo() || gestionaAlmuerzos;
    }

    public static Optional<BloqueCaja> deId(Integer id) {
        if (id == null) {
            return Optional.empty();
        }
        return Arrays.stream(values()).filter(bloque -> bloque.id == id).findFirst();
    }
}
