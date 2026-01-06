/*
  # Story 3: Browse Opportunity Posts - Connection Requests
  
  1. Add chat_enabled column to profiles
  2. Create connection_requests table for managing mentor/mentee connections
*/

-- Add chat_enabled column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS chat_enabled boolean DEFAULT true;

-- Create connection_requests table
CREATE TABLE IF NOT EXISTS connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, mentor_id)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_connection_requests_requester ON connection_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_mentor ON connection_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_status ON connection_requests(status);

-- Enable RLS
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own connection requests"
  ON connection_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = mentor_id);

CREATE POLICY "Users can create connection requests"
  ON connection_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Mentors can update requests sent to them"
  ON connection_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Users can delete their own requests"
  ON connection_requests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = requester_id);
