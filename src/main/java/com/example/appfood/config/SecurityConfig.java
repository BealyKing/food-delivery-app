package com.example.appfood.config;

import com.example.appfood.filter.JwtAuthFilter;
import com.example.appfood.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .authorizeHttpRequests(authz -> authz
                        // Разрешаем доступ к логину, статике и H2
                        .requestMatchers("/auth/**", "/h2-console/**", "/", "/index.html",
                                "/login.html", "/admin.html", "/customer.html", "/courier.html",
                                "/css/**", "/js/**", "/images/**")
                        .permitAll()

                        // ВАЖНО: Разрешаем доступ к меню ВСЕМ (или авторизованным)
                        // Добавляем эту строку перед правилами для admin/customer
                        .requestMatchers("/api/menu/**").permitAll()
                        // Или если хотите только для авторизованных:
                        // .requestMatchers("/api/menu/**").authenticated()

                        // Остальные правила
                        .requestMatchers("/api/admin/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/courier/**")
                        .hasAnyAuthority("COURIER", "ROLE_COURIER", "ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/customer/**")
                        .hasAnyAuthority("CUSTOMER", "ROLE_CUSTOMER", "COURIER", "ROLE_COURIER", "ADMIN", "ROLE_ADMIN")
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }
}