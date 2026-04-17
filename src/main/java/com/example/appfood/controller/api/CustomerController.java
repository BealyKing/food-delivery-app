package com.example.appfood.controller.api;

import com.example.appfood.dto.OrderItemRequest; // Убедись, что этот класс есть (см. ниже)
import com.example.appfood.model.Order;
import com.example.appfood.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "*")
public class CustomerController {

    @Autowired
    private OrderService orderService;

    // Создание заказа из списка товаров (корзины)
    @PostMapping("/orders")
    public ResponseEntity<Order> createOrder(@RequestBody List<OrderItemRequest> items) {
        try {
            Order order = orderService.createOrder(items);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Получение своих заказов
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getMyOrders() {
        try {
            return ResponseEntity.ok(orderService.getMyOrders());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}