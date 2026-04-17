package com.example.appfood.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.appfood.model.FoodItem;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    List<FoodItem> findByCategoryId(Long categoryId);
}
