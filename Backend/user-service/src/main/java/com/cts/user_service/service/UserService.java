package com.cts.user_service.service;

import com.cts.user_service.dto.*;

import java.util.List;

public interface UserService {
    AuthResponseDto createUser(UserDto userDto);
    List<UserResponseDto> getAllUsers();
    UserResponseDto getUserById(String id);
    UserResponseDto updateUser(String id, UserDto userDto);
    UserResponseDto updateUser(String id, UserUpdateDto userUpdateDto);
    void changePassword(String id, ChangePasswordDto changePasswordDto);
    void deleteUser(String id);
    UserResponseDto updateLoyaltyPoints(String userId, Long points);
}