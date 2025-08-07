import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { clearAuthStorage, handleAuthError } from "../utils/authUtils";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    firstName: string,
    lastName: string
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isAgent: boolean;
  userProfile: any;
  agentProfile: any;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [agentProfile, setAgentProfile] = useState<any>(null);

  useEffect(() => {
    // Obtener sesión inicial con manejo de errores
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          // Si hay error de refresh token, usar utilidad para limpiar
          await handleAuthError(error, supabase);
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            loadUserProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // En caso de error crítico, usar utilidad para limpiar
        await handleAuthError(error, supabase);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      // Si hay un error de token, usar utilidad para limpiar
      if (event === 'TOKEN_REFRESHED' && !session) {
        clearAuthStorage();
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setAgentProfile(null);
        setIsAdmin(false);
        setIsAgent(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      // Cargar perfil de usuario con manejo de errores
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle(); // Cambiar de .single() a .maybeSingle()

      if (profileError) {
        console.error("Error loading user profile:", profileError);
        // Si es error 406 o similar, continuar con valores por defecto
        setUserProfile(null);
        setIsAdmin(false);
        setIsAgent(false);
        return;
      }

      if (profile) {
        setUserProfile(profile);
        setIsAdmin(profile.role === "admin");
        setIsAgent(profile.role === "agent");

        // Si es agente, cargar información adicional
        if (profile.role === "agent") {
          try {
            const { data: agent, error: agentError } = await supabase
              .from("agents")
              .select("*")
              .eq("id", userId)
              .maybeSingle(); // También cambiar aquí

            if (!agentError && agent) {
              setAgentProfile(agent);
            }
          } catch (agentErr) {
            console.error("Error loading agent profile:", agentErr);
          }
        }
      } else {
        // Si no hay perfil, crear uno automáticamente
        console.log("No profile found, creating one...");
        await createMissingProfile(userId);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      // En caso de error crítico, establecer valores seguros
      setUserProfile(null);
      setIsAdmin(false);
      setIsAgent(false);
    }
  };

  const createMissingProfile = async (userId: string) => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser?.user) {
        const { error } = await supabase.from("user_profiles").insert({
          id: userId,
          email: authUser.user.email,
          full_name:
            authUser.user.user_metadata?.full_name ||
            authUser.user.email?.split("@")[0] ||
            "Usuario",
          first_name: authUser.user.user_metadata?.first_name || "Usuario",
          last_name: authUser.user.user_metadata?.last_name || "",
          role: "buyer",
        });

        if (!error) {
          console.log("Profile created successfully");
          // Recargar perfil después de crearlo
          await loadUserProfile(userId);
        }
      }
    } catch (error) {
      console.error("Error creating missing profile:", error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await loadUserProfile(user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    firstName: string,
    lastName: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (!error && data.user) {
      // Crear perfil de usuario con nombre y apellido separados
      await supabase.from("user_profiles").insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
        role: "buyer",
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsAgent(false);
    setUserProfile(null);
    setAgentProfile(null);
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isAgent,
    userProfile,
    agentProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
