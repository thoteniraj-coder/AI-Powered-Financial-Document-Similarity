package com.fintech.simdocfinder.parser;

import com.fintech.simdocfinder.ocr.OcrService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParserService {

    private final PdfParser pdfParser;
    private final DocxParser docxParser;
    private final TextParser textParser;
    private final OcrService ocrService;

    public ParserResult parseFile(MultipartFile file) {
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        String contentType = file.getContentType() != null ? file.getContentType() : "";
        
        log.info("Parsing file: {} with content type: {}", filename, contentType);

        try {
            if (contentType.equals("application/pdf") || filename.endsWith(".pdf")) {
                PdfParser.ParserResult result = pdfParser.parse(file.getInputStream());
                return new ParserResult(result.text(), result.pageCount(), false);
            } else if (contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") || filename.endsWith(".docx")) {
                String text = docxParser.parse(file.getInputStream());
                return new ParserResult(text, 1, false);
            } else if (contentType.equals("text/plain") || filename.endsWith(".txt")) {
                String text = textParser.parse(file.getInputStream());
                return new ParserResult(text, 1, false);
            } else if (contentType.startsWith("image/") || filename.matches(".*\\.(png|jpg|jpeg|tiff)$")) {
                String text = ocrService.extractTextFromImage(file);
                return new ParserResult(text, 1, true);
            } else {
                throw new IllegalArgumentException("Unsupported file type: " + contentType);
            }
        } catch (Exception e) {
            log.error("Error parsing file", e);
            throw new RuntimeException("Error parsing file: " + e.getMessage(), e);
        }
    }

    public record ParserResult(String text, int pageCount, boolean ocrUsed) {}
}
