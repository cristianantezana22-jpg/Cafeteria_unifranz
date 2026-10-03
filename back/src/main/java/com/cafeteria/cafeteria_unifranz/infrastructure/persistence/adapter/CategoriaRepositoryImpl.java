package com.cafeteria.cafeteria_unifranz.infrastructure.persistence.adapter;

import com.cafeteria.cafeteria_unifranz.domain.model.Categoria;
import com.cafeteria.cafeteria_unifranz.domain.repository.CategoriaRepository;
import com.cafeteria.cafeteria_unifranz.infrastructure.persistence.mapper.CategoriaMapper;
import com.cafeteria.cafeteria_unifranz.infrastructure.persistence.repository.CategoriaJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CategoriaRepositoryImpl implements CategoriaRepository {

    private final CategoriaJpaRepository categoriaJpaRepository;
    private final CategoriaMapper categoriaMapper;

    @Override
    public List<Categoria> buscarTodas() {
        return categoriaJpaRepository.findAll()
                .stream()
                .map(categoriaMapper::toDomain)
                .toList();
    }
}