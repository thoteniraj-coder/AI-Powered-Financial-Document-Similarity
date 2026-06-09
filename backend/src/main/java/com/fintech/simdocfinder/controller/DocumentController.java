package com.fintech.simdocfinder.controller;

import com.fintech.simdocfinder.model.dto.CompareRequest;
import com.fintech.simdocfinder.model.dto.CompareResponse;
import com.fintech.simdocfinder.model.dto.DocumentResponse;
import com.fintech.simdocfinder.model.dto.DocumentUploadResponse;
import com.fintech.simdocfinder.model.dto.SearchRequest;
import com.fintech.simdocfinder.model.dto.SearchResponse;
import com.fintech.simdocfinder.model.dto.SearchTextRequest;
import com.fintech.simdocfinder.model.dto.SpreadsheetPreviewResponse;
import com.fintech.simdocfinder.model.entity.User;
import com.fintech.simdocfinder.repository.UserRepository;
import com.fintech.simdocfinder.service.DocumentService;
import com.fintech.simdocfinder.service.SearchService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final SearchService searchService;
    private final UserRepository userRepository;

    @PostMapping("/upload")
    public ResponseEntity<DocumentUploadResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentType", required = false, defaultValue = "invoice") String documentType,
            @RequestParam(value = "vendor", required = false) String vendor,
            @RequestParam(value = "invoiceNumber", required = false) String invoiceNumber,
            @RequestParam(value = "invoiceDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate invoiceDate,
            @RequestParam(value = "amount", required = false) BigDecimal amount,
            @RequestParam(value = "currency", required = false) String currency,
            @RequestParam(value = "department", required = false) String department,
            Authentication authentication,
            HttpServletRequest request) {

        String userIdStr = null;
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            userIdStr = ((User) authentication.getPrincipal()).getId().toString();
        } else if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.User) {
            String username = ((org.springframework.security.core.userdetails.User) authentication.getPrincipal()).getUsername();
            User user = userRepository.findByEmail(username).orElse(null);
            if (user != null) userIdStr = user.getId().toString();
        }

        DocumentUploadResponse response = documentService.uploadDocument(
                file,
                documentType,
                vendor,
                invoiceNumber,
                invoiceDate,
                amount,
                currency,
                department,
                userIdStr,
                request.getRemoteAddr()
        );
        if ("failed".equalsIgnoreCase(response.getStatus())) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(response);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<DocumentResponse>> getDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer days,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String documentType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String vendor,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) BigDecimal amountMin,
            @RequestParam(required = false) BigDecimal amountMax,
            @RequestParam(required = false) String currency) {
        Page<DocumentResponse> response = documentService.getDocuments(
                PageRequest.of(page, size),
                days,
                q,
                documentType,
                status,
                vendor,
                dateFrom,
                dateTo,
                amountMin,
                amountMax,
                currency
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocument(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(documentService.getDocumentById(id, currentUser(authentication)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID id, Authentication authentication, HttpServletRequest request) {
        User user = currentUser(authentication);
        documentService.softDeleteDocument(id, user, request.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/erase")
    public ResponseEntity<Void> eraseDocument(@PathVariable UUID id, Authentication authentication, HttpServletRequest request) {
        documentService.eraseDocument(id, currentUser(authentication), request.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/search")
    public ResponseEntity<SearchResponse> search(
            @RequestParam("file") MultipartFile queryFile,
            @ModelAttribute SearchRequest searchRequest,
            Authentication authentication,
            HttpServletRequest request) {

        User user = currentUser(authentication);
        return ResponseEntity.ok(searchService.searchSimilar(queryFile, searchRequest, user, request.getRemoteAddr()));
    }

    @PostMapping("/search-text")
    public ResponseEntity<SearchResponse> searchText(
            @RequestBody SearchTextRequest searchRequest,
            Authentication authentication,
            HttpServletRequest request) {

        User user = currentUser(authentication);
        return ResponseEntity.ok(searchService.searchSimilarText(searchRequest, user, request.getRemoteAddr()));
    }

    @PostMapping("/{id}/find-similar")
    public ResponseEntity<SearchResponse> findSimilar(
            @PathVariable UUID id,
            @RequestParam(value = "topK", required = false, defaultValue = "10") int topK,
            @RequestParam(value = "threshold", required = false, defaultValue = "0.5") double threshold,
            @RequestParam(value = "vendor", required = false) String vendor,
            @RequestParam(value = "documentType", required = false) String documentType,
            @RequestParam(value = "dateFrom", required = false) LocalDate dateFrom,
            @RequestParam(value = "dateTo", required = false) LocalDate dateTo,
            @RequestParam(value = "amountMin", required = false) BigDecimal amountMin,
            @RequestParam(value = "amountMax", required = false) BigDecimal amountMax,
            @RequestParam(value = "currency", required = false) String currency,
            Authentication authentication,
            HttpServletRequest request) {

        User user = currentUser(authentication);

        SearchRequest searchRequest = new SearchRequest();
        searchRequest.setTopK(topK);
        searchRequest.setThreshold(threshold);
        searchRequest.setFilters(buildSearchFilters(vendor, documentType, dateFrom, dateTo, amountMin, amountMax, currency));

        return ResponseEntity.ok(searchService.searchByDocumentId(id, searchRequest, user, request.getRemoteAddr()));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<org.springframework.core.io.Resource> downloadDocument(@PathVariable UUID id) {
        return documentService.downloadDocument(id);
    }

    @GetMapping("/{id}/spreadsheet-preview")
    public ResponseEntity<SpreadsheetPreviewResponse> getSpreadsheetPreview(@PathVariable UUID id) {
        return ResponseEntity.ok(documentService.getSpreadsheetPreview(id));
    }

    @PostMapping("/compare")
    public ResponseEntity<CompareResponse> compareDocuments(
            @RequestBody CompareRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(documentService.compareDocuments(request, user, servletRequest.getRemoteAddr()));
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    private SearchRequest.SearchFilters buildSearchFilters(String vendor,
                                                           String documentType,
                                                           LocalDate dateFrom,
                                                           LocalDate dateTo,
                                                           BigDecimal amountMin,
                                                           BigDecimal amountMax,
                                                           String currency) {
        SearchRequest.SearchFilters filters = new SearchRequest.SearchFilters();
        filters.setVendor(blankToNull(vendor));
        filters.setDocumentType(blankToNull(documentType));
        filters.setDateFrom(dateFrom);
        filters.setDateTo(dateTo);
        filters.setAmountMin(amountMin);
        filters.setAmountMax(amountMax);
        filters.setCurrency(blankToNull(currency));
        return filters;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
