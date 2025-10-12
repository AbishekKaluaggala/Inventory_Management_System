package com.example.controller;

import com.example.entity.Order;
import com.example.entity.OrderItem;
import com.example.entity.Product;
import com.example.service.OrderService;
import com.example.service.ProductService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
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

    @GetMapping("/create")
    public String showCreateOrderForm(Model model) {
        model.addAttribute("order", new Order());
        model.addAttribute("products", productService.getAllProducts());
        return "create-order";
    }

    @PostMapping("/create")
    public String createOrder(@ModelAttribute Order order,
                              @RequestParam List<String> productIds,
                              @RequestParam List<Integer> quantities,
                              HttpSession session) {
        // Get logged in user
        var user = session.getAttribute("loggedInUser");
        if (user instanceof com.example.entity.User) {
            order.setUserId(((com.example.entity.User) user).getUserId());
        }

        // Create order items
        List<OrderItem> orderItems = createOrderItems(productIds, quantities);

        orderService.createOrder(order, orderItems);
        return "redirect:/orders/manage";
    }

    private List<OrderItem> createOrderItems(List<String> productIds, List<Integer> quantities) {
        List<OrderItem> orderItems = new ArrayList<>();

        for (int i = 0; i < productIds.size(); i++) {
            String productId = productIds.get(i);
            Integer quantity = quantities.get(i);

            // Skip if productId is empty or quantity is invalid
            if (productId == null || productId.isEmpty() || quantity == null || quantity <= 0) {
                continue;
            }

            // Get product price from database
            Optional<Product> productOpt = productService.getProductById(productId);
            if (productOpt.isPresent()) {
                Product product = productOpt.get();

                // Check stock availability
                if (product.getStockQty() < quantity) {
                    throw new RuntimeException("Insufficient stock for product: " + product.getName());
                }

                // Create order item with automatic subtotal calculation
                OrderItem orderItem = new OrderItem(
                        "", // orderId will be set later in service
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