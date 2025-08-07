import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'tu-anon-key-aqui';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Tipos para la base de datos
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: 'apartment' | 'house' | 'commercial' | 'land';
  transaction_type: 'sale' | 'rent';
  address: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  parking_spaces?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  agent_id: string;
}
