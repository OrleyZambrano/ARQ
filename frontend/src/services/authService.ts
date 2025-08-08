import { supabase } from "../lib/supabase";

export interface AuthService {
  getCurrentUser: () => Promise<any>;
  getUserProfile: (userId: string) => Promise<any>;
  getAgentProfile: (userId: string) => Promise<any>;
}

class AuthServiceImpl implements AuthService {
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  }

  async getAgentProfile(userId: string) {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}

export const authService = new AuthServiceImpl();
