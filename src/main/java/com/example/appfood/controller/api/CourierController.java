package com.example.appfood.controller.api;

import com.example.appfood.model.Order;
import com.example.appfood.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courier")
@PreAuthorize("hasAnyRole('COURIER', 'ADMIN')")
public class CourierController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getOrders() {
        return ResponseEntity.ok(orderService.getAvailableOrders());
    }

    @PostMapping("/orders/{id}/take")
    public ResponseEntity<Order> takeOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.takeOrder(id));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
}
