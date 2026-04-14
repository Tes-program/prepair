CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INT NOT NULL CHECK (week_number BETWEEN 1 AND 4),
  member1 TEXT NOT NULL,
  member2 TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (week_number, member1)
);

CREATE TABLE pair_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id UUID NOT NULL REFERENCES pairs(id) ON DELETE CASCADE,
  week_number INT NOT NULL CHECK (week_number BETWEEN 1 AND 4),
  problem_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'progress', 'done')),
  code TEXT,
  explanation TEXT,
  image_url TEXT,
  db_schema TEXT,
  db_explanation TEXT,
  assessment TEXT,
  assessed_at TIMESTAMPTZ,
  notion_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (pair_id, problem_id)
);

CREATE TABLE app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

INSERT INTO app_config (key, value) VALUES ('active_week', '1');

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pair_submissions_updated_at
  BEFORE UPDATE ON pair_submissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE pairs REPLICA IDENTITY FULL;
ALTER TABLE pair_submissions REPLICA IDENTITY FULL;
ALTER TABLE participants REPLICA IDENTITY FULL;
ALTER TABLE app_config REPLICA IDENTITY FULL;

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pair_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all" ON participants FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON pairs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON pair_submissions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON app_config FOR ALL TO anon USING (true) WITH CHECK (true);
