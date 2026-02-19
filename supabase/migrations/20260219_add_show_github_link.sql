-- Add toggle for showing GitHub link on user profile
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_github_link BOOLEAN NOT NULL DEFAULT false;
