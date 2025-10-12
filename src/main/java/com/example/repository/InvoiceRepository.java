package com.example.repository;

import com.example.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    Optional<Invoice> findByOrderId(String orderId);
    List<Invoice> findByStatus(String status);
    List<Invoice> findByInvoiceDateBetween(LocalDateTime start, LocalDateTime end);
    List<Invoice> findByDueDateBefore(LocalDateTime date);
}