-- Create feedback table for storing user feedback
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('problem', 'suggestion')),
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback(created_at DESC);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users to insert feedback
CREATE POLICY "Allow anonymous insert" ON feedback
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow only service role to read feedback (admin only)
CREATE POLICY "Allow service role read" ON feedback
  FOR SELECT
  TO service_role
  USING (true);
