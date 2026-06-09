INSERT INTO roles (name, description)
VALUES ('compliance_officer', 'Can manage retention, erasure, audit evidence, and PII controls')
ON CONFLICT (name) DO NOTHING;
