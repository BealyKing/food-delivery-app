package com.example.appfood.controller.api;

import com.example.appfood.model.Order;
import com.example.appfood.model.User;
import com.example.appfood.repository.UserRepository;
import com.example.appfood.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderService orderService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(
            @PathVariable Long id,
            @RequestParam String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Проверка: нельзя назначить роль ADMIN, если уже есть администратор
        if (role.equalsIgnoreCase("ADMIN")) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == com.example.appfood.model.Role.ADMIN)
                    .count();
            // Если администратор не этот пользователь и уже есть админ
            if (adminCount > 0 && user.getRole() != com.example.appfood.model.Role.ADMIN) {
                return ResponseEntity.badRequest().body(null);
            }
        }
        
        user.setRole(com.example.appfood.model.Role.valueOf(role.toUpperCase()));
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
}
