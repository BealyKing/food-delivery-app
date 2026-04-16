package com.example.appfood.repository;

import com.example.appfood.model.Order;
import com.example.appfood.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByCourierId(Long courierId);
    List<Order> findByCourierIsNull();
}
