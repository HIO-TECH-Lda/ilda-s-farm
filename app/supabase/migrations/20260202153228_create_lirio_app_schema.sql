/*
  # Lírio App - Agricultural Management System

  1. New Tables
    - `animal_pens`
      - `id` (uuid, primary key)
      - `type` (text) - Type of animal (Codornezes, Galinhas, Porcos, Patos)
      - `name` (text) - Display name for the pen
      - `current_count` (integer) - Current number of animals
      - `base_price` (numeric) - Base selling price per unit
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `feed_inventory`
      - `id` (uuid, primary key)
      - `current_stock_kg` (numeric) - Current stock in kilograms
      - `daily_consumption_kg` (numeric) - Average daily consumption
      - `last_updated` (timestamptz)
    
    - `animal_transactions`
      - `id` (uuid, primary key)
      - `pen_id` (uuid, foreign key to animal_pens)
      - `transaction_type` (text) - birth, death, sale, purchase
      - `quantity` (integer)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `created_by` (text) - user name
    
    - `egg_production`
      - `id` (uuid, primary key)
      - `pen_id` (uuid, foreign key to animal_pens)
      - `quantity` (integer)
      - `date` (date)
      - `created_at` (timestamptz)
      - `created_by` (text)
    
    - `vegetable_production`
      - `id` (uuid, primary key)
      - `vegetable_type` (text) - Tomates, etc.
      - `weight_kg` (numeric)
      - `base_price` (numeric) - Price per kg
      - `date` (date)
      - `created_at` (timestamptz)
      - `created_by` (text)
    
    - `app_users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `role` (text) - operator, owner
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public access policies for demo purposes (can be restricted later)
*/

-- Create animal_pens table
CREATE TABLE IF NOT EXISTS animal_pens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  name text NOT NULL,
  current_count integer DEFAULT 0,
  base_price numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create feed_inventory table
CREATE TABLE IF NOT EXISTS feed_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  current_stock_kg numeric DEFAULT 0,
  daily_consumption_kg numeric DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

-- Create animal_transactions table
CREATE TABLE IF NOT EXISTS animal_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pen_id uuid REFERENCES animal_pens(id) ON DELETE CASCADE,
  transaction_type text NOT NULL,
  quantity integer NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  created_by text DEFAULT 'Sistema'
);

-- Create egg_production table
CREATE TABLE IF NOT EXISTS egg_production (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pen_id uuid REFERENCES animal_pens(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  created_by text DEFAULT 'Sistema'
);

-- Create vegetable_production table
CREATE TABLE IF NOT EXISTS vegetable_production (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vegetable_type text NOT NULL,
  weight_kg numeric NOT NULL,
  base_price numeric NOT NULL,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  created_by text DEFAULT 'Sistema'
);

-- Create app_users table
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE animal_pens ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE egg_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE vegetable_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for demo (allow all operations)
CREATE POLICY "Allow public read access to animal_pens"
  ON animal_pens FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public write access to animal_pens"
  ON animal_pens FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to feed_inventory"
  ON feed_inventory FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public write access to feed_inventory"
  ON feed_inventory FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to animal_transactions"
  ON animal_transactions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public write access to animal_transactions"
  ON animal_transactions FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to egg_production"
  ON egg_production FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public write access to egg_production"
  ON egg_production FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to vegetable_production"
  ON vegetable_production FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public write access to vegetable_production"
  ON vegetable_production FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to app_users"
  ON app_users FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public write access to app_users"
  ON app_users FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Insert initial data
INSERT INTO animal_pens (type, name, current_count, base_price) VALUES
  ('Codornezes', 'Capoeira Codornezes A', 150, 50),
  ('Galinhas', 'Capoeira Galinhas B', 80, 200),
  ('Porcos', 'Pocilga Principal', 12, 8000),
  ('Patos', 'Capoeira Patos C', 45, 150);

-- Insert initial feed inventory
INSERT INTO feed_inventory (current_stock_kg, daily_consumption_kg) VALUES
  (500, 25);

-- Insert demo users
INSERT INTO app_users (name, role) VALUES
  ('Elton', 'operator'),
  ('Ilda', 'owner');