package com.example.appfood.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.appfood.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long>{
    
}