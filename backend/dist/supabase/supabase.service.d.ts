export declare class SupabaseService {
    private supabase;
    constructor();
    getClient(): any;
    getProperties(filters?: any): Promise<any>;
    getPropertyById(id: string): Promise<any>;
    createProperty(propertyData: any, agentId: string): Promise<any>;
    updateProperty(id: string, propertyData: any): Promise<any>;
    deleteProperty(id: string): Promise<any>;
    getAgentProfile(userId: string): Promise<any>;
    createUserProfile(userProfile: any): Promise<any>;
    createAgentProfile(agentData: any): Promise<any>;
}
