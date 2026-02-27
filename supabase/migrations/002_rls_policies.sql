ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proofs_select_own" ON proofs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "proofs_delete_own" ON proofs
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "proofs_select_public" ON proofs
  FOR SELECT USING (is_public = true);

ALTER TABLE proof_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proof_views_insert_server" ON proof_views
  FOR INSERT WITH CHECK (true);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);