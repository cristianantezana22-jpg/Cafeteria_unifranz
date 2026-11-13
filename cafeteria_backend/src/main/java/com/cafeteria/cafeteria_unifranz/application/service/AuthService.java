package com.cafeteria.cafeteria_unifranz.application.service;

import com.cafeteria.cafeteria_unifranz.application.dto.LoginRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.LoginResponse;
import com.cafeteria.cafeteria_unifranz.application.dto.CustomerRegistrationRequest;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    LoginResponse register(CustomerRegistrationRequest request);
}
