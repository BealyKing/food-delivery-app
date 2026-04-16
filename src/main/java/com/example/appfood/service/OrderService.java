package com.example.appfood.service;

import com.example.appfood.dto.OrderRequest;
import com.example.appfood.model.Order;
import com.example.appfood.model.Role;
import com.example.appfood.model.User;
import com.example.appfood.repository.OrderRepository;
import com.example.appfood.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Создать новый заказ (доступно только CUSTOMER)
     */
    public Order createOrder(OrderRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.CUSTOMER && currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only customers can create orders");
        }

        Order order = new Order();
        order.setDescription(request.getDescription());
        order.setPrice(request.getPrice());
        order.setStatus("NEW");
        order.setCustomer(currentUser);

        return orderRepository.save(order);
    }

    /**
     * Получить все заказы текущего пользователя (CUSTOMER)
     */
    public List<Order> getMyOrders() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderRepository.findByCustomerId(currentUser.getId());
    }

    /**
     * Получить все доступные заказы для курьеров (статус NEW и без курьера)
     */
    public List<Order> getAvailableOrders() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() == Role.ADMIN) {
            return orderRepository.findAll();
        }

        if (currentUser.getRole() != Role.COURIER) {
            throw new RuntimeException("Only couriers can view available orders");
        }

        return orderRepository.findByCourierIsNull();
    }

    /**
     * Взять заказ в работу (доступно только COURIER)
     */
    public Order takeOrder(Long orderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.COURIER && currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only couriers can take orders");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getCourier() != null) {
            throw new RuntimeException("This order is already taken by another courier");
        }

        order.setCourier(currentUser);
        order.setStatus("IN_PROGRESS");

        return orderRepository.save(order);
    }

    /**
     * Обновить статус заказа (доступно COURIER для своих заказов, ADMIN для всех)
     */
    public Order updateOrderStatus(Long orderId, String status) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Проверка прав: ADMIN может всё, COURIER только свои заказы
        if (currentUser.getRole() == Role.COURIER) {
            if (order.getCourier() == null || !order.getCourier().getId().equals(currentUser.getId())) {
                throw new RuntimeException("You can only update status of your own orders");
            }
        } else if (currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only couriers and admins can update order status");
        }

        order.setStatus(status);
        return orderRepository.save(order);
    }

    /**
     * Получить все заказы (для ADMIN)
     */
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
