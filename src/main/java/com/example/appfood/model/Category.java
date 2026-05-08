package com.example.appfood.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // <--- ДОБАВИТЬ ЭТОТ ИМПОРТ
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;

    // Игнорируем это поле при превращении в JSON, чтобы избежать цикла
    @JsonIgnore 
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FoodItem> items;
}