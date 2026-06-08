package com.fintech.simdocfinder.service;

import com.fintech.simdocfinder.model.entity.User;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.regex.Pattern;

@Service
public class PiiMaskingService {

    private static final Set<String> PRIVILEGED_ROLES = Set.of(
            "admin",
            "finance_manager",
            "compliance_officer"
    );

    private static final Pattern SSN = Pattern.compile("\\b\\d{3}-\\d{2}-\\d{4}\\b");
    private static final Pattern BANK_ACCOUNT = Pattern.compile("(?i)\\b(?:account|acct|a/c)\\s*(?:no\\.?|number|#)?\\s*[:#-]?\\s*\\d{6,18}\\b");
    private static final Pattern TAX_ID = Pattern.compile("(?i)\\b(?:tax\\s*id|tin|ein|gstin|pan)\\s*[:#-]?\\s*[A-Z0-9-]{6,20}\\b");

    public boolean canViewSensitiveData(User user) {
        if (user == null || user.getRole() == null || user.getRole().getName() == null) {
            return false;
        }
        return PRIVILEGED_ROLES.contains(user.getRole().getName().toLowerCase());
    }

    public String maskForUser(String text, User user) {
        if (text == null || canViewSensitiveData(user)) {
            return text;
        }
        String masked = SSN.matcher(text).replaceAll("***-**-****");
        masked = BANK_ACCOUNT.matcher(masked).replaceAll("account number: ****");
        masked = TAX_ID.matcher(masked).replaceAll("tax id: ****");
        return masked;
    }
}
