UPDATE usuarios SET bloque_id = 1 WHERE email = 'cajero1@cafeteria.com' AND bloque_id IS NULL;;

UPDATE usuarios SET bloque_id = 2 WHERE email = 'cajero@cafeteria.com' AND bloque_id IS NULL;;

UPDATE usuarios
SET password_hash = '$2a$10$SBSf084F19qJcWSMxDMVN.ZyKR0kdN7Bs9DlexJyLPyP/BNuZXQ8O'
WHERE password_hash NOT LIKE '$2%';;

INSERT INTO usuarios (nombre_completo, email, password_hash, rol, bloque_id, creado_por)
SELECT 'Cajero Bloque A', 'cajero.a@cafeteria.com',
       '$2a$10$SBSf084F19qJcWSMxDMVN.ZyKR0kdN7Bs9DlexJyLPyP/BNuZXQ8O', 'CAJERO', 1, 'seed'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'cajero.a@cafeteria.com');;

INSERT INTO usuarios (nombre_completo, email, password_hash, rol, bloque_id, creado_por)
SELECT 'Cajero Bloque B', 'cajero.b@cafeteria.com',
       '$2a$10$SBSf084F19qJcWSMxDMVN.ZyKR0kdN7Bs9DlexJyLPyP/BNuZXQ8O', 'CAJERO', 2, 'seed'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'cajero.b@cafeteria.com');;

DO $$
DECLARE
    cliente integer;
    cat_almuerzo integer;
    cat_bebida integer;
    prod_almuerzo integer;
    prod_cafe integer;
    pid integer;
BEGIN
    IF EXISTS (SELECT 1 FROM pedidos) THEN
        RETURN;
    END IF;

    SELECT id INTO cliente FROM usuarios
    WHERE rol = 'CLIENTE' AND eliminado_cuando IS NULL ORDER BY id LIMIT 1;
    IF cliente IS NULL THEN
        RETURN;
    END IF;

    INSERT INTO categorias (nombre) VALUES ('Almuerzos'), ('Bebidas')
    ON CONFLICT (nombre) DO NOTHING;
    SELECT id INTO cat_almuerzo FROM categorias WHERE nombre = 'Almuerzos';
    SELECT id INTO cat_bebida FROM categorias WHERE nombre = 'Bebidas';

    SELECT id INTO prod_almuerzo FROM productos WHERE nombre = 'Almuerzo del día' LIMIT 1;
    IF prod_almuerzo IS NULL THEN
        INSERT INTO productos (categoria_id, nombre, precio, menu_del_dia)
        VALUES (cat_almuerzo, 'Almuerzo del día', 25, true) RETURNING id INTO prod_almuerzo;
    END IF;

    SELECT id INTO prod_cafe FROM productos WHERE nombre = 'Café americano' LIMIT 1;
    IF prod_cafe IS NULL THEN
        INSERT INTO productos (categoria_id, nombre, precio, menu_del_dia)
        VALUES (cat_bebida, 'Café americano', 8, false) RETURNING id INTO prod_cafe;
    END IF;

    INSERT INTO pedidos (usuario_id, bloque_id, origen_pedido, estado, monto_total)
    VALUES (cliente, 1, 'WEB_MOVIL', 'PENDIENTE', 25) RETURNING id INTO pid;
    INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
    VALUES (pid, prod_almuerzo, 1, 25, 25);
    INSERT INTO pagos (pedido_id, metodo_pago, estado_pago, monto) VALUES (pid, 'QR', 'PENDIENTE', 25);

    INSERT INTO pedidos (usuario_id, bloque_id, origen_pedido, estado, monto_total)
    VALUES (cliente, 2, 'WEB_MOVIL', 'PENDIENTE', 16) RETURNING id INTO pid;
    INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
    VALUES (pid, prod_cafe, 2, 8, 16);
    INSERT INTO pagos (pedido_id, metodo_pago, estado_pago, monto) VALUES (pid, 'EFECTIVO', 'PENDIENTE', 16);

    INSERT INTO pedidos (usuario_id, bloque_id, origen_pedido, estado, monto_total)
    VALUES (cliente, 2, 'PANTALLA_TACTIL', 'EN_PREPARACION', 8) RETURNING id INTO pid;
    INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
    VALUES (pid, prod_cafe, 1, 8, 8);
    INSERT INTO pagos (pedido_id, metodo_pago, estado_pago, monto) VALUES (pid, 'TARJETA', 'COMPLETADO', 8);
END;
$$ LANGUAGE plpgsql;;
