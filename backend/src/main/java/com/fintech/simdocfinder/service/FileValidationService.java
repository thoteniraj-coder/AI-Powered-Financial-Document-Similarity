package com.fintech.simdocfinder.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class FileValidationService {

    private static final Map<String, String> NORMALIZED_TYPES = Map.ofEntries(
            Map.entry("pdf", "pdf"),
            Map.entry("docx", "docx"),
            Map.entry("txt", "txt"),
            Map.entry("png", "png"),
            Map.entry("jpg", "jpg"),
            Map.entry("jpeg", "jpg"),
            Map.entry("tif", "tiff"),
            Map.entry("tiff", "tiff"),
            Map.entry("xls", "xls"),
            Map.entry("xlsx", "xlsx"),
            Map.entry("xlsm", "xlsm"),
            Map.entry("xlsb", "xlsb")
    );

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "pdf", "docx", "txt", "png", "jpg", "tiff", "xls", "xlsx", "xlsm", "xlsb"
    );

    public ValidationResult validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Upload a non-empty file.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("Uploaded file must have a filename.");
        }

        String extension = extensionOf(originalFilename);
        String normalizedType = NORMALIZED_TYPES.get(extension);
        if (normalizedType == null || !ALLOWED_TYPES.contains(normalizedType)) {
            throw new IllegalArgumentException(
                    "Unsupported file type. Supported formats are PDF, DOCX, TXT, PNG, JPG, TIFF, XLS, XLSX, XLSM, and XLSB."
            );
        }

        return new ValidationResult(originalFilename, extension, normalizedType);
    }

    private String extensionOf(String filename) {
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) {
            return "";
        }
        return filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    public record ValidationResult(String originalFilename, String extension, String normalizedType) {}
}
