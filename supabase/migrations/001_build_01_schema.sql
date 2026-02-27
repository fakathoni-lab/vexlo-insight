-- TABLE: waitlist
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  proofs_used INT NOT NULL DEFAULT 0,
  proofs_limit INT NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: proofs
CREATE TABLE proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  keyword TEXT NOT NULL,
  proof_score INT,
  rank_data JSONB,
  ai_narrative TEXT,
  public_slug TEXT UNIQUE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ
);

-- TABLE: proof_views
CREATE TABLE proof_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id UUID NOT NULL REFERENCES proofs(id) ON DELETE CASCADE,
  viewer_ip_hash TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_update_own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- RLS: proofs
ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proofs_select_own" ON proofs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "proofs_insert_own" ON proofs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "proofs_delete_own" ON proofs
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "proofs_select_public" ON proofs
  FOR SELECT USING (is_public = true AND status = 'complete');

-- RLS: proof_views
ALTER TABLE proof_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proof_views_insert_public" ON proof_views
  FOR INSERT WITH CHECK (true);
CREATE POLICY "proof_views_select_owner" ON proof_views
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM proofs WHERE id = proof_id));

-- Trigger: Create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();