package com.cafeteria.cafeteria_unifranz.domain.repository;

import com.cafeteria.cafeteria_unifranz.domain.model.Producto;
import java.util.List;

public interface ProductoRepository {
    List<Producto> buscarTodos();
    List<Producto> buscarPorCategoria(Long categoriaId);
}