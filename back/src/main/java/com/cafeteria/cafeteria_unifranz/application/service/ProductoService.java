package com.cafeteria.cafeteria_unifranz.application.service;

import com.cafeteria.cafeteria_unifranz.domain.model.Producto;
import java.util.List;

public interface ProductoService {
    List<Producto> listarTodos();
    List<Producto> listarPorCategoria(Long categoriaId);
}