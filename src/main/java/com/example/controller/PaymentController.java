package com.example.controller;

import com.example.entity.Payment;
import com.example.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // Get all payments
    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    // Get payment by ID
    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable String id) {
        Optional<Payment> payment = paymentService.getPaymentById(id);
        return payment.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Get payments by invoice ID
    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<Payment>> getPaymentsByInvoiceId(@PathVariable String invoiceId) {
        return ResponseEntity.ok(paymentService.getPaymentsByInvoiceId(invoiceId));
    }

    // Get payments by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Payment>> getPaymentsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(paymentService.getPaymentsByStatus(status));
    }

    // Get payments by method
    @GetMapping("/method/{method}")
    public ResponseEntity<List<Payment>> getPaymentsByMethod(@PathVariable String method) {
        return ResponseEntity.ok(paymentService.getPaymentsByMethod(method));
    }

    // Record new payment
    @PostMapping
    public ResponseEntity<Payment> recordPayment(@RequestBody Payment payment) {
        Payment savedPayment = paymentService.recordPayment(payment);
        return ResponseEntity.ok(savedPayment);
    }

    // Update payment status
    @PatchMapping("/{id}/status")
    public ResponseEntity<Payment> updateStatus(@PathVariable String id, @RequestParam String status) {
        Payment updated = paymentService.updatePaymentStatus(id, status);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    // Delete payment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable String id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}