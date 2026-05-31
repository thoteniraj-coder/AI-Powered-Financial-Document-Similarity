package com.fintech.simdocfinder.parser;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class TextParser {

    public String parse(InputStream inputStream) {
        log.info("Parsing Text document");
        try {
            return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Failed to parse Text document", e);
            throw new RuntimeException("Text parsing failed", e);
        }
    }
}
