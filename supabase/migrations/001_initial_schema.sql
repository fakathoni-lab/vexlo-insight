-- TABLE: waitlist
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert into waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Deny select from waitlist"
  ON waitlist FOR SELECT
  USING (false);

-- TABLE: profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  plan TEXT DEFAULT 'free',
  proofs_used INT DEFAULT 0,
  proofs_limit INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Allow update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- TABLE: proofs
CREATE TABLE proofs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  domain TEXT NOT NULL,
  keyword TEXT NOT NULL,
  proof_score INT,
  rank_data JSONB,
  ai_narrative TEXT,
  public_slug TEXT UNIQUE,
  is_public BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select own proofs"
  ON proofs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow insert own proofs"
  ON proofs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow delete own proofs"
  ON proofs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Allow select public proofs"
  ON proofs FOR SELECT
  USING (is_public = true AND status = 'complete');

-- TABLE: subscriptions
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- TABLE: proof_views
CREATE TABLE proof_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proof_id UUID REFERENCES proofs(id) NOT NULL,
  viewer_ip_hash TEXT,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE proof_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert into proof_views"
  ON proof_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow select proof_views for proof owner"
  ON proof_views FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM proofs WHERE id = proof_id));

-- TRIGGER: Auto-create profile on user signup
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