package com.example.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @Column(name = "invoiceID", length = 36)
    private String invoiceId;

    @Column(name = "orderID", nullable = false)
    private String orderId;

    @Column(name = "invoiceDate", nullable = false)
    private LocalDateTime invoiceDate;

    @Column(name = "dueDate")
    private LocalDateTime dueDate;

    @Column(name = "totalAmount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "taxAmount")
    private BigDecimal taxAmount;

    @Column(name = "discountAmount")
    private BigDecimal discountAmount;

    @Column(name = "finalAmount", nullable = false)
    private BigDecimal finalAmount;

    @Column(name = "status", nullable = false)
    private String status; // PAID, UNPAID, OVERDUE, CANCELLED

    @Column(name = "notes")
    private String notes;

    public Invoice() {
        this.invoiceId = java.util.UUID.randomUUID().toString();
        this.invoiceDate = LocalDateTime.now();
        this.dueDate = LocalDateTime.now().plusDays(30);
        this.status = "UNPAID";
        this.taxAmount = BigDecimal.ZERO;
        this.discountAmount = BigDecimal.ZERO;
    }

    // Getters and Setters
    public String getInvoiceId() { return invoiceId; }
    public void setInvoiceId(String invoiceId) { this.invoiceId = invoiceId; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public LocalDateTime getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDateTime invoiceDate) { this.invoiceDate = invoiceDate; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public BigDecimal getFinalAmount() { return finalAmount; }
    public void setFinalAmount(BigDecimal finalAmount) { this.finalAmount = finalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}