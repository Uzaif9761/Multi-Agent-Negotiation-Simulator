-- Seed users for development and testing.

INSERT INTO users (username, email, password_hash)
VALUES
    ('demo_user', 'demo@example.com', 'demo-password-hash'),
    ('analyst', 'analyst@example.com', 'analyst-password-hash')
ON CONFLICT (email) DO NOTHING;
