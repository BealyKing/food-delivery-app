package com.example.appfood.controller.api;

import com.example.appfood.dto.OrderRequest;
import com.example.appfood.model.Order;
import com.example.appfood.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@PreAuthorize("hasAnyRole('CUSTOMER', 'COURIER', 'ADMIN')")
public class CustomerController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/profile")
    public ResponseEntity<String> getProfile() {
        return ResponseEntity.ok("Customer profile data");
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getOrders() {
        return ResponseEntity.ok(orderService.getMyOrders());
    }

    @PostMapping("/orders")
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest orderData) {
        return ResponseEntity.ok(orderService.createOrder(orderData));
    }
}
