package com.example.controller;

import com.example.entity.Order;
import com.example.entity.OrderItem;
import com.example.entity.Product;
import com.example.service.OrderService;
import com.example.service.ProductService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList; // ✅ ADD THIS IMPORT
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductService productService; // ✅ This is already injected

    @GetMapping("/manage")
    public String orderManagement(Model model) {
        model.addAttribute("orders", orderService.getAllOrders());
        return "order-list";
    }

    @PostMapping("/create")
    @ResponseBody
    public ResponseEntity<?> createOrder(@RequestParam String customerName,
                                         @RequestParam String shippingAddress,
                                         @RequestParam(required = false) String userId,
                                         @RequestParam List<String> productIds,
                                         @RequestParam List<Integer> quantities) {
        try {
            Order order = new Order();
            order.setCustomerName(customerName);
            order.setShippingAddress(shippingAddress);

            // If no userId provided, use a default
            if (userId == null || userId.isEmpty()) {
                userId = "GUEST";
            }
            order.setUserId(userId);

            // Create order items using the existing private method
            List<OrderItem> orderItems = createOrderItems(productIds, quantities);

            // Call service to create order
            Order savedOrder = orderService.createOrder(order, orderItems);

            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // Keep your existing createOrderItems method - don't change it
    private List<OrderItem> createOrderItems(List<String> productIds, List<Integer> quantities) {
        List<OrderItem> orderItems = new ArrayList<>();

        for (int i = 0; i < productIds.size(); i++) {
            String productId = productIds.get(i);
            Integer quantity = quantities.get(i);

            if (productId == null || productId.isEmpty() || quantity == null || quantity <= 0) {
                continue;
            }

            Optional<Product> productOpt = productService.getProductById(productId);
            if (productOpt.isPresent()) {
                Product product = productOpt.get();

                if (product.getStockQty() < quantity) {
                    throw new RuntimeException("Insufficient stock for product: " + product.getName());
                }

                OrderItem orderItem = new OrderItem(
                        "",
                        productId,
                        quantity,
                        product.getPrice()
                );

                orderItems.add(orderItem);
            }
        }

        return orderItems;
    }

    @GetMapping("/view/{id}")
    public String viewOrder(@PathVariable String id, Model model) {
        Optional<Order> order = orderService.getOrderById(id);
        if (order.isPresent()) {
            model.addAttribute("order", order.get());
            model.addAttribute("orderItems", orderService.getOrderItems(id));
            return "order-details";
        }
        return "redirect:/orders/manage";
    }

    @PostMapping("/update-status")
    public String updateOrderStatus(@RequestParam String orderId,
                                    @RequestParam String status) {
        orderService.updateOrderStatus(orderId, status);
        return "redirect:/orders/manage";
    }

    // REST endpoints for API calls
    @GetMapping("/api/list")
    @ResponseBody
    public List<Order> listOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/api/{id}")
    @ResponseBody
    public Optional<Order> getOrder(@PathVariable String id) {
        return orderService.getOrderById(id);
    }
}