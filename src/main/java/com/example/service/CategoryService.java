package com.example.service;

import com.example.entity.Category;
import com.example.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    //save category
    public Category saveCategory(Category category){
        return categoryRepository.save(category);
    }

    //get active category
    public List<Category> getActiveCategories(){
        return categoryRepository.findByIsActive(true);
    }

    //get all category
    public List<Category>getAllCategories(){
        return categoryRepository.findAll();
    }

    //get category by id
    public Optional<Category> getCategoryById(String id){
        return categoryRepository.findById(id);
    }

    //get category by name
    public Optional<Category> getCategoryByName(String name){
        return categoryRepository.findByCategoryName(name);
    }

    //toggle category active status
    public Category toggleCategoryStatus(String categoryId){
        Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
        if(categoryOpt.isPresent()){
         Category category = categoryOpt.get();
         category.setActive(!category.isActive());
         return  categoryRepository.save(category);
        }
        return null;
    }

    //delete category
    public void deleteCategory(String id){
        categoryRepository.deleteById(id);
    }
}
