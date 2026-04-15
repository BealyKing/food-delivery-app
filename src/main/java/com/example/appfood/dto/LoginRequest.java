package com.example.appfood.dto;

import lombok.Data;

// DTO для данных входа
@Data
public class LoginRequest {
    private String username; // Имя пользователя
    private String password; // Пароль
}