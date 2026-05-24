CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a message (no auth required)
CREATE POLICY "Anyone can insert contact messages"
  ON contact_messages
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view messages
CREATE POLICY "Admins can view contact messages"
  ON contact_messages
  FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
