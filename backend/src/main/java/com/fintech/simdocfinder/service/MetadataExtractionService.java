package com.fintech.simdocfinder.service;

import com.fintech.simdocfinder.model.entity.DocumentMetadata;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class MetadataExtractionService {

    private static final Pattern INVOICE_PATTERN = Pattern.compile("(?i)(?:INV-|Invoice\\s*#|Invoice\\s*No\\.?\\s*)([A-Z0-9-]+)");
    private static final Pattern VENDOR_PATTERN = Pattern.compile("(?i)(?:From|Bill\\s*From|Vendor):\\s*([^\\n]+)");
    private static final Pattern DATE_PATTERN = Pattern.compile("(?i)(?:Date):?\\s*(\\d{2}/\\d{2}/\\d{4}|\\d{4}-\\d{2}-\\d{2}|\\d{1,2}-[A-Za-z]{3}-\\d{4})");
    private static final Pattern AMOUNT_PATTERN = Pattern.compile("(?i)(?:Total|Amount|Total\\s*Amount):?\\s*(?:USD|EUR|GBP|\\$|€|£)?\\s*([0-9,]+\\.\\d{2})");

    public DocumentMetadata extractMetadata(String text) {
        DocumentMetadata metadata = new DocumentMetadata();

        Matcher invMatcher = INVOICE_PATTERN.matcher(text);
        if (invMatcher.find()) {
            metadata.setInvoiceNumber(invMatcher.group(1).trim());
        }

        Matcher vendorMatcher = VENDOR_PATTERN.matcher(text);
        if (vendorMatcher.find()) {
            metadata.setVendor(vendorMatcher.group(1).trim());
        }

        Matcher dateMatcher = DATE_PATTERN.matcher(text);
        if (dateMatcher.find()) {
            String dateStr = dateMatcher.group(1).trim();
            metadata.setInvoiceDate(parseDate(dateStr));
        }

        Matcher amountMatcher = AMOUNT_PATTERN.matcher(text);
        if (amountMatcher.find()) {
            String amountStr = amountMatcher.group(1).trim().replace(",", "");
            try {
                metadata.setTotalAmount(new BigDecimal(amountStr));
            } catch (NumberFormatException ignored) {}
        }

        if (text.contains("$") || text.contains("USD")) {
            metadata.setCurrency("USD");
        } else if (text.contains("€") || text.contains("EUR")) {
            metadata.setCurrency("EUR");
        } else if (text.contains("£") || text.contains("GBP")) {
            metadata.setCurrency("GBP");
        }

        return metadata;
    }

    private LocalDate parseDate(String dateStr) {
        String[] formats = {"MM/dd/yyyy", "yyyy-MM-dd", "dd-MMM-yyyy", "d-MMM-yyyy"};
        for (String format : formats) {
            try {
                return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern(format));
            } catch (DateTimeParseException ignored) {}
        }
        return null;
    }
}
