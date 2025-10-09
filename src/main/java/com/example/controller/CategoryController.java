package com.example.controller;

import com.example.entity.Category;
import com.example.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // Get all categories
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    // Get active categories
    @GetMapping("/active")
    public ResponseEntity<List<Category>> getActiveCategories() {
        return ResponseEntity.ok(categoryService.getActiveCategories());
    }

    // Get category by ID
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable String id) {
        Optional<Category> category = categoryService.getCategoryById(id);
        return category.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Get category by name
    @GetMapping("/name/{name}")
    public ResponseEntity<Category> getCategoryByName(@PathVariable String name) {
        Optional<Category> category = categoryService.getCategoryByName(name);
        return category.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Create category
    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        Category savedCategory = categoryService.saveCategory(category);
        return ResponseEntity.ok(savedCategory);
    }

    // Update category
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable String id, @RequestBody Category category) {
        category.setCategoryId(id);
        Category updatedCategory = categoryService.saveCategory(category);
        return ResponseEntity.ok(updatedCategory);
    }

    // Toggle category status
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Category> toggleStatus(@PathVariable String id) {
        Category updated = categoryService.toggleCategoryStatus(id);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    // Delete category
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}