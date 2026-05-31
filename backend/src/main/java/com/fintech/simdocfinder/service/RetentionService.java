package com.fintech.simdocfinder.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;

@Service
@Slf4j
public class RetentionService {

    @Scheduled(cron = "0 0 2 * * ?")
    public void executeRetentionPolicy() {
        log.info("Executing document retention policy");
        // Simple stub for Phase 5
    }
}
