package com.cafeteria.cafeteria_unifranz.application.service.impl;

import com.cafeteria.cafeteria_unifranz.application.service.ProductoService;
import com.cafeteria.cafeteria_unifranz.domain.model.Producto;
import com.cafeteria.cafeteria_unifranz.domain.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;

    @Override
    public List<Producto> listarTodos() {
        return productoRepository.buscarTodos();
    }

    @Override
    public List<Producto> listarPorCategoria(Long categoriaId) {
        return productoRepository.buscarPorCategoria(categoriaId);
    }
}