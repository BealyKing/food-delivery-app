package com.example.appfood.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // 1. Добавить импорт
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonIgnore // 2. ДОБАВИТЬ ЭТУ АННОТАЦИЮ, чтобы разорвать цикл
    private Order order;

    @ManyToOne
    @JoinColumn(name = "food_item_id")
    private FoodItem foodItem;

    private Integer quantity;
    private Double price;

    public OrderItem(FoodItem foodItem, Integer quantity, Double price) {
        this.foodItem = foodItem;
        this.quantity = quantity;
        this.price = price;
    }
}