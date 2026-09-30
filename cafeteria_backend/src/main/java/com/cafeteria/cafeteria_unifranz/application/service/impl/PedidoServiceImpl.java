package com.cafeteria.cafeteria_unifranz.application.service.impl;

import com.cafeteria.cafeteria_unifranz.application.dto.PedidoResponse;
import com.cafeteria.cafeteria_unifranz.application.mapper.PedidoMapper;
import com.cafeteria.cafeteria_unifranz.application.service.PedidoService;
import com.cafeteria.cafeteria_unifranz.domain.exception.PedidoNoEncontradoException;
import com.cafeteria.cafeteria_unifranz.domain.model.Pedido;
import com.cafeteria.cafeteria_unifranz.domain.repository.PedidoRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PedidoServiceImpl implements PedidoService {

    private final PedidoRepository pedidoRepository;
    private final PedidoMapper pedidoMapper;

    public PedidoServiceImpl(PedidoRepository pedidoRepository, PedidoMapper pedidoMapper) {
        this.pedidoRepository = pedidoRepository;
        this.pedidoMapper = pedidoMapper;
    }

    @Override
    public List<PedidoResponse> listar() {
        return pedidoRepository.obtenerTodos().stream()
                .map(pedidoMapper::aRespuesta)
                .toList();
    }

    @Override
    public PedidoResponse avanzarEstado(Long idPedido) {
        Pedido pedido = pedidoRepository.buscarPorId(idPedido)
                .orElseThrow(() -> new PedidoNoEncontradoException(idPedido));

        pedido.avanzarEstado();
        Pedido guardado = pedidoRepository.guardar(pedido);
        return pedidoMapper.aRespuesta(guardado);
    }
}