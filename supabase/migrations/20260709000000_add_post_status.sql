-- Add status to posts so opportunity filtering can distinguish open vs closed posts
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open';

ALTER TABLE posts
ADD CONSTRAINT posts_status_check
CHECK (status IN ('open', 'closed'));