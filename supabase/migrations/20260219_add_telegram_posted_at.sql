-- Track when a project was posted to the Telegram channel
ALTER TABLE projects ADD COLUMN IF NOT EXISTS telegram_posted_at TIMESTAMP WITH TIME ZONE;
