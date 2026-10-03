package com.cafeteria.cafeteria_unifranz.domain.repository;

import com.cafeteria.cafeteria_unifranz.domain.model.Categoria;
import java.util.List;

public interface CategoriaRepository {
    List<Categoria> buscarTodas();
}