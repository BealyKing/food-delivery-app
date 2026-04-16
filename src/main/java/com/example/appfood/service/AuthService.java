package com.example.appfood.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.example.appfood.dto.LoginRequest;
import com.example.appfood.dto.RegisterRequest;
import com.example.appfood.model.Role;
import com.example.appfood.model.User;
import com.example.appfood.repository.UserRepository;
import com.example.appfood.util.JwtTokenProvider;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    /**
     * Регистрация нового пользователя.
     * Сохраняет пользователя с паролем в открытом виде.
     *
     * @param request Данные регистрации.
     * @return Сообщение об успехе.
     */

    public String register(RegisterRequest request) {
        // 1. Создаем новый объект User
        User user = new User();

        // 2. Устанавливаем имя пользователя из запроса
        user.setUsername(request.getUsername());

        // 3. Устанавливаем пароль без хэширования
        user.setPassword(request.getPassword());

        // 4. Логика установки роли
        Role requestedRole = request.getRole();

        // Если роль явно передана и это CUSTOMER или COURIER, используем её
        if (requestedRole == Role.CUSTOMER) {
            user.setRole(Role.CUSTOMER);
        } else if (requestedRole == Role.COURIER) {
            user.setRole(Role.COURIER);
        } else if (requestedRole == Role.ADMIN) {
            // Проверка для ADMIN остается прежней
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN)
                    .count();
            if (adminCount > 0) {
                return "Error: Admin role is already taken. Only one admin is allowed.";
            }
            user.setRole(Role.ADMIN);
        } else {
            // Если роль не передана или null, по умолчанию CUSTOMER
            user.setRole(Role.CUSTOMER);
        }

        // 5. Сохраняем пользователя в базе данных
        userRepository.save(user);

        // 6. Возвращаем сообщение об успешной регистрации
        return "User registered successfully";
    }

    /**
     * Вход пользователя.
     * Проверяет логин и пароль через AuthenticationManager.
     * Возвращает JWT-токен при успешной аутентификации.
     *
     * @param request Данные для входа.
     * @return JWT-токен.
     */
    public String login(LoginRequest request) {
        // 1. Создаём объект аутентификации с данными из запроса (логин и пароль).
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(request.getUsername(),
                request.getPassword());

        // 2. Проверяем логин и пароль через Spring Security.
        Authentication authentication = authenticationManager.authenticate(authToken);

        // 3. Если аутентификация успешна, устанавливаем результат в SecurityContext.
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 4. Загружаем userDetails для генерации токена
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // 5. Генерируем и возвращаем JWT-токен
        return jwtTokenProvider.generateToken(userDetails);
    }

}
