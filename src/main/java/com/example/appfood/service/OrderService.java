package com.example.appfood.service;

import com.example.appfood.dto.OrderItemRequest; // Импорт DTO для элементов заказа
import com.example.appfood.model.FoodItem;
import com.example.appfood.model.Order;
import com.example.appfood.model.OrderItem;
import com.example.appfood.model.Role;
import com.example.appfood.model.User;
import com.example.appfood.repository.FoodItemRepository; // Новый репозиторий
import com.example.appfood.repository.OrderRepository;
import com.example.appfood.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FoodItemRepository foodItemRepository; // Добавляем репозиторий еды

    /**
     * Создать новый заказ (доступно только CUSTOMER)
     * Теперь принимает список товаров вместо одной строки описания
     */
    @Transactional
    public Order createOrder(List<OrderItemRequest> itemsRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.CUSTOMER && currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only customers can create orders");
        }

        Order order = new Order();
        order.setCustomer(currentUser);
        order.setStatus("NEW");
        // Описание и цену больше не устанавливаем вручную, они считаются из элементов

        double totalSum = 0.0;

        for (OrderItemRequest itemReq : itemsRequest) {
            // Находим товар в БД
            FoodItem food = foodItemRepository.findById(itemReq.getFoodItemId())
                    .orElseThrow(() -> new RuntimeException("Товар с ID " + itemReq.getFoodItemId() + " не найден"));

            // Создаем позицию заказа
            OrderItem orderItem = new OrderItem();
            orderItem.setFoodItem(food);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPrice(food.getPrice()); // Фиксируем цену на момент покупки
            orderItem.setOrder(order); // Связываем с заказом

            // Добавляем позицию в заказ
            order.addItem(orderItem);

            totalSum += food.getPrice() * itemReq.getQuantity();
        }

        order.setTotalPrice(totalSum);
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
    @Transactional
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
    @Transactional
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

    /**
     * Удалить заказ (для ADMIN)
     */
    @Transactional
    public void deleteOrder(Long orderId) {
        // Можно добавить проверку прав, если метод вызывается напрямую,
        // но обычно это контролируется в контроллере через аннотации Security
        orderRepository.deleteById(orderId);
    }

    // Получить заказы текущего курьера
    public List<Order> getMyCourierOrders() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.COURIER && currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Access denied");
        }

        // Фильтрация: где курьер == текущий пользователь
        return orderRepository.findAll().stream()
                .filter(o -> o.getCourier() != null && o.getCourier().getId().equals(currentUser.getId()))
                .toList();
    }
}