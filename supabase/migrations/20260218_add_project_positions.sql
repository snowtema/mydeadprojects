-- Add position columns for game-like cemetery canvas view
ALTER TABLE projects ADD COLUMN IF NOT EXISTS position_x REAL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS position_y REAL;
