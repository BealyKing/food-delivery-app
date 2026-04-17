package com.example.appfood.controller.api;

import com.example.appfood.model.Category;
import com.example.appfood.model.FoodItem;
import com.example.appfood.model.Order;
import com.example.appfood.model.User;
import com.example.appfood.service.MenuService; // Новый сервис
import com.example.appfood.service.OrderService;
import com.example.appfood.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private OrderService orderService;

    @Autowired
    private MenuService menuService; // Внедряем сервис меню

    // --- Управление пользователями ---
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    // --- Управление заказами ---
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok().build();
    }

    // --- Управление Меню (Категории) ---
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(menuService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> addCategory(@RequestParam String name) {
        return ResponseEntity.ok(menuService.createCategory(name));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        menuService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    // --- Управление Меню (Еда) ---
    @GetMapping("/food")
    public ResponseEntity<List<FoodItem>> getFoodItems() {
        return ResponseEntity.ok(menuService.getAllFood());
    }

    @PostMapping("/food")
    public ResponseEntity<FoodItem> addFoodItem(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam Double price,
            @RequestParam(required = false) String imageUrl,
            @RequestParam Long categoryId) {
        
        FoodItem item = menuService.createFood(name, description, price, imageUrl, categoryId);
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/food/{id}")
    public ResponseEntity<Void> deleteFoodItem(@PathVariable Long id) {
        menuService.deleteFood(id);
        return ResponseEntity.ok().build();
    }
}