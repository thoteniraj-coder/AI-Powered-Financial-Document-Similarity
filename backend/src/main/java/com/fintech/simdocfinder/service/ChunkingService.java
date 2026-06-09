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

    @Value("${chunk.overlap:100}")
    private int overlap;

    public List<String> chunkText(String text) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return chunks;
        }

        int length = text.length();
        int step = Math.max(1, chunkSize - Math.max(0, overlap));
        for (int i = 0; i < length && chunks.size() < maxChunks; i += step) {
            int end = Math.min(length, i + chunkSize);
            chunks.add(text.substring(i, end));
            if (end == length) {
                break;
            }
        }

        return chunks;
    }
}
