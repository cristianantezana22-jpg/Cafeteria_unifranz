package com.cafeteria.cafeteria_unifranz.Infraestructure.Web.Config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class PedidosSchemaInitializer implements ApplicationRunner {

    private final JdbcClient jdbc;

    public PedidosSchemaInitializer(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        jdbc.sql("""
                CREATE TABLE IF NOT EXISTS bloques (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR(80)
                )
                """).update();
        jdbc.sql("""
                INSERT INTO bloques (id, nombre)
                SELECT 1, 'Bloque A'
                WHERE NOT EXISTS (SELECT 1 FROM bloques WHERE id = 1)
                """).update();
        jdbc.sql("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bloque_id INTEGER DEFAULT 1").update();
        jdbc.sql("ALTER TABLE usuarios ALTER COLUMN bloque_id SET DEFAULT 1").update();
        jdbc.sql("UPDATE usuarios SET bloque_id = 1 WHERE rol = 'CAJERO' AND bloque_id IS NULL").update();

        jdbc.sql("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS ticket_numero VARCHAR(30)").update();
        jdbc.sql("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS numero_pedido VARCHAR(30)").update();
        jdbc.sql("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS usuario_id INTEGER").update();
        jdbc.sql("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS bloque_id INTEGER").update();
        jdbc.sql("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS origen_pedido VARCHAR(40)").update();
        jdbc.sql("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS estado VARCHAR(30)").update();
        jdbc.sql("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS monto_total NUMERIC(12,2)").update();
        jdbc.sql("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS creado_por VARCHAR(150)").update();
        jdbc.sql("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS creado_cuando TIMESTAMP").update();
        jdbc.sql("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS modificado_cuando TIMESTAMP").update();
        jdbc.sql("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS modificado_por VARCHAR(150)").update();
        jdbc.sql("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS eliminado_cuando TIMESTAMP").update();
        jdbc.sql("ALTER TABLE pedidos ALTER COLUMN ticket_numero DROP NOT NULL").update();
        jdbc.sql("ALTER TABLE pedidos ALTER COLUMN numero_pedido DROP NOT NULL").update();

        jdbc.sql("""
                ALTER TABLE pedidos
                ALTER COLUMN ticket_numero TYPE VARCHAR(30)
                USING TRIM(ticket_numero::text)
                """).update();
        jdbc.sql("""
                ALTER TABLE pedidos
                ALTER COLUMN numero_pedido TYPE VARCHAR(30)
                USING TRIM(numero_pedido::text)
                """).update();

        jdbc.sql("ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_ticket_formato_check").update();
        jdbc.sql("""
                ALTER TABLE pedidos
                ADD CONSTRAINT pedidos_ticket_formato_check
                CHECK (ticket_numero IS NULL OR ticket_numero ~ '^(CQ|PQ|PE|P|C)[0-9]+$' OR ticket_numero ~ '^[0-9]+$')
                """).update();

        jdbc.sql("""
                CREATE TABLE IF NOT EXISTS detalle_pedidos (
                    id SERIAL PRIMARY KEY,
                    pedido_id INTEGER NOT NULL,
                    producto_id INTEGER NOT NULL,
                    cantidad INTEGER NOT NULL,
                    precio_unitario NUMERIC(10,2) NOT NULL,
                    subtotal NUMERIC(12,2) NOT NULL
                )
                """).update();

        jdbc.sql("""
                CREATE TABLE IF NOT EXISTS pagos (
                    id SERIAL PRIMARY KEY,
                    pedido_id INTEGER NOT NULL,
                    metodo_pago VARCHAR(30),
                    estado_pago VARCHAR(30),
                    referencia_transaccion VARCHAR(80),
                    monto NUMERIC(12,2),
                    fecha_pago TIMESTAMP
                )
                """).update();

        jdbc.sql("""
                CREATE TABLE IF NOT EXISTS historial_estados_pedido (
                    id SERIAL PRIMARY KEY,
                    pedido_id INTEGER NOT NULL,
                    estado_anterior VARCHAR(30),
                    estado_nuevo VARCHAR(30),
                    cambiado_por_usuario_id INTEGER
                )
                """).update();

        jdbc.sql("""
                CREATE TABLE IF NOT EXISTS notificaciones (
                    id SERIAL PRIMARY KEY,
                    usuario_id INTEGER,
                    pedido_id INTEGER,
                    mensaje VARCHAR(255)
                )
                """).update();
    }
}
