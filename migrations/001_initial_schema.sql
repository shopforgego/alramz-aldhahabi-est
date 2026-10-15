-- Al Ramz Al Dhahabi payment schema
-- Database: alramz_aldhahabi_db

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_code VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(255) DEFAULT 'فاتورة مؤسسة الرمز الذهبي',
    seller_category VARCHAR(50) DEFAULT 'JEWELRY',
    seller_icon VARCHAR(20) DEFAULT '✦',
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    currency VARCHAR(10) NOT NULL DEFAULT 'SAR',
    vat_rate NUMERIC(6, 4) NOT NULL DEFAULT 0.1500,
    payment_charge_rate NUMERIC(6, 4) NOT NULL DEFAULT 0.0250,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by VARCHAR(255) DEFAULT 'system',
    notes TEXT,
    paid_amount NUMERIC(12, 2),
    receipt_number VARCHAR(100),
    payment_method VARCHAR(50),
    target_domain VARCHAR(255) DEFAULT 'all'
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(100) NOT NULL,
    transaction_id VARCHAR(50) NOT NULL DEFAULT '1',
    short_code VARCHAR(64),
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'SAR',
    status VARCHAR(50) NOT NULL,
    api_operation VARCHAR(50),
    payment_method VARCHAR(50),
    card_brand VARCHAR(50),
    card_last4 VARCHAR(4),
    card_expiry VARCHAR(10),
    cardholder_name VARCHAR(255),
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    auth_code VARCHAR(50),
    receipt_number VARCHAR(100),
    acquirer_response_code VARCHAR(50),
    gateway_code VARCHAR(50),
    stan VARCHAR(50),
    rrn VARCHAR(50),
    risk_score VARCHAR(50),
    error_message TEXT,
    raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_attempts (
    id BIGSERIAL PRIMARY KEY,
    ip VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
