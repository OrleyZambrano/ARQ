import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  CreditCard,
  Star,
  Check,
  Gift,
  Clock,
  Zap,
  TrendingUp,
  Shield,
  CheckCircle,
} from "lucide-react";

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  duration: number;
  features: string[];
  popular?: boolean;
}

const paymentPlans: PaymentPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 10,
    credits: 5,
    duration: 90,
    features: [
      "5 propiedades",
      "90 días de duración c/u",
      "Analytics básicos",
      "Chat con compradores",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 18,
    credits: 10,
    duration: 90,
    features: [
      "10 propiedades",
      "90 días de duración c/u",
      "Analytics avanzados",
      "Chat prioritario",
      "Soporte por email",
    ],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 30,
    credits: 20,
    duration: 120,
    features: [
      "20 propiedades",
      "120 días de duración c/u",
      "Analytics completos",
      "Chat prioritario",
      "Soporte telefónico",
      "Destacar propiedades",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 50,
    credits: 50,
    duration: 120,
    features: [
      "50 propiedades",
      "120 días de duración c/u",
      "Analytics premium",
      "Gerente de cuenta",
      "API personalizada",
      "Branding personalizado",
    ],
  },
];

const PAYPAL_CLIENT_ID =
  "AbYKlb2RXOBy0HDMyt1cB76UTSN3cX8_28MZpLYEaqnATydf3zLrB8Ig550fQDB1aUFeo_Uz3f-s4Us5";

interface PaymentPlansPageProps {
  onPurchaseComplete?: () => void;
}

export function PaymentPlansPage({
  onPurchaseComplete,
}: PaymentPlansPageProps) {
  const [user, setUser] = useState<any>(null);
  const [agentData, setAgentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [freePublicationsUsed, setFreePublicationsUsed] = useState(0);
  const [canUseFreePublications, setCanUseFreePublications] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadUserAndAgentData();
  }, []);

  const loadUserAndAgentData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUser(user);

      // Cargar datos del usuario primero
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error loading user profile:", profileError);
      }

      // Siempre cargar datos del agente (crear si no existe)
      let { data: agentData, error: agentError } = await supabase
        .from("agents")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      // Si no existe el agente, crear uno básico
      if (!agentData && !agentError) {
        console.log("Creating agent record for user:", user.id);
        const { data: newAgent, error: createError } = await supabase
          .from("agents")
          .insert({
            id: user.id,
            credits: 0,
            total_credits_used: 0,
            free_publications_used: 0,
            is_new_agent: true,
            is_verified: false,
            publicaciones_disponibles: 0,
          })
          .select()
          .single();

        if (!createError && newAgent) {
          agentData = newAgent;
        }
      }

      if (agentData) {
        const agentInfo = {
          ...userProfile,
          agents: agentData,
        };

        setAgentData(agentInfo);

        // Verificar si puede usar publicaciones gratis
        const { data: canUseFreePub } = await supabase.rpc(
          "can_use_free_publication",
          { agent_uuid: user.id }
        );

        setCanUseFreePublications(canUseFreePub || false);
        setFreePublicationsUsed(agentData.free_publications_used || 0);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalSuccess = async (details: any, planId: string) => {
    setPurchasing(planId);

    try {
      const plan = paymentPlans.find((p) => p.id === planId);
      if (!plan) throw new Error("Plan no encontrado");

      // Verificar/crear perfil de usuario si no existe
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from("user_profiles")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileCheckError) {
        console.error("Error checking user profile:", profileCheckError);
      }

      // Si no tiene perfil, crearlo automáticamente
      if (!existingProfile) {
        const { error: createProfileError } = await supabase
          .from("user_profiles")
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            role: "agent", // Auto-asignar rol de agente al comprar
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (createProfileError) {
          console.error("Error creating user profile:", createProfileError);
          throw new Error("Error creando perfil de usuario");
        }
      } else if (existingProfile.role !== "agent") {
        // Actualizar rol a agente si compra créditos
        await supabase
          .from("user_profiles")
          .update({ role: "agent", updated_at: new Date().toISOString() })
          .eq("id", user.id);
      }

      // Registrar el pago en la base de datos (opcional si la tabla existe)
      try {
        const { error: paymentError } = await supabase.from("payments").insert({
          agent_id: user.id,
          plan: planId,
          amount: plan.price,
          credits_awarded: plan.credits,
          payment_method: "paypal",
          transaction_id: details.id,
          status: "completed",
          paypal_details: details,
        });

        if (paymentError) {
          console.warn("Tabla payments no existe o error:", paymentError);
          // Continuar sin registrar el pago si la tabla no existe
        }
      } catch (paymentErr) {
        console.warn("Error registrando pago, continuando:", paymentErr);
      }

      // Actualizar créditos del agente (usar UPSERT para crear si no existe)
      console.log("🔄 Actualizando créditos para usuario:", user.id);
      console.log("💰 Créditos actuales:", agentData?.agents?.credits || 0);
      console.log("➕ Créditos a añadir:", plan.credits);

      const { error: creditsError } = await supabase.from("agents").upsert(
        {
          id: user.id,
          credits: (agentData?.agents?.credits || 0) + plan.credits,
          total_credits_used: agentData?.agents?.total_credits_used || 0,
          is_verified: true, // Auto-verificar cuando compra créditos
          publicaciones_disponibles:
            (agentData?.agents?.publicaciones_disponibles || 0) + plan.credits,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

      if (creditsError) {
        console.error("❌ Error updating agent credits:", creditsError);
        throw new Error(`Error actualizando créditos: ${creditsError.message}`);
      }

      console.log("✅ Créditos actualizados exitosamente en la base de datos");

      const creditsAntes = agentData?.agents?.credits || 0;
      const creditsDespues = creditsAntes + plan.credits;

      // Mostrar notificación de éxito más informativa
      const mensaje = `🎉 ¡Pago exitoso!

📊 Resumen:
• Plan: ${plan.name}
• Créditos añadidos: ${plan.credits}
• Créditos antes: ${creditsAntes}
• Créditos ahora: ${creditsDespues}

Los créditos ya están disponibles en tu cuenta. ¡Puedes empezar a publicar!`;

      setSuccessMessage(mensaje);

      // Ocultar mensaje después de 8 segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 8000);

      // Forzar actualización inmediata de los datos locales
      if (agentData?.agents) {
        setAgentData({
          ...agentData,
          agents: {
            ...agentData.agents,
            credits: creditsDespues,
            publicaciones_disponibles:
              (agentData.agents.publicaciones_disponibles || 0) + plan.credits,
            is_verified: true,
          },
        });
      }

      // Recargar datos desde la base de datos después de un momento
      setTimeout(async () => {
        console.log("Recargando datos desde la base de datos...");
        await loadUserAndAgentData();
      }, 2000);

      onPurchaseComplete?.();
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error al procesar el pago. Contacta soporte.");
    } finally {
      setPurchasing(null);
    }
  };

  const handlePayPalError = (error: any) => {
    console.error("PayPal Error:", error);
    alert("Error en el pago con PayPal. Intenta nuevamente.");
    setPurchasing(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture",
      }}
    >
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Notificación de éxito */}
          {successMessage && (
            <div className="fixed top-4 right-4 z-50 max-w-md">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <pre className="text-sm text-green-800 whitespace-pre-wrap">
                      {successMessage}
                    </pre>
                    <div className="mt-3">
                      <button
                        onClick={() => setSuccessMessage(null)}
                        className="text-xs text-green-600 hover:text-green-800 underline"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Planes de Publicación
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Elige el plan perfecto para publicar tus propiedades y hacer
              crecer tu negocio inmobiliario
            </p>
          </div>

          {/* Estado actual del agente */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">Tu cuenta</h3>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="bg-blue-50 px-4 py-2 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">
                      Créditos disponibles
                    </p>
                    <p className="text-2xl font-bold text-blue-800">
                      {agentData?.agents?.credits || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Publicaciones totales
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {agentData?.agents?.publicaciones_disponibles || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-3">
                {/* Botón para actualizar datos */}
                <button
                  onClick={() => {
                    setLoading(true);
                    loadUserAndAgentData();
                  }}
                  disabled={loading}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  {loading ? "⟳" : "🔄"} Actualizar
                </button>

                {/* Publicaciones gratis */}
                {canUseFreePublications && freePublicationsUsed < 2 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Gift className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          ¡Publicaciones Gratis!
                        </p>
                        <p className="text-xs text-green-600">
                          Te quedan {2 - freePublicationsUsed} de 60 días
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Planes de pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {paymentPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                  plan.popular ? "ring-2 ring-blue-500" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2">
                    <div className="flex items-center justify-center space-x-1">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">Más Popular</span>
                    </div>
                  </div>
                )}

                <div className={`p-6 ${plan.popular ? "pt-16" : ""}`}>
                  {/* Icono del plan */}
                  <div className="mb-4">
                    {plan.id === "starter" && (
                      <Zap className="h-8 w-8 text-blue-600" />
                    )}
                    {plan.id === "professional" && (
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    )}
                    {plan.id === "premium" && (
                      <Shield className="h-8 w-8 text-blue-600" />
                    )}
                    {plan.id === "enterprise" && (
                      <CreditCard className="h-8 w-8 text-blue-600" />
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>

                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 ml-1">USD</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-6">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{plan.duration} días por propiedad</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Botón PayPal */}
                  <div className="w-full">
                    {purchasing === plan.id ? (
                      <div className="w-full bg-gray-100 rounded-lg py-3 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-gray-700">Procesando...</span>
                      </div>
                    ) : (
                      <PayPalButtons
                        style={{
                          layout: "vertical",
                          color: "blue",
                          shape: "rect",
                        }}
                        createOrder={(_data, actions) => {
                          return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [
                              {
                                amount: {
                                  value: plan.price.toString(),
                                  currency_code: "USD",
                                },
                                description: `PropFinder - Plan ${plan.name} (${plan.credits} créditos)`,
                              },
                            ],
                            application_context: {
                              brand_name: "PropFinder",
                              landing_page: "BILLING",
                              user_action: "PAY_NOW",
                            },
                          });
                        }}
                        onApprove={async (_data: any, actions: any) => {
                          if (actions.order) {
                            const details = await actions.order.capture();
                            await handlePayPalSuccess(details, plan.id);
                          }
                        }}
                        onError={handlePayPalError}
                        onCancel={() => {
                          console.log("PayPal payment cancelled");
                          setPurchasing(null);
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Información adicional */}
          <div className="mt-12 bg-blue-50 rounded-lg p-8">
            <h3 className="text-lg font-medium text-blue-900 mb-4">
              ¿Cómo funcionan los créditos?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Compra créditos</h4>
                  <p className="text-sm text-blue-700">
                    Elige el plan que mejor se adapte a tus necesidades
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">
                    Publica propiedades
                  </h4>
                  <p className="text-sm text-blue-700">
                    Usa 1 crédito por cada propiedad que publiques
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Recibe leads</h4>
                  <p className="text-sm text-blue-700">
                    Conecta con compradores interesados en tus propiedades
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
