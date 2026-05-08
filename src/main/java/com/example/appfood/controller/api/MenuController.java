package com.example.appfood.controller.api;

import com.example.appfood.model.Category;
import com.example.appfood.model.FoodItem;
import com.example.appfood.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
public class MenuController {

    @Autowired
    private MenuService menuService;

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(menuService.getAllCategories());
    }

    @GetMapping("/items")
    public ResponseEntity<List<FoodItem>> getFoodItems() {
        return ResponseEntity.ok(menuService.getAllFood());
    }
    
    // Опционально: получить товары конкретной категории
    @GetMapping("/items/category/{categoryId}")
    public ResponseEntity<List<FoodItem>> getItemsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(menuService.getFoodByCategory(categoryId));
    }
}