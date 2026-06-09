ALTER TABLE audit_logs
    ALTER COLUMN payload TYPE TEXT
    USING payload::text;
