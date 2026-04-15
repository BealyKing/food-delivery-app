package com.example.appfood.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.appfood.dto.LoginRequest;
import com.example.appfood.dto.RegisterRequest;
import com.example.appfood.service.AuthService;

@RestController // Указывает, что этот класс — REST-контроллер (возвращает JSON)
@RequestMapping("/auth") // Все эндпоинты в этом контроллере будут начинаться с "/auth"
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    /**
     * Обрабатывает POST-запрос на /auth/register.
     * Принимает JSON с логином и паролем.
     */
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request){

        //Вызываем метод сервиса для регистрации
        String result = authService.register(request);
        // Возвращаем ответ с кодом 200 OK и сообщением
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login") // Обрабатывает POST-запросы на "/auth/login"
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        // Вызываем метод сервиса для входа
        String result = authService.login(request);
        // Возвращаем ответ с кодом 200 OK и сообщением
        return ResponseEntity.ok(result);
    }
}
