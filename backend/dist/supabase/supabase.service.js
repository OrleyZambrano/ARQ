"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const common_1 = require("@nestjs/common");
let SupabaseService = class SupabaseService {
    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error("Supabase URL and Service Role Key must be provided");
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    getClient() {
        return this.supabase;
    }
    async getProperties(filters = {}) {
        const { data, error } = await this.supabase
            .from("properties")
            .select(`
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
      `)
            .eq("is_active", true);
        if (error)
            throw error;
        return data;
    }
    async getPropertyById(id) {
        const { data, error } = await this.supabase
            .from("properties")
            .select(`
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
      `)
            .eq("id", id)
            .eq("is_active", true)
            .single();
        if (error)
            throw error;
        return data;
    }
    async createProperty(propertyData, agentId) {
        const { data, error } = await this.supabase
            .from("properties")
            .insert({
            ...propertyData,
            agent_id: agentId,
        })
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async updateProperty(id, propertyData) {
        const { data, error } = await this.supabase
            .from("properties")
            .update(propertyData)
            .eq("id", id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async deleteProperty(id) {
        const { data, error } = await this.supabase
            .from("properties")
            .update({ is_active: false })
            .eq("id", id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async getAgentProfile(userId) {
        const { data, error } = await this.supabase
            .from("agents")
            .select(`
        *,
        user_profiles (
          full_name,
          email,
          phone,
          avatar_url
        )
      `)
            .eq("id", userId)
            .single();
        if (error)
            throw error;
        return data;
    }
    async createUserProfile(userProfile) {
        const { data, error } = await this.supabase
            .from("user_profiles")
            .insert(userProfile)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async createAgentProfile(agentData) {
        const { data, error } = await this.supabase
            .from("agents")
            .insert(agentData)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SupabaseService);
//# sourceMappingURL=supabase.service.js.map