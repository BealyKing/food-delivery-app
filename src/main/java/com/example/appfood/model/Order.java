package com.example.appfood.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User customer;

    @ManyToOne
    @JoinColumn(name = "courier_id")
    private User courier;

    private String status = "NEW"; // NEW, IN_PROGRESS, DELIVERED, CANCELLED

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    private Double totalPrice = 0.0;

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
        this.totalPrice += item.getPrice() * item.getQuantity();
    }
}