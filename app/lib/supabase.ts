import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AnimalPen {
  id: string;
  type: string;
  name: string;
  current_count: number;
  base_price: number;
  created_at: string;
  updated_at: string;
}

export interface FeedInventory {
  id: string;
  current_stock_kg: number;
  daily_consumption_kg: number;
  last_updated: string;
}

export interface AnimalTransaction {
  id: string;
  pen_id: string;
  transaction_type: string;
  quantity: number;
  notes: string;
  created_at: string;
  created_by: string;
}

export interface EggProduction {
  id: string;
  pen_id: string;
  quantity: number;
  date: string;
  created_at: string;
  created_by: string;
}

export interface VegetableProduction {
  id: string;
  vegetable_type: string;
  weight_kg: number;
  base_price: number;
  date: string;
  created_at: string;
  created_by: string;
}

export interface AppUser {
  id: string;
  name: string;
  role: string;
  created_at: string;
}
