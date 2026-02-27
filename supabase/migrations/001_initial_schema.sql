-- TABLE: profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','starter','pro','elite')),
  proofs_used INTEGER NOT NULL DEFAULT 0,
  proofs_limit INTEGER NOT NULL DEFAULT 5,
  agency_name TEXT,
  brand_color VARCHAR(7),
  brand_logo_url TEXT,
  white_label_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: proofs
CREATE TABLE proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  target_keyword TEXT NOT NULL,
  proof_score INTEGER CHECK (proof_score >= 0 AND proof_score <= 100),
  ranking_position INTEGER,
  ranking_delta INTEGER,
  ai_overview BOOLEAN DEFAULT false,
  ranking_data JSONB,
  serp_features JSONB,
  ai_narrative TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','complete','failed')),
  public_slug TEXT UNIQUE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  api_cost_units INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX proofs_user_id_idx ON proofs(user_id);
CREATE INDEX proofs_created_at_idx ON proofs(created_at DESC);
CREATE INDEX proofs_public_slug_idx ON proofs(public_slug) WHERE public_slug IS NOT NULL;

-- TABLE: proof_views
CREATE TABLE proof_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id UUID NOT NULL REFERENCES proofs(id) ON DELETE CASCADE,
  viewer_ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);