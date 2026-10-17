ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bloque_id integer REFERENCES bloques(id);;

CREATE SEQUENCE IF NOT EXISTS ticket_numero_seq START 1 MINVALUE 1 MAXVALUE 99 CYCLE;;

CREATE OR REPLACE FUNCTION siguiente_ticket() RETURNS varchar AS $$
DECLARE
    candidato varchar;
    intentos integer := 0;
BEGIN
    LOOP
        candidato := lpad(nextval('ticket_numero_seq')::text, 2, '0');
        IF NOT EXISTS (
            SELECT 1 FROM pedidos
            WHERE ticket_numero = candidato
              AND estado IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO')
              AND eliminado_cuando IS NULL
        ) THEN
            RETURN candidato;
        END IF;
        intentos := intentos + 1;
        IF intentos >= 99 THEN
            RAISE EXCEPTION 'No hay tickets disponibles';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;;

ALTER TABLE pedidos ALTER COLUMN ticket_numero SET DEFAULT siguiente_ticket();;

ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_ticket_formato_check;;

ALTER TABLE pedidos ADD CONSTRAINT pedidos_ticket_formato_check
    CHECK (ticket_numero ~ '^(0[1-9]|[1-9][0-9])$') NOT VALID;;

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_bloque_cajero_check;;

ALTER TABLE usuarios ADD CONSTRAINT usuarios_bloque_cajero_check
    CHECK (rol <> 'CAJERO' OR bloque_id IS NOT NULL) NOT VALID;;
