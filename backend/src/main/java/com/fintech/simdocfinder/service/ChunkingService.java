package com.fintech.simdocfinder.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChunkingService {

    @Value("${chunk.size:800}")
    private int chunkSize;

    @Value("${chunk.max-per-doc:50}")
    private int maxChunks;

    public List<String> chunkText(String text) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return chunks;
        }

        int length = text.length();
        for (int i = 0; i < length && chunks.size() < maxChunks; i += chunkSize) {
            int end = Math.min(length, i + chunkSize);
            chunks.add(text.substring(i, end));
        }

        return chunks;
    }
}
