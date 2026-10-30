package com.cafeteria.cafeteria_unifranz.Infraestructure.Web.Config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

/**
 * Prepara en PostgreSQL lo que necesita el panel de administración.
 * Es idempotente: se puede ejecutar en cada arranque sin duplicar nada.
 *
 *  - productos.bloque : en qué bloque se vende el platillo (BLOQUE_A, BLOQUE_B o AMBOS).
 *  - empleados        : personal de la cafetería (no son usuarios de login).
 */
@Component
public class AdminSchemaInitializer implements ApplicationRunner {

    private final JdbcClient jdbc;

    public AdminSchemaInitializer(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        jdbc.sql("""
                ALTER TABLE productos
                ADD COLUMN IF NOT EXISTS bloque VARCHAR(20) NOT NULL DEFAULT 'AMBOS'
                """).update();

        jdbc.sql("""
                CREATE TABLE IF NOT EXISTS empleados (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR(120) NOT NULL,
                    cargo VARCHAR(50) NOT NULL,
                    bloque VARCHAR(20) NOT NULL DEFAULT 'BLOQUE_A',
                    activo BOOLEAN NOT NULL DEFAULT TRUE,
                    creado_cuando TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    creado_por VARCHAR(100),
                    modificado_por VARCHAR(100),
                    modificado_cuando TIMESTAMP,
                    eliminado_por VARCHAR(100),
                    eliminado_cuando TIMESTAMP
                )
                """).update();
    }
}
