package com.fintech.simdocfinder.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ChunkingServiceTest {

    private ChunkingService chunkingService;

    @BeforeEach
    void setUp() {
        chunkingService = new ChunkingService();
        ReflectionTestUtils.setField(chunkingService, "chunkSize", 800);
        ReflectionTestUtils.setField(chunkingService, "maxChunks", 50);
    }

    @Test
    void chunkText_shouldProduceCorrectNumberOfChunks() {
        String text = "a".repeat(2400); // 3 chunks of 800
        List<String> chunks = chunkingService.chunkText(text);
        assertEquals(3, chunks.size());
        assertEquals(800, chunks.get(0).length());
    }

    @Test
    void chunkText_withShortText_shouldProduceOneChunk() {
        String text = "Short text";
        List<String> chunks = chunkingService.chunkText(text);
        assertEquals(1, chunks.size());
        assertEquals("Short text", chunks.get(0));
    }

    @Test
    void chunkText_withNullOrEmpty_shouldReturnEmptyList() {
        assertTrue(chunkingService.chunkText(null).isEmpty());
        assertTrue(chunkingService.chunkText("").isEmpty());
        assertTrue(chunkingService.chunkText("   ").isEmpty());
    }

    @Test
    void chunkText_shouldEnforceMaxChunksLimit() {
        String text = "a".repeat(800 * 60); // Enough for 60 chunks
        List<String> chunks = chunkingService.chunkText(text);
        assertEquals(50, chunks.size()); // Limited to maxChunks
    }
}
