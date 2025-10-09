package com.example.service;

import com.example.entity.*;
import com.example.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    // Get dashboard statistics
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Count statistics
        stats.put("totalUsers", userRepository.count());
        stats.put("totalProducts", productRepository.count());
        stats.put("totalOrders", orderRepository.count());
        stats.put("totalInvoices", invoiceRepository.count());

        // Active users
        stats.put("activeUsers", userRepository.findByIsActive(true).size());

        // Low stock products
        List<Product> allProducts = productRepository.findAll();
        long lowStockCount = allProducts.stream()
                .filter(p -> p.getStockQty() < p.getMinStockLevel())
                .count();
        stats.put("lowStockProducts", lowStockCount);

        // Pending orders
        stats.put("pendingOrders", orderRepository.findByStatus("PENDING").size());

        // Unpaid invoices
        stats.put("unpaidInvoices", invoiceRepository.findByStatus("UNPAID").size());

        // Total revenue (sum of all paid invoices)
        List<Invoice> paidInvoices = invoiceRepository.findByStatus("PAID");
        BigDecimal totalRevenue = paidInvoices.stream()
                .map(Invoice::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalRevenue", totalRevenue);

        // Recent orders (last 7 days)
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<Order> recentOrders = orderRepository.findByOrderDateBetween(sevenDaysAgo, LocalDateTime.now());
        stats.put("recentOrders", recentOrders.size());

        return stats;
    }

    // Get sales report
    public Map<String, Object> getSalesReport(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> report = new HashMap<>();

        // Orders in date range
        List<Order> orders = orderRepository.findByOrderDateBetween(startDate, endDate);
        report.put("totalOrders", orders.size());

        // Total sales amount
        BigDecimal totalSales = orders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        report.put("totalSales", totalSales);

        // Payments in date range
        List<Payment> payments = paymentRepository.findByPaymentDateBetween(startDate, endDate);
        BigDecimal totalPayments = payments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        report.put("totalPayments", totalPayments);

        // Orders by status
        Map<String, Long> ordersByStatus = new HashMap<>();
        ordersByStatus.put("PENDING", orders.stream().filter(o -> "PENDING".equals(o.getStatus())).count());
        ordersByStatus.put("CONFIRMED", orders.stream().filter(o -> "CONFIRMED".equals(o.getStatus())).count());
        ordersByStatus.put("COMPLETED", orders.stream().filter(o -> "COMPLETED".equals(o.getStatus())).count());
        ordersByStatus.put("CANCELLED", orders.stream().filter(o -> "CANCELLED".equals(o.getStatus())).count());
        report.put("ordersByStatus", ordersByStatus);

        return report;
    }

    // Get inventory report
    public Map<String, Object> getInventoryReport() {
        Map<String, Object> report = new HashMap<>();

        List<Product> products = productRepository.findAll();

        // Total products
        report.put("totalProducts", products.size());

        // Total stock value
        BigDecimal totalValue = products.stream()
                .map(p -> p.getPrice().multiply(BigDecimal.valueOf(p.getStockQty())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        report.put("totalStockValue", totalValue);

        // Low stock products
        List<Product> lowStock = products.stream()
                .filter(p -> p.getStockQty() < p.getMinStockLevel())
                .toList();
        report.put("lowStockProducts", lowStock);
        report.put("lowStockCount", lowStock.size());

        // Out of stock products
        List<Product> outOfStock = products.stream()
                .filter(p -> p.getStockQty() == 0)
                .toList();
        report.put("outOfStockProducts", outOfStock);
        report.put("outOfStockCount", outOfStock.size());

        // Overstock products
        List<Product> overStock = products.stream()
                .filter(p -> p.getStockQty() > p.getMaxStockLevel())
                .toList();
        report.put("overStockProducts", overStock);
        report.put("overStockCount", overStock.size());

        return report;
    }
}