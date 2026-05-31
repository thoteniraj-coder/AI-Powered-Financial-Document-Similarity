package com.fintech.simdocfinder.embedding;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class EmbeddingClient {

    private final WebClient webClient;

    public EmbeddingClient(WebClient.Builder webClientBuilder, @Value("${embedding.service.url:http://localhost:8000}") String embeddingServiceUrl) {
        this.webClient = webClientBuilder.baseUrl(embeddingServiceUrl).build();
    }

    public float[] embedText(String text) {
        log.debug("Calling embedding service for single text");
        try {
            Map<String, Object> response = webClient.post()
                    .uri("/embed")
                    .bodyValue(Map.of("text", text))
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .retryWhen(Retry.backoff(3, Duration.ofSeconds(1)))
                    .block();
            
            if (response != null && response.containsKey("embedding")) {
                List<Double> embList = (List<Double>) response.get("embedding");
                float[] emb = new float[embList.size()];
                for (int i = 0; i < embList.size(); i++) {
                    emb[i] = embList.get(i).floatValue();
                }
                return emb;
            }
            throw new RuntimeException("Embedding service returned invalid response format");
        } catch (Exception e) {
            log.error("Failed to call embedding service", e);
            throw new RuntimeException("Embedding service failed", e);
        }
    }

    public List<float[]> embedBatch(List<String> texts) {
        log.debug("Calling embedding service for batch of size {}", texts.size());
        try {
            Map<String, Object> response = webClient.post()
                    .uri("/embed-batch")
                    .bodyValue(Map.of("texts", texts))
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .retryWhen(Retry.backoff(3, Duration.ofSeconds(1)))
                    .block();

            if (response != null && response.containsKey("embeddings")) {
                List<List<Double>> embLists = (List<List<Double>>) response.get("embeddings");
                return embLists.stream().map(embList -> {
                    float[] emb = new float[embList.size()];
                    for (int i = 0; i < embList.size(); i++) {
                        emb[i] = embList.get(i).floatValue();
                    }
                    return emb;
                }).toList();
            }
            throw new RuntimeException("Embedding service returned invalid response format");
        } catch (Exception e) {
            log.error("Failed to call batch embedding service", e);
            throw new RuntimeException("Batch embedding service failed", e);
        }
    }
}
