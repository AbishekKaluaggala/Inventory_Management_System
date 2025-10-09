package com.example.service;

import com.example.entity.Invoice;
import com.example.entity.Order;
import com.example.repository.InvoiceRepository;
import com.example.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InvoiceService {

        @Autowired
        private InvoiceRepository invoiceRepository;

        @Autowired
        private OrderRepository orderRepository;

    public Invoice generateInvoiceFromOrder(String orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            throw new RuntimeException("Order not found");
        }

        Order order = orderOpt.get();
        Invoice invoice = new Invoice();
        invoice.setOrderId(orderId);
        invoice.setTotalAmount(order.getTotalAmount());

        // Calculate tax (10%)
        BigDecimal tax = order.getTotalAmount().multiply(BigDecimal.valueOf(0.10));
        invoice.setTaxAmount(tax);

        // Calculate final amount
        BigDecimal finalAmount = order.getTotalAmount()
                .add(tax)
                .subtract(invoice.getDiscountAmount());
        invoice.setFinalAmount(finalAmount);

        return invoiceRepository.save(invoice);
    }

    // Create invoice manually
    public Invoice createInvoice(Invoice invoice) {
        if (invoice.getFinalAmount() == null) {
            BigDecimal finalAmount = invoice.getTotalAmount()
                    .add(invoice.getTaxAmount() != null ? invoice.getTaxAmount() : BigDecimal.ZERO)
                    .subtract(invoice.getDiscountAmount() != null ? invoice.getDiscountAmount() : BigDecimal.ZERO);
            invoice.setFinalAmount(finalAmount);
        }
        return invoiceRepository.save(invoice);
    }

    // Get all invoices
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    // Get invoice by ID
    public Optional<Invoice> getInvoiceById(String id) {
        return invoiceRepository.findById(id);
    }

    // Get invoice by order ID
    public Optional<Invoice> getInvoiceByOrderId(String orderId) {
        return invoiceRepository.findByOrderId(orderId);
    }

    // Get invoices by status
    public List<Invoice> getInvoicesByStatus(String status) {
        return invoiceRepository.findByStatus(status);
    }

    // Get overdue invoices
    public List<Invoice> getOverdueInvoices() {
        return invoiceRepository.findByDueDateBefore(LocalDateTime.now());
    }

    // Update invoice status
    public Invoice updateInvoiceStatus(String invoiceId, String status) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
        if (invoiceOpt.isPresent()) {
            Invoice invoice = invoiceOpt.get();
            invoice.setStatus(status);
            return invoiceRepository.save(invoice);
        }
        return null;
    }

    // Mark invoice as paid
    public Invoice markAsPaid(String invoiceId) {
        return updateInvoiceStatus(invoiceId, "PAID");
    }

    // Delete invoice
    public void deleteInvoice(String id) {
        invoiceRepository.deleteById(id);
    }

}
