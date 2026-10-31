package com.cafeteria.cafeteria_unifranz.application.service.Impl;

import com.cafeteria.cafeteria_unifranz.Domain.Usuario;
import com.cafeteria.cafeteria_unifranz.Domain.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario crearUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public void eliminarUsuario(Integer id) {
        usuarioRepository.deleteById(id);
    }
}