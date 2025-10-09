package com.example.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @Column(name = "categoryID", length = 36)
    private String categoryId;

    @Column(name = "categoryName", nullable = false, unique = true)
    private String categoryName;

    @Column(name = "description")
    private String description;

    @Column(name = "isActive", nullable = false)
    private boolean isActive = true;

    public Category() {
        this.categoryId = java.util.UUID.randomUUID().toString();
    }

    // Getters and Setters
    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}