package com.cafeteria.cafeteria_unifranz.application.service;

import com.cafeteria.cafeteria_unifranz.application.dto.LoginRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}