package com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import com.cafeteria.cafeteria_unifranz.Domain.EstadoPedido;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoCaja;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoCajaItem;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoCajaRepository;

@Repository
public class PedidoCajaRepositoryAdapter implements PedidoCajaRepository {

    private static final String SELECT_PEDIDOS = """
            SELECT p.id, p.ticket_numero, p.estado, p.origen_pedido, p.monto_total, p.creado_cuando,
                   u.nombre_completo AS cliente,
                   pg.metodo_pago, pg.estado_pago,
                   EXISTS (
                       SELECT 1
                       FROM detalle_pedidos d
                       JOIN productos pr ON pr.id = d.producto_id
                       JOIN categorias c ON c.id = pr.categoria_id
                       WHERE d.pedido_id = p.id
                         AND (pr.menu_del_dia IS TRUE OR LOWER(c.nombre) LIKE 'almuerzo%')
                   ) AS almuerzo
            FROM pedidos p
            JOIN usuarios u ON u.id = p.usuario_id
            LEFT JOIN pagos pg ON pg.pedido_id = p.id
            WHERE p.eliminado_cuando IS NULL
            """;

    private final JdbcClient jdbc;

    public PedidoCajaRepositoryAdapter(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<PedidoCaja> listarVigentes() {
        List<PedidoCaja> base = jdbc.sql(SELECT_PEDIDOS + """
                        AND (p.estado IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO')
                             OR (p.estado = 'ENTREGADO' AND p.modificado_cuando >= CURRENT_DATE))
                        ORDER BY p.creado_cuando ASC
                        """)
                .query(this::mapPedido)
                .list();
        return conItems(base);
    }

    @Override
    public Optional<PedidoCaja> buscarPorId(Integer id) {
        List<PedidoCaja> base = jdbc.sql(SELECT_PEDIDOS + " AND p.id = :id")
                .param("id", id)
                .query(this::mapPedido)
                .list();
        return conItems(base).stream().findFirst();
    }

    @Override
    public void cambiarEstado(Integer pedidoId, EstadoPedido anterior, EstadoPedido nuevo, Integer usuarioId, String usuarioEmail) {
        jdbc.sql("""
                        UPDATE pedidos
                        SET estado = :estado, modificado_cuando = CURRENT_TIMESTAMP, modificado_por = :email
                        WHERE id = :id
                        """)
                .param("estado", nuevo.name())
                .param("email", usuarioEmail)
                .param("id", pedidoId)
                .update();

        jdbc.sql("""
                        INSERT INTO historial_estados_pedido (pedido_id, estado_anterior, estado_nuevo, cambiado_por_usuario_id)
                        VALUES (:id, :anterior, :nuevo, :usuario)
                        """)
                .param("id", pedidoId)
                .param("anterior", anterior.name())
                .param("nuevo", nuevo.name())
                .param("usuario", usuarioId)
                .update();

        if (anterior == EstadoPedido.PENDIENTE && nuevo == EstadoPedido.EN_PREPARACION) {
            jdbc.sql("UPDATE pagos SET estado_pago = 'COMPLETADO', fecha_pago = CURRENT_TIMESTAMP WHERE pedido_id = :id")
                    .param("id", pedidoId)
                    .update();
        }
        if (nuevo == EstadoPedido.CANCELADO) {
            jdbc.sql("UPDATE pagos SET estado_pago = 'RECHAZADO' WHERE pedido_id = :id")
                    .param("id", pedidoId)
                    .update();
        }

        jdbc.sql("""
                        INSERT INTO notificaciones (usuario_id, pedido_id, mensaje)
                        SELECT usuario_id, id, :mensaje FROM pedidos WHERE id = :id
                        """)
                .param("mensaje", mensajeCliente(nuevo))
                .param("id", pedidoId)
                .update();
    }

    @Override
    public Optional<Integer> bloqueDeCajero(Integer usuarioId) {
        return jdbc.sql("SELECT bloque_id FROM usuarios WHERE id = :id AND rol = 'CAJERO' AND eliminado_cuando IS NULL")
                .param("id", usuarioId)
                .query((rs, rowNum) -> (Integer) rs.getObject("bloque_id"))
                .optional();
    }

    private PedidoCaja mapPedido(ResultSet rs, int rowNum) throws SQLException {
        return new PedidoCaja(
                rs.getInt("id"),
                rs.getString("ticket_numero"),
                EstadoPedido.valueOf(rs.getString("estado")),
                rs.getString("origen_pedido"),
                rs.getString("cliente"),
                rs.getString("metodo_pago"),
                rs.getString("estado_pago"),
                rs.getBigDecimal("monto_total"),
                rs.getTimestamp("creado_cuando").toLocalDateTime(),
                rs.getBoolean("almuerzo"),
                List.of());
    }

    private List<PedidoCaja> conItems(List<PedidoCaja> pedidos) {
        if (pedidos.isEmpty()) {
            return pedidos;
        }
        List<Integer> ids = pedidos.stream().map(PedidoCaja::id).toList();
        Map<Integer, List<PedidoCajaItem>> itemsPorPedido = new HashMap<>();
        jdbc.sql("""
                        SELECT d.pedido_id, pr.nombre, d.cantidad, d.subtotal
                        FROM detalle_pedidos d
                        JOIN productos pr ON pr.id = d.producto_id
                        WHERE d.pedido_id IN (:ids)
                        ORDER BY d.id ASC
                        """)
                .param("ids", ids)
                .query((rs, rowNum) -> {
                    itemsPorPedido
                            .computeIfAbsent(rs.getInt("pedido_id"), key -> new ArrayList<>())
                            .add(new PedidoCajaItem(
                                    rs.getString("nombre"),
                                    rs.getInt("cantidad"),
                                    rs.getBigDecimal("subtotal")));
                    return rowNum;
                })
                .list();
        return pedidos.stream()
                .map(pedido -> new PedidoCaja(
                        pedido.id(),
                        pedido.ticket(),
                        pedido.estado(),
                        pedido.origen(),
                        pedido.cliente(),
                        pedido.metodoPago(),
                        pedido.estadoPago(),
                        pedido.total(),
                        pedido.creadoEn(),
                        pedido.almuerzo(),
                        itemsPorPedido.getOrDefault(pedido.id(), List.of())))
                .toList();
    }

    private String mensajeCliente(EstadoPedido estado) {
        return switch (estado) {
            case PENDIENTE -> "Estamos confirmando tu pago.";
            case EN_PREPARACION -> "Tu pedido ya está en preparación.";
            case LISTO -> "Tu pedido está listo para recoger.";
            case ENTREGADO -> "Pedido completado. ¡Buen provecho!";
            case CANCELADO -> "Tu pago fue rechazado y el pedido se canceló.";
        };
    }
}
