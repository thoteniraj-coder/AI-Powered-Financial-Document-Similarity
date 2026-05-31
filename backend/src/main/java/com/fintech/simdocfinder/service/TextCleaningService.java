package com.fintech.simdocfinder.service;

import org.springframework.stereotype.Service;

@Service
public class TextCleaningService {

    public String cleanText(String text) {
        if (text == null) {
            return "";
        }
        
        // Remove control characters except standard whitespace
        text = text.replaceAll("[\\p{Cntrl}&&[^\r\n\t]]", "");
        
        // Normalize line breaks
        text = text.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
        text = text.replaceAll("\n{3,}", "\n\n");
        
        // Remove excessive whitespace
        text = text.replaceAll("[ \t]+", " ");
        
        return text.trim();
    }
}
