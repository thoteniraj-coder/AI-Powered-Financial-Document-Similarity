package com.fintech.simdocfinder.controller;

import com.fintech.simdocfinder.model.dto.DocumentUploadResponse;
import com.fintech.simdocfinder.repository.UserRepository;
import com.fintech.simdocfinder.service.DocumentService;
import com.fintech.simdocfinder.service.SearchService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentControllerTest {

    @Mock private DocumentService documentService;
    @Mock private SearchService searchService;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private DocumentController documentController;

    @Test
    void uploadDocument_processingFailureReturnsUnprocessableEntity() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "broken.pdf",
                "application/pdf",
                "invalid content".getBytes()
        );
        DocumentUploadResponse failedResponse = DocumentUploadResponse.builder()
                .filename("broken.pdf")
                .status("failed")
                .message("Document processing failed")
                .build();

        when(documentService.uploadDocument(
                any(),
                anyString(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                anyString()
        )).thenReturn(failedResponse);

        ResponseEntity<DocumentUploadResponse> response = documentController.uploadDocument(
                file,
                "invoice",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                new MockHttpServletRequest()
        );

        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, response.getStatusCode());
        assertEquals("failed", response.getBody().getStatus());
    }
}
