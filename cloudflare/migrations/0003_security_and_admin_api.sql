-- Sahayak Books Production D1 Security & Admin API
-- Migration: 0003_security_and_admin_api.sql

-- Add one-time admin setup token columns to users table
ALTER TABLE users ADD COLUMN setup_token TEXT;
ALTER TABLE users ADD COLUMN setup_token_expires TEXT;

-- Create indexes for security tokens
CREATE INDEX IF NOT EXISTS idx_users_setup_token ON users(setup_token);
CREATE INDEX IF NOT EXISTS idx_users_verify_token ON users(verify_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
