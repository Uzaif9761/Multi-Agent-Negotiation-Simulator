-- database/schema.sql

-- ============================================
-- 1. USERS TABLE (For Member 2)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. SCENARIOS TABLE (YOUR MAIN TABLE!)
-- ============================================
CREATE TABLE IF NOT EXISTS scenarios (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    config JSONB NOT NULL,  -- Stores all negotiation settings
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. NEGOTIATIONS TABLE (For Member 5)
-- ============================================
CREATE TABLE IF NOT EXISTS negotiations (
    id SERIAL PRIMARY KEY,
    scenario_id INTEGER REFERENCES scenarios(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, completed, failed
    agent_config JSONB,  -- Which agents are participating
    result JSONB,        -- Final results
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- ============================================
-- 4. NEGOTIATION_LOGS TABLE (For Member 6)
-- ============================================
CREATE TABLE IF NOT EXISTS negotiation_logs (
    id SERIAL PRIMARY KEY,
    negotiation_id INTEGER REFERENCES negotiations(id) ON DELETE CASCADE,
    round_number INTEGER,
    agent_type VARCHAR(50),
    action VARCHAR(50), -- offer, accept, reject, counter
    data JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_scenarios_created_by ON scenarios(created_by);
CREATE INDEX idx_negotiations_scenario_id ON negotiations(scenario_id);
CREATE INDEX idx_logs_negotiation_id ON negotiation_logs(negotiation_id);
CREATE INDEX idx_users_email ON users(email);