package com.fintech.simdocfinder.parser;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Component;

import java.io.InputStream;

@Component
@Slf4j
public class DocxParser {

    public String parse(InputStream inputStream) {
        log.info("Parsing DOCX document");
        try (XWPFDocument document = new XWPFDocument(inputStream)) {
            StringBuilder sb = new StringBuilder();
            for (XWPFParagraph p : document.getParagraphs()) {
                sb.append(p.getText()).append("\n");
            }
            log.info("Successfully parsed DOCX");
            return sb.toString();
        } catch (Exception e) {
            log.error("Failed to parse DOCX document", e);
            throw new RuntimeException("DOCX parsing failed", e);
        }
    }
}
