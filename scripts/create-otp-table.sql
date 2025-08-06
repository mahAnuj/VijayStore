-- Create OTP table for JWT authentication
-- Run this script in your Neon database

CREATE TABLE IF NOT EXISTS otps (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  otp VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otps_phone_expires ON otps (phone, expires_at);

-- Add comment
COMMENT ON TABLE otps IS 'OTP storage table for JWT authentication'; 