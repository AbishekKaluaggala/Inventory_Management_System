package com.example.service;

import com.example.entity.Payment;
import com.example.entity.Invoice;
import com.example.repository.PaymentRepository;
import com.example.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    // Record payment
    public Payment recordPayment(Payment payment) {
        Payment savedPayment = paymentRepository.save(payment);

        // Update invoice status if fully paid
        updateInvoiceStatusIfPaid(payment.getInvoiceId());

        return savedPayment;
    }

    // Check if invoice is fully paid and update status
    private void updateInvoiceStatusIfPaid(String invoiceId) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
        if (invoiceOpt.isPresent()) {
            Invoice invoice = invoiceOpt.get();
            List<Payment> payments = paymentRepository.findByInvoiceId(invoiceId);

            // Calculate total paid
            BigDecimal totalPaid = payments.stream()
                    .filter(p -> "SUCCESS".equals(p.getStatus()))
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // If fully paid, update invoice
            if (totalPaid.compareTo(invoice.getFinalAmount()) >= 0) {
                invoice.setStatus("PAID");
                invoiceRepository.save(invoice);
            }
        }
    }

    // Get all payments
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    // Get payment by ID
    public Optional<Payment> getPaymentById(String id) {
        return paymentRepository.findById(id);
    }

    // Get payments for an invoice
    public List<Payment> getPaymentsByInvoiceId(String invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId);
    }

    // Get payments by status
    public List<Payment> getPaymentsByStatus(String status) {
        return paymentRepository.findByStatus(status);
    }

    // Get payments by method
    public List<Payment> getPaymentsByMethod(String paymentMethod) {
        return paymentRepository.findByPaymentMethod(paymentMethod);
    }

    // Update payment status
    public Payment updatePaymentStatus(String paymentId, String status) {
        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            payment.setStatus(status);
            Payment updated = paymentRepository.save(payment);

            // Re-check invoice status
            updateInvoiceStatusIfPaid(payment.getInvoiceId());

            return updated;
        }
        return null;
    }

    // Delete payment
    public void deletePayment(String id) {
        paymentRepository.deleteById(id);
    }
}
