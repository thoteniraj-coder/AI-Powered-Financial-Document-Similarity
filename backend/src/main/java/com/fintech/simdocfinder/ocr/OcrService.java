package com.fintech.simdocfinder.ocr;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import net.sourceforge.tess4j.Tesseract;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.InputStream;

@Service
@Slf4j
public class OcrService {

    public String extractTextFromImage(MultipartFile file) {
        log.info("Starting OCR processing for file: {}", file.getOriginalFilename());
        try (InputStream in = file.getInputStream()) {
            BufferedImage image = ImageIO.read(in);
            if (image == null) {
                log.error("Failed to read image for OCR: {}", file.getOriginalFilename());
                return "";
            }

            Tesseract tesseract = new Tesseract();
            // Optional: tesseract.setDatapath("/path/to/tessdata");
            tesseract.setLanguage("eng");

            String text = tesseract.doOCR(image);
            log.info("OCR extraction completed successfully");
            return text;

        } catch (Exception e) {
            log.error("OCR failed for file: {}", file.getOriginalFilename(), e);
            return "";
        }
    }

    public String extractTextFromPdf(MultipartFile file) {
        log.info("Starting OCR processing for scanned PDF: {}", file.getOriginalFilename());
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            Tesseract tesseract = newTesseract();
            PDFRenderer renderer = new PDFRenderer(document);
            StringBuilder text = new StringBuilder();

            for (int page = 0; page < document.getNumberOfPages(); page++) {
                BufferedImage image = renderer.renderImageWithDPI(page, 200, ImageType.RGB);
                text.append(tesseract.doOCR(image)).append("\n");
            }

            log.info("PDF OCR extraction completed successfully");
            return text.toString();
        } catch (Exception e) {
            log.error("PDF OCR failed for file: {}", file.getOriginalFilename(), e);
            return "";
        }
    }

    private Tesseract newTesseract() {
        Tesseract tesseract = new Tesseract();
        // Optional: tesseract.setDatapath("/path/to/tessdata");
        tesseract.setLanguage("eng");
        return tesseract;
    }
}
