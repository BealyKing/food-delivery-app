package com.example.appfood.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.appfood.model.Category;
import com.example.appfood.model.FoodItem;

public interface CategoryRepository extends JpaRepository<Category, Long>{
    
}
