package com.fintech.simdocfinder.parser;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.InputStream;

@Component
@Slf4j
public class PdfParser {

    public ParserResult parse(InputStream inputStream) {
        log.info("Parsing PDF document");
        try (PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            int pageCount = document.getNumberOfPages();
            log.info("Successfully parsed PDF. Page count: {}", pageCount);
            return new ParserResult(text, pageCount);
        } catch (Exception e) {
            log.error("Failed to parse PDF document", e);
            throw new RuntimeException("PDF parsing failed", e);
        }
    }

    public record ParserResult(String text, int pageCount) {}
}
