package com.marketplace.userservice.service;

import com.marketplace.userservice.dto.*;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}