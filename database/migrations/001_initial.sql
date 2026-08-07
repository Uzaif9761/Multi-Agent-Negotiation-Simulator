-- 001_initial.sql
-- Bootstrap migration for the negotiation simulator database.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scenarios (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    config JSONB NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS negotiations (
    id SERIAL PRIMARY KEY,
    scenario_id INTEGER REFERENCES scenarios(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    agent_config JSONB,
    result JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS negotiation_logs (
    id SERIAL PRIMARY KEY,
    negotiation_id INTEGER REFERENCES negotiations(id) ON DELETE CASCADE,
    round_number INTEGER,
    agent_type VARCHAR(50),
    action VARCHAR(50),
    data JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scenarios_created_by ON scenarios(created_by);
CREATE INDEX IF NOT EXISTS idx_negotiations_scenario_id ON negotiations(scenario_id);
CREATE INDEX IF NOT EXISTS idx_logs_negotiation_id ON negotiation_logs(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
