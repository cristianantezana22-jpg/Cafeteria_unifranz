package com.cafeteria.cafeteria_unifranz.infrastructure.persistence.adapter;

import com.cafeteria.cafeteria_unifranz.domain.model.Producto;
import com.cafeteria.cafeteria_unifranz.domain.repository.ProductoRepository;
import com.cafeteria.cafeteria_unifranz.infrastructure.persistence.mapper.ProductoMapper;
import com.cafeteria.cafeteria_unifranz.infrastructure.persistence.repository.ProductoJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class ProductoRepositoryImpl implements ProductoRepository {

    private final ProductoJpaRepository productoJpaRepository;
    private final ProductoMapper productoMapper;

    @Override
    public List<Producto> buscarTodos() {
        return productoJpaRepository.findAll()
                .stream()
                .map(productoMapper::toDomain)
                .toList();
    }

    @Override
    public List<Producto> buscarPorCategoria(Long categoriaId) {
        return productoJpaRepository.findByCategoriaId(categoriaId)
                .stream()
                .map(productoMapper::toDomain)
                .toList();
    }
}