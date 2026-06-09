ALTER TABLE audit_logs
    ALTER COLUMN ip_address TYPE VARCHAR(45)
    USING ip_address::text;
