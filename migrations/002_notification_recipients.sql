-- Recipients for payment notification emails.
-- Matches the table used by nader-alufuq-panel.

CREATE TABLE IF NOT EXISTS notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    language VARCHAR(10) NOT NULL DEFAULT 'ar',
    notify_success BOOLEAN NOT NULL DEFAULT true,
    notify_failed BOOLEAN NOT NULL DEFAULT true,
    notify_link_created BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
