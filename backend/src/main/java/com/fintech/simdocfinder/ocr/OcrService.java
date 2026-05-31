package com.fintech.simdocfinder.ocr;

import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
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
}
