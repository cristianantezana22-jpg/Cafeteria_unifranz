package com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Repository;

import com.cafeteria.cafeteria_unifranz.Domain.EstadoPedido;
import com.cafeteria.cafeteria_unifranz.Domain.NuevoPedido;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoClienteEstado;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoClienteRepository;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoRegistrado;

@Repository
public class PedidoClienteRepositoryAdapter implements PedidoClienteRepository {

    private static final int BLOQUE_POR_DEFECTO = 1;
    private static final String CLIENTE_MOSTRADOR_EMAIL = "pedidos-mostrador@cafeteria.local";

    private final JdbcClient jdbc;
    private final PasswordEncoder passwordEncoder;

    public PedidoClienteRepositoryAdapter(JdbcClient jdbc, PasswordEncoder passwordEncoder) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public PedidoRegistrado registrar(NuevoPedido pedido) {
        Integer usuarioId = pedido.usuarioId() == null ? clienteMostradorId() : pedido.usuarioId();
        String usuarioEmail = pedido.usuarioEmail() == null ? CLIENTE_MOSTRADOR_EMAIL : pedido.usuarioEmail();

        Integer id = jdbc.sql("""
                        INSERT INTO pedidos (id, ticket_numero, numero_pedido, usuario_id, bloque_id, origen_pedido,
                                             estado, monto_total, creado_por, creado_cuando)
                        VALUES (DEFAULT, NULL, NULL, :usuario, :bloque, :origen, 'PENDIENTE', :total, :email, CURRENT_TIMESTAMP)
                        RETURNING id
                        """)
                .param("usuario", usuarioId)
                .param("bloque", BLOQUE_POR_DEFECTO)
                .param("origen", pedido.origen())
                .param("total", pedido.total())
                .param("email", usuarioEmail)
                .query(Long.class)
                .single()
                .intValue();

        String ticket = generarTicket(pedido, id);
        if (ticket != null) {
            jdbc.sql("""
                            UPDATE pedidos
                            SET ticket_numero = :ticket, numero_pedido = :ticket
                            WHERE id = :id
                            """)
                    .param("ticket", ticket)
                    .param("id", id)
                    .update();
        }

        for (NuevoPedido.Linea linea : pedido.lineas()) {
            jdbc.sql("""
                            INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
                            VALUES (:pedido, :producto, :cantidad, :precio, :subtotal)
                            """)
                    .param("pedido", id)
                    .param("producto", linea.productoId())
                    .param("cantidad", linea.cantidad())
                    .param("precio", linea.precioUnitario())
                    .param("subtotal", linea.subtotal())
                    .update();
        }

        jdbc.sql("""
                        INSERT INTO pagos (pedido_id, metodo_pago, estado_pago, referencia_transaccion, monto)
                        VALUES (:pedido, :metodo, :estado, :referencia, :monto)
                        """)
                .param("pedido", id)
                .param("metodo", pedido.metodoPago())
                .param("estado", "QR".equals(pedido.metodoPago()) ? "COMPLETADO" : "PENDIENTE")
                .param("referencia", pedido.referenciaPago())
                .param("monto", pedido.total())
                .update();
        if ("QR".equals(pedido.metodoPago())) {
            jdbc.sql("UPDATE pagos SET fecha_pago = CURRENT_TIMESTAMP WHERE pedido_id = :id")
                    .param("id", id)
                    .update();
        }

        return new PedidoRegistrado(id, ticket);
    }

    private Integer clienteMostradorId() {
        Optional<Integer> existingId = jdbc.sql("""
                        SELECT id FROM usuarios
                        WHERE email = :email AND rol = 'CLIENTE' AND eliminado_cuando IS NULL
                        """)
                .param("email", CLIENTE_MOSTRADOR_EMAIL)
                .query(Integer.class)
                .optional();
        if (existingId.isPresent()) return existingId.get();

        jdbc.sql("""
                        INSERT INTO usuarios (nombre_completo, email, password_hash, rol)
                        VALUES ('Cliente de mostrador', :email, :password, 'CLIENTE')
                        ON CONFLICT (email) DO NOTHING
                        """)
                .param("email", CLIENTE_MOSTRADOR_EMAIL)
                .param("password", passwordEncoder.encode(UUID.randomUUID().toString()))
                .update();

        return jdbc.sql("""
                        SELECT id FROM usuarios
                        WHERE email = :email AND rol = 'CLIENTE' AND eliminado_cuando IS NULL
                        """)
                .param("email", CLIENTE_MOSTRADOR_EMAIL)
                .query(Integer.class)
                .single();
    }

    @Override
    public Optional<PedidoClienteEstado> estadoDe(Integer pedidoId, Integer usuarioId) {
        return jdbc.sql("""
                        SELECT p.estado, p.ticket_numero, pg.estado_pago
                        FROM pedidos p
                        LEFT JOIN pagos pg ON pg.pedido_id = p.id
                        WHERE p.id = :id AND p.usuario_id = :usuario AND p.eliminado_cuando IS NULL
                        """)
                .param("id", pedidoId)
                .param("usuario", usuarioId)
                .query((rs, rowNum) -> new PedidoClienteEstado(
                        EstadoPedido.valueOf(rs.getString("estado")),
                        rs.getString("ticket_numero"),
                        rs.getString("estado_pago")))
                .optional();
    }

    private String generarTicket(NuevoPedido pedido, Integer id) {
        if ("PANTALLA_TACTIL".equals(pedido.origen()) && "EFECTIVO".equals(pedido.metodoPago())) {
            return null;
        }
        String prefijo = "PANTALLA_TACTIL".equals(pedido.origen()) ? "PQ" : "CQ";
        if ("PANTALLA_TACTIL".equals(pedido.origen()) && !"QR".equals(pedido.metodoPago())) {
            return null;
        }
        return prefijo + id;
    }
}