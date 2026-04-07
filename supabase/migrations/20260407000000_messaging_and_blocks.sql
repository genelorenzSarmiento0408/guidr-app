-- Create messages and conversations tables
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  participant2_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    participant1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    participant2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    participant1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    participant2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );


CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE 
      participant1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
      participant2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND
    conversation_id IN (
      SELECT id FROM conversations WHERE 
      participant1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
      participant2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- Function to handle marking spam/blocking
CREATE TABLE user_blocks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    blocked_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their blocks"
  ON user_blocks FOR SELECT TO authenticated
  USING (blocker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can block"
  ON user_blocks FOR INSERT TO authenticated
  WITH CHECK (blocker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can unblock"
  ON user_blocks FOR DELETE TO authenticated
  USING (blocker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
