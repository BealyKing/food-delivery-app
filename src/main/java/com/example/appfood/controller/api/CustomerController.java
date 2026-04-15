package com.example.appfood.controller.api;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
@PreAuthorize("hasAnyRole('CUSTOMER', 'COURIER', 'ADMIN')")
public class CustomerController {

    @GetMapping("/profile")
    public ResponseEntity<String> getProfile() {
        return ResponseEntity.ok("Customer profile data");
    }

    @GetMapping("/orders")
    public ResponseEntity<String> getOrders() {
        return ResponseEntity.ok("Customer orders list");
    }

    @PostMapping("/orders")
    public ResponseEntity<String> createOrder(@RequestBody String orderData) {
        return ResponseEntity.ok("Order created successfully");
    }
}
