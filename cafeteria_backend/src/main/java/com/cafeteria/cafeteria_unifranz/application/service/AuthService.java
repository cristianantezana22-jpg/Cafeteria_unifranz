package com.cafeteria.cafeteria_unifranz.application.service;

import com.cafeteria.cafeteria_unifranz.application.dto.LoginRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.LoginResponse;
import com.cafeteria.cafeteria_unifranz.application.dto.CustomerRegistrationRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.GoogleLoginRequest;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    LoginResponse loginWithGoogle(GoogleLoginRequest request);

    LoginResponse register(CustomerRegistrationRequest request);
}
