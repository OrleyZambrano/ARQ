import { createClient } from "@supabase/supabase-js";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SupabaseService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase URL and Service Role Key must be provided");
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  getClient() {
    return this.supabase;
  }

  // Métodos específicos para PropFinder
  async getProperties(filters: any = {}) {
    const { data, error } = await this.supabase
      .from("properties")
      .select(
        `
        *,
        agents (
          id,
          user_profiles (
            full_name,
            phone,
            email,
            avatar_url
          )
        )
      `
      )
      .eq("is_active", true);

    if (error) throw error;
    return data;
  }

  async getPropertyById(id: string) {
    const { data, error } = await this.supabase
      .from("properties")
      .select(
        `
        *,
        agents (
          id,
          user_profiles (
            full_name,
            phone,
            email,
            avatar_url
          ),
          rating,
          total_ratings,
          company_name
        ),
        property_images (
          url,
          alt_text,
          display_order
        )
      `
      )
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    return data;
  }

  async createProperty(propertyData: any, agentId: string) {
    const { data, error } = await this.supabase
      .from("properties")
      .insert({
        ...propertyData,
        agent_id: agentId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProperty(id: string, propertyData: any) {
    const { data, error } = await this.supabase
      .from("properties")
      .update(propertyData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProperty(id: string) {
    const { data, error } = await this.supabase
      .from("properties")
      .update({ is_active: false })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Métodos para agentes
  async getAgentProfile(userId: string) {
    const { data, error } = await this.supabase
      .from("agents")
      .select(
        `
        *,
        user_profiles (
          full_name,
          email,
          phone,
          avatar_url
        )
      `
      )
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  }

  async createUserProfile(userProfile: any) {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .insert(userProfile)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createAgentProfile(agentData: any) {
    const { data, error } = await this.supabase
      .from("agents")
      .insert(agentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
