package com.example.appfood.controller.api;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courier")
@PreAuthorize("hasAnyRole('COURIER', 'ADMIN')")
public class CourierController {

    @GetMapping("/orders")
    public ResponseEntity<String> getOrders() {
        return ResponseEntity.ok("Courier orders list");
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<String> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok("Order " + id + " status updated to " + status);
    }
}
