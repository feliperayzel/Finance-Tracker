-- Finance Tracker 1.0 — Supabase Migration
-- Run this entire file in Supabase > SQL Editor

-- ─────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS persons (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type                 text NOT NULL CHECK (type IN ('expense', 'income')),
  value                numeric(12, 2) NOT NULL CHECK (value > 0),
  date                 date NOT NULL,
  category_id          uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  person_id            uuid NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,
  description          text,
  installment_group_id uuid,
  installment_index    integer,
  installment_total    integer,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alert_subscriptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text NOT NULL,
  frequency  text NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_transactions_user_id       ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date          ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id   ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_group_id      ON transactions(installment_group_id) WHERE installment_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_categories_user_id         ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_persons_user_id            ON persons(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_active ON alert_subscriptions(active);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────

ALTER TABLE categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_subscriptions ENABLE ROW LEVEL SECURITY;

-- categories
CREATE POLICY "categories_select" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categories_update" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "categories_delete" ON categories FOR DELETE USING (auth.uid() = user_id);

-- persons
CREATE POLICY "persons_select" ON persons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "persons_insert" ON persons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "persons_update" ON persons FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "persons_delete" ON persons FOR DELETE USING (auth.uid() = user_id);

-- transactions
CREATE POLICY "transactions_select" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions_update" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "transactions_delete" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- alert_subscriptions
CREATE POLICY "alerts_select" ON alert_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "alerts_insert" ON alert_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "alerts_update" ON alert_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "alerts_delete" ON alert_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- RPC FUNCTION: monthly_aggregates
-- Returns income/expense totals grouped by month for the last 6 months
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION monthly_aggregates(since date)
RETURNS TABLE (month text, type text, total numeric)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT
    to_char(date_trunc('month', date), 'YYYY-MM-DD') AS month,
    type,
    SUM(value)::numeric AS total
  FROM transactions
  WHERE user_id = auth.uid()
    AND date >= since
  GROUP BY date_trunc('month', date), type
  ORDER BY date_trunc('month', date);
$$;
