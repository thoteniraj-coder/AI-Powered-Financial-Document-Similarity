package com.fintech.simdocfinder.controller;

import com.fintech.simdocfinder.model.dto.DocumentResponse;
import com.fintech.simdocfinder.model.dto.DocumentUploadResponse;
import com.fintech.simdocfinder.model.dto.SearchRequest;
import com.fintech.simdocfinder.model.dto.SearchResponse;
import com.fintech.simdocfinder.model.entity.User;
import com.fintech.simdocfinder.repository.UserRepository;
import com.fintech.simdocfinder.service.DocumentService;
import com.fintech.simdocfinder.service.SearchService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

        DocumentUploadResponse response = documentService.uploadDocument(file, documentType, userIdStr, request.getRemoteAddr());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<DocumentResponse>> getDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<DocumentResponse> response = documentService.getDocuments(PageRequest.of(page, size));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocument(@PathVariable UUID id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID id, Authentication authentication, HttpServletRequest request) {
        User user = null;
        if (authentication != null) {
            String username = authentication.getName();
            user = userRepository.findByEmail(username).orElse(null);
        }
        documentService.softDeleteDocument(id, user, request.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/search")
    public ResponseEntity<SearchResponse> search(
            @RequestParam("file") MultipartFile queryFile,
            @ModelAttribute SearchRequest searchRequest,
            Authentication authentication,
            HttpServletRequest request) {

        User user = null;
        if (authentication != null) {
            String username = authentication.getName();
            user = userRepository.findByEmail(username).orElse(null);
        }
        return ResponseEntity.ok(searchService.searchSimilar(queryFile, searchRequest, user, request.getRemoteAddr()));
    }
}
