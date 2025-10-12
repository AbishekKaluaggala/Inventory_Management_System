package com.example.service;
import com.example.entity.Product;
import com.example.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product saveProduct(Product product){
        return productRepository.save(product);
    }

    public List<Product>getAllProduct(){
        return productRepository.findAll();
    }

    public Optional<Product>getProductById(String productId){
        return productRepository.findById(productId);
    }

    public Product updateStock(String productID, Integer newStock){
        Optional<Product>productOpt = productRepository.findById(productID);
                if(productOpt.isPresent()){
                    Product product = productOpt.get();
                    product.setStockQty(newStock);
                    return productRepository.save(product);
                }
                return null;
    }

    public List<Product> getLowStockProducts(){
        return productRepository.findAll().stream()
                .filter(product -> product.getStockQty()<=product.getMinStockLevel())
                .toList();
    }

    public List<Product>searchProductByName(String keyword){
        return productRepository.findByNameContaining(keyword);
    }

    public void deleteProduct(String productID){
        productRepository.deleteById(productID);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
}
