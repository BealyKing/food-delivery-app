package com.example.appfood.dto;

import com.example.appfood.model.Role;
import lombok.Data;

// DTO для данных регистрации
@Data
public class RegisterRequest {
    private String username; // Имя пользователя
    private String password; // Пароль
    private Role role; // Роль пользователя
}