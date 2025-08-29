-- =========================================================
-- DIABOT: Safe Final Security & RLS (Table Existence Checks)
-- =========================================================

-- 1) Safe push_subscriptions setup
DO $$ 
BEGIN
  -- Check if push_subscriptions table exists
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'push_subscriptions') THEN
    
    -- Add user_agent column if not exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'push_subscriptions' AND column_name = 'user_agent'
    ) THEN
      ALTER TABLE public.push_subscriptions ADD COLUMN user_agent TEXT;
    END IF;

    -- Add unique constraint for upsert safety
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_push_subscriptions_user_endpoint
      ON public.push_subscriptions (user_id, endpoint);

    -- Enable RLS and create policies
    ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON public.push_subscriptions;
    DROP POLICY IF EXISTS "ps_select_own" ON public.push_subscriptions;
    DROP POLICY IF EXISTS "ps_upsert_own" ON public.push_subscriptions;
    DROP POLICY IF EXISTS "ps_delete_own" ON public.push_subscriptions;
    DROP POLICY IF EXISTS "push_subscriptions_all_own" ON public.push_subscriptions;

    CREATE POLICY "ps_select_own" ON public.push_subscriptions
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "ps_upsert_own" ON public.push_subscriptions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "ps_update_own" ON public.push_subscriptions
      FOR UPDATE 
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "ps_delete_own" ON public.push_subscriptions
      FOR DELETE USING (auth.uid() = user_id);

    -- Performance index
    CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user
      ON public.push_subscriptions (user_id);

  END IF;
END $$;

-- 2) Safe notices setup
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'notices') THEN
    
    ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can read own notices" ON public.notices;
    DROP POLICY IF EXISTS "Users can update own notices" ON public.notices;
    DROP POLICY IF EXISTS "notices_select_own" ON public.notices;
    DROP POLICY IF EXISTS "notices_update_seen_own" ON public.notices;
    DROP POLICY IF EXISTS "notices_update_own" ON public.notices;

    CREATE POLICY "notices_select_own" ON public.notices
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "notices_update_own" ON public.notices
      FOR UPDATE 
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    -- Performance index
    CREATE INDEX IF NOT EXISTS idx_notices_user_seen_created
      ON public.notices (user_id, seen, created_at DESC);

    -- Prevent duplicate notifications (idempotency)
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_notice_user_kind_minute
      ON public.notices (user_id, kind, date_trunc('minute', created_at));

  END IF;
END $$;

-- 3) Safe coins_daily_caps setup (server-only modifications)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'coins_daily_caps') THEN
    
    ALTER TABLE public.coins_daily_caps ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can read own daily caps" ON public.coins_daily_caps;
    DROP POLICY IF EXISTS "System can manage daily caps" ON public.coins_daily_caps;
    DROP POLICY IF EXISTS "daily_caps_select_own" ON public.coins_daily_caps;

    -- Users can only read their own caps (no INSERT/UPDATE for users)
    CREATE POLICY "daily_caps_select_own" ON public.coins_daily_caps
      FOR SELECT USING (auth.uid() = user_id);

    -- Server operations use service role (bypass RLS)
    -- No INSERT/UPDATE policies for regular users

    -- Performance index
    CREATE INDEX IF NOT EXISTS idx_coins_daily_caps_user_date
      ON public.coins_daily_caps (user_id, date, action_type);

  END IF;
END $$;

-- 4) Comments for documentation
COMMENT ON SCHEMA public IS 'DIABOT production schema with safe migrations and hardened RLS policies';