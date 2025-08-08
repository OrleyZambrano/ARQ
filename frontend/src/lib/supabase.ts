import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://vxmpifukfohjafrbiqvw.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bXBpZnVrZm9oamFmcmJpcXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MDUwNDYsImV4cCI6MjA2OTM4MTA0Nn0.JPwFO4UL-LileKVD6JDVZc2RrfCFsK5KgKlS5CFkUPc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    storage: {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error("Error getting item from localStorage:", error);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error("Error setting item in localStorage:", error);
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error("Error removing item from localStorage:", error);
        }
      },
    },
  },
  // Removemos la configuración global de headers que interfiere con uploads de archivos
  // global: {
  //   headers: {
  //     Accept: "application/json",
  //     "Content-Type": "application/json",
  //   },
  // },
  db: {
    schema: "public",
  },
});

// Interceptar errores de autenticación globalmente
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "TOKEN_REFRESHED" && !session) {
    console.warn("Token refresh failed, clearing storage");
    localStorage.clear();
    sessionStorage.clear();
  }
});

// Tipos para la base de datos
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: "apartment" | "house" | "commercial" | "land";
  transaction_type: "sale" | "rent";
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
