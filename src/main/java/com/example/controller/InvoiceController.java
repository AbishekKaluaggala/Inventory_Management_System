package com.example.controller;

import com.example.entity.Invoice;
import com.example.service.InvoiceService;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping ("/api/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    // Add this method right after @Autowired
    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    // Also add this method for getting invoice by order
    @GetMapping("/order/{orderId}")
    public ResponseEntity<Invoice> getInvoiceByOrderId(@PathVariable String orderId) {
        Optional<Invoice> invoice = invoiceService.getInvoiceByOrderId(orderId);
        return invoice.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }


    //get all invoices
    @GetMapping("/{id}")
    public ResponseEntity<Invoice>getInvoiceById(@PathVariable String id){
        Optional<Invoice> invoice = invoiceService.getInvoiceById(id);
        return invoice.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    //get overdue invoice
    @GetMapping("/overdue")
    public ResponseEntity<List<Invoice>> getOverdueInvoices(){
        return ResponseEntity.ok(invoiceService.getOverdueInvoices());
    }

    //generate invoices
    @PostMapping("/generate/{orderId}")
    public ResponseEntity<Invoice> generateInvoice(@PathVariable String orderId) {
        try {
            Invoice invoice = invoiceService.generateInvoiceFromOrder(orderId);
            return ResponseEntity.ok(invoice);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Create invoice manually
    @PostMapping
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        Invoice savedInvoice = invoiceService.createInvoice(invoice);
        return ResponseEntity.ok(savedInvoice);
    }

    // Update invoice status
    @PatchMapping("/{id}/status")
    public ResponseEntity<Invoice> updateStatus(@PathVariable String id, @RequestParam String status) {
        Invoice updated = invoiceService.updateInvoiceStatus(id, status);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    // Mark as paid
    @PatchMapping("/{id}/mark-paid")
    public ResponseEntity<Invoice> markAsPaid(@PathVariable String id) {
        Invoice updated = invoiceService.markAsPaid(id);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    // Delete invoice
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable String id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
}
