package com.example.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")

public class Product {
    @Id
    @Column(name = "productID")
    private String productId;


    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", nullable = false  )
    private String description;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "stockQty",nullable = false)
    private Integer stockQty;

    @Column(name = "minStockLevel", nullable = false)
    private Integer minStockLevel;

    @Column (name = "maxStockLevel", nullable = false)
    private Integer maxStockLevel;

    public Product(){}

    public Product(String productId, String name,String description,BigDecimal price, Integer stockQty, Integer minStockLevel, Integer maxStockLevel){
        this.productId = productId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stockQty = stockQty;
        this.minStockLevel = minStockLevel;
        this.maxStockLevel = maxStockLevel;
    }


    public String getProductId(){return productId;}
    public void setProductId(String productId){this.productId = productId;}

    public String getName(){return name;}
    public void setName(String name){this. name = name;}

    public String getDescription (){return description;}
    public void setDescription(String description){this.description = description;}

    public BigDecimal getPrice(){return price;}
    public void setPrice (BigDecimal price){this.price = price;}

    public Integer getStockQty(){return stockQty;}
    public void setStockQty(Integer stockQty){this.stockQty = stockQty;}

    public Integer getMinStockLevel(){return minStockLevel;}
    public void setMinStockLevel (Integer minStockLevel){this.minStockLevel = minStockLevel;}

    public Integer getMaxStockLevel(){return maxStockLevel;}
    public void setMaxStockLevel(Integer maxStockLevel){this.maxStockLevel = maxStockLevel;}


    
}
