package com.example.appfood.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.appfood.dto.LoginRequest;
import com.example.appfood.dto.RegisterRequest;
import com.example.appfood.model.Role;
import com.example.appfood.model.User;
import com.example.appfood.repository.UserRepository;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

     /**
     * Регистрация нового пользователя.
     * Хэширует пароль и сохраняет пользователя.
     *
     * @param request Данные регистрации.
     * @return Сообщение об успехе.
     */

    public String register(RegisterRequest request){
        //1. Создаем новый объект User
        User user = new User();
        
         // 2. Устанавливаем имя пользователя из запроса
         user.setUsername(request.getUsername());

         // 3. Хэшируем пароль и устанавливаем его
         user.setPassword(passwordEncoder.encode(request.getPassword()));

         // 4. Устанавливаем роль по умолчанию
         user.setRole(Role.CUSTOMER);

         // 5. Сохраняем пользователя в базе данных
         userRepository.save(user);

         // 6. Возвращаем сообщение об успешной регистрации
         return "User registered successfully";
    }

    /**
     * Вход пользователя.
     * Проверяет логин и пароль через AuthenticationManager.
     *
     * @param request Данные для входа.
     * @return Сообщение об успехе.
     */
    public String login(LoginRequest request) {
    // 1. Создаём объект аутентификации с данными из запроса (логин и пароль).
    // Это внутренний объект Spring Security, НЕ токен для клиента.
    UsernamePasswordAuthenticationToken authToken =
         new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());

    // 2. Проверяем логин и пароль через Spring Security.
    // authenticationManager проверит, существует ли пользователь,
    // и совпадает ли введённый пароль с зашифрованным в БД.
    Authentication authentication = authenticationManager.authenticate(authToken);

    // 3. Если аутентификация успешна, устанавливаем результат в SecurityContext.
    // Это позволяет Spring Security "помнить", кто вошёл в систему в рамках текущего запроса.
    // В реальных приложениях это часто используется с сессиями.
    SecurityContextHolder.getContext().setAuthentication(authentication);

    // 4. Возвращаем сообщение об успешном входе.
    // Мы НЕ генерируем и НЕ возвращаем JWT-токен или что-то подобное.
    return "Login successful";
}


}
