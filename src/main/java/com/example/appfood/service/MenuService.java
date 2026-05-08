package com.example.appfood.service;
import com.example.appfood.model.Category;
import com.example.appfood.model.FoodItem;
import com.example.appfood.repository.CategoryRepository;
import com.example.appfood.repository.FoodItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MenuService {
    @Autowired private CategoryRepository categoryRepo;
    @Autowired private FoodItemRepository foodItemRepository;

    public List<Category> getAllCategories() { return categoryRepo.findAll(); }
    
    public Category createCategory(String name) {
        Category c = new Category(); c.setName(name);
        return categoryRepo.save(c);
    }
    
    public void deleteCategory(Long id) { categoryRepo.deleteById(id); }

    public List<FoodItem> getAllFood() { return foodItemRepository.findAll(); }


    public FoodItem createFood(String name, String desc, Double price, String img, Long catId) {
        FoodItem item = new FoodItem(name, desc, price, img);
        Category cat = categoryRepo.findById(catId).orElseThrow();
        item.setCategory(cat);
        return foodItemRepository.save(item);
    }

    public List<FoodItem> getFoodByCategory(Long categoryId) {
        return foodItemRepository.findByCategoryId(categoryId);
    }

    public void deleteFood(Long id) { foodItemRepository.deleteById(id); }

}
