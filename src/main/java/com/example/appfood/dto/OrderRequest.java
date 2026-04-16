package com.example.appfood.dto;

import lombok.Data;

@Data
public class OrderRequest {
    private String description;
    private Double price;
}
