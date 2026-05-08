package com.example.appfood.controller.api;

import com.example.appfood.model.Order;
import com.example.appfood.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courier")
@CrossOrigin(origins = "*")
public class CourierController {

    @Autowired
    private OrderService orderService;

    // Получить все свободные заказы
    @GetMapping("/available")
    public ResponseEntity<List<Order>> getAvailableOrders() {
        return ResponseEntity.ok(orderService.getAvailableOrders());
    }

    // Взять заказ в работу
    @PostMapping("/orders/{id}/take")
    public ResponseEntity<Order> takeOrder(@PathVariable Long id) {
        try {
            Order order = orderService.takeOrder(id);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Получить мои заказы (в работе или доставленные)
    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders() {
        return ResponseEntity.ok(orderService.getMyCourierOrders()); // Нужен новый метод в сервисе
    }

    // Обновить статус
    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            Order order = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}