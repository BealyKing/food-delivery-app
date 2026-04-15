package com.example.appfood.dto;

import lombok.Data;

// DTO для данных регистрации
@Data
public class RegisterRequest {
    private String username; // Имя пользователя
    private String password; // Пароль
}