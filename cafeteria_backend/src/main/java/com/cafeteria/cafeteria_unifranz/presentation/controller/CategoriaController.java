package com.cafeteria.cafeteria_unifranz.presentation.controller;

import com.cafeteria.cafeteria_unifranz.application.service.CategoriaService;
import com.cafeteria.cafeteria_unifranz.presentation.dto.CategoriaResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public List<CategoriaResponseDTO> listar() {
        return categoriaService.listarTodas()
                .stream()
                .map(c -> new CategoriaResponseDTO(c.id(), c.nombre()))
                .toList();
    }
}