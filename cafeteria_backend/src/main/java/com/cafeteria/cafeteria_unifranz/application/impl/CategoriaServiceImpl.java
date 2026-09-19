package com.cafeteria.cafeteria_unifranz.application.service.impl;

import com.cafeteria.cafeteria_unifranz.application.service.CategoriaService;
import com.cafeteria.cafeteria_unifranz.domain.model.Categoria;
import com.cafeteria.cafeteria_unifranz.domain.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaServiceImpl implements CategoriaService {

    private final CategoriaRepository categoriaRepository;

    @Override
    public List<Categoria> listarTodas() {
        return categoriaRepository.buscarTodas();
    }
}