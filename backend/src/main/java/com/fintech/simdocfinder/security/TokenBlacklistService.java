package com.fintech.simdocfinder.security;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    // Map of Token -> Expiry time
    private final Map<String, LocalDateTime> blacklist = new ConcurrentHashMap<>();

    public void blacklistToken(String token, LocalDateTime expiryTime) {
        blacklist.put(token, expiryTime);
    }

    public boolean isBlacklisted(String token) {
        return blacklist.containsKey(token);
    }

    // Cleanup expired tokens every hour
    @Scheduled(fixedRate = 3600000)
    public void cleanupBlacklist() {
        LocalDateTime now = LocalDateTime.now();
        blacklist.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
    }
}
