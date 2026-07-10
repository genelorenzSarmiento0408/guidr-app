ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can delete own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);