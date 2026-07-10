-- Payment ledger + premium post activation
-- Supports Stripe/PayMongo style provider IDs and webhook updates.

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('stripe', 'paymongo')),
  provider_payment_id text NOT NULL,
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider, provider_payment_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id
  ON public.payment_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_post_id
  ON public.payment_transactions(post_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_status
  ON public.payment_transactions(status);

CREATE TABLE IF NOT EXISTS public.post_premium_access (
  post_id uuid PRIMARY KEY REFERENCES public.posts(id) ON DELETE CASCADE,
  payment_transaction_id uuid NOT NULL REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
  enabled_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_premium_access ENABLE ROW LEVEL SECURITY;

-- Users can only view their own payment transactions.
CREATE POLICY "Users can view own payment transactions"
  ON public.payment_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can see premium status for their own posts.
CREATE POLICY "Users can view premium status of own posts"
  ON public.post_premium_access
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.posts p
      WHERE p.id = post_id
        AND p.user_id = auth.uid()
    )
  );
