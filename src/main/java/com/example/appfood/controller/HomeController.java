package com.example.appfood.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "index"; // ищет src/main/resources/templates/index.html (если используется Thymeleaf)
    }
}