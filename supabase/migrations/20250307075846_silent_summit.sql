/*
  # Initial Schema Setup for AI Finance Manager

  1. New Tables
    - users (managed by Supabase Auth)
    - transactions
      - id (uuid, primary key)
      - user_id (references auth.users)
      - amount (decimal)
      - type (income/expense)
      - category (text)
      - description (text)
      - date (timestamp)
    - budgets
      - id (uuid, primary key)
      - user_id (references auth.users)
      - category (text)
      - amount (decimal)
      - period (text: monthly/yearly)
    - financial_goals
      - id (uuid, primary key)
      - user_id (references auth.users)
      - name (text)
      - target_amount (decimal)
      - current_amount (decimal)
      - deadline (date)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
*/

-- Transactions Table
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  amount decimal NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  description text,
  date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Budgets Table
CREATE TABLE budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  category text NOT NULL,
  amount decimal NOT NULL,
  period text NOT NULL CHECK (period IN ('monthly', 'yearly')),
  created_at timestamptz DEFAULT now()
);

-- Financial Goals Table
CREATE TABLE financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  target_amount decimal NOT NULL,
  current_amount decimal DEFAULT 0,
  deadline date,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can manage their own transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own budgets"
  ON budgets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own financial goals"
  ON financial_goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);