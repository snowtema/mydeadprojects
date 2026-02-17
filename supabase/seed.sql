INSERT INTO causes_of_death (label, emoji, sort_order) VALUES
  ('Lost motivation', '😴', 1),
  ('Scope creep', '🐙', 2),
  ('Already exists', '👯', 3),
  ('No users', '🦗', 4),
  ('Co-founder left', '🚪', 5),
  ('Shiny new idea', '✨', 6),
  ('Tech debt killed it', '💀', 7),
  ('Ran out of money', '💸', 8),
  ('Life happened', '🌊', 9),
  ('Perfectionism paralysis', '🎯', 10),
  ('Chose wrong tech stack', '🔧', 11),
  ('Got a job', '💼', 12),
  ('Tutorial hell', '📚', 13),
  ('It worked on my machine', '🖥️', 14),
  ('Imposter syndrome', '🎭', 15)
ON CONFLICT DO NOTHING;
