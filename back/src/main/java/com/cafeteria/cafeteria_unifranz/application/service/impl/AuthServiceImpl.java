package com.cafeteria.cafeteria_unifranz.application.service.impl;

import com.cafeteria.cafeteria_unifranz.application.dto.LoginRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.LoginResponse;
import com.cafeteria.cafeteria_unifranz.application.service.AuthService;
import com.cafeteria.cafeteria_unifranz.domain.exception.CredencialesInvalidasException;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Override
    public LoginResponse login(LoginRequest request) {
        boolean valido = "cajero".equals(request.usuario()) && "1234".equals(request.password());
        if (!valido) {
            throw new CredencialesInvalidasException();
        }
        return new LoginResponse("Cajero UNIFRANZ", "token-simulado");
    }
}