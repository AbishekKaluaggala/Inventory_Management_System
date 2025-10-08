package com.example.service;

import com.example.entity.Order;
import com.example.entity.OrderItem;
import com.example.entity.Product;
import com.example.repository.OrderRepository;
import com.example.repository.OrderItemRepository;
import com.example.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {  // ✅ CORRECT - Changed from "Order" to "OrderService"

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    public Order createOrder(Order order, List<OrderItem> orderItems) {  // ✅ Now works - no conflict
        // Calculate total amount
        BigDecimal totalAmount = orderItems.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);

        // Save order items
        for (OrderItem item : orderItems) {
            item.setOrderId(savedOrder.getOrderId());
            orderItemRepository.save(item);

            // Update product stock
            updateProductStock(item.getProductId(), item.getQuantity());
        }

        return savedOrder;
    }

    private void updateProductStock(String productId, Integer quantity) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            product.setStockQty(product.getStockQty() - quantity);
            productRepository.save(product);
        }
    }

    public List<Order> getAllOrders() {  // ✅ Clean now
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(String id) {  // ✅ Clean now
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByUserId(String userId) {  // ✅ Clean now
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getOrdersByStatus(String status) {  // ✅ Clean now
        return orderRepository.findByStatus(status);
    }

    public Order updateOrderStatus(String orderId, String status) {  // ✅ Clean now
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus(status);
            return orderRepository.save(order);
        }
        return null;
    }

    public List<OrderItem> getOrderItems(String orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }

    public BigDecimal calculateOrderTotal(List<OrderItem> items) {
        return items.stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}