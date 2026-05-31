package com.marketplace.userservice.service;

import com.marketplace.userservice.dto.UpdateProfileRequest;
import com.marketplace.userservice.entity.User;

public interface UserService {
    User updateUserProfile(Long userId, UpdateProfileRequest request);
    void deleteUser(Long userId);
}