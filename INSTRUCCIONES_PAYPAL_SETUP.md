# Configuración de PayPal y Publicaciones Gratuitas

## ✅ Completado

1. **Instalación de PayPal SDK**: ✅ Completado

   - Se instaló `@paypal/react-paypal-js`
   - 5 paquetes agregados exitosamente

2. **Componentes Frontend**: ✅ Completado

   - `PaymentPlansPage.tsx`: Página completa de planes de pago con PayPal
   - `FreePublicationButton.tsx`: Componente para usar publicaciones gratuitas
   - Sin errores de TypeScript

3. **Integración PayPal**: ✅ Completado
   - Client ID: `AXAJm1eYSLm31C2G8KN6rLu03hFqX8KdxKCXF4_XKbLPSCJhSZJWXW-8TYH0ZNQRZ5qE4dKS4OOp3XeQ`
   - Client Secret: `EJVEF7rRHSWJbmxh6Y6T2DvTpQRV1BgQxQQgWx5dQCxLqaK0mhQ8xH7JgEfH7mJ7`
   - Ambiente: Sandbox

## 🔄 Pendiente

### Paso siguiente: Configurar Base de Datos en Supabase

1. **Abrir Supabase Dashboard**:

   - Ve a tu proyecto de Supabase
   - Navega a "SQL Editor"

2. **Ejecutar el Script**:

   - Abre el archivo `setup-paypal-and-free-publications.sql`
   - Copia todo el contenido
   - Pégalo en el editor SQL de Supabase
   - Ejecuta el script completo

3. **Verificar Tablas Creadas**:
   Después de ejecutar el script, deberías ver estas nuevas tablas:

   - `payment_plans`
   - `agent_payments`
   - `agent_credits`
   - `property_publications`

4. **Verificar Funciones**:
   - `can_use_free_publication(agent_uuid)`
   - `use_free_publication(agent_uuid, property_uuid)`
   - `process_payment_and_grant_credits(...)`

## 📋 Planes de Pago Implementados

| Plan         | Precio | Propiedades | Duración |
| ------------ | ------ | ----------- | -------- |
| Starter      | $10    | 5           | 90 días  |
| Professional | $18    | 10          | 90 días  |
| Premium      | $30    | 20          | 120 días |
| Enterprise   | $50    | 50          | 120 días |

## 🎁 Publicaciones Gratuitas

- **2 publicaciones gratuitas** para agentes nuevos
- **60 días** de duración cada una
- Automáticamente disponibles después del registro
- Se pueden usar desde `FreePublicationButton`

## 🔗 Integración en la Aplicación

Para usar estos componentes:

1. **Agregar PaymentPlansPage a las rutas**:

```tsx
import { PaymentPlansPage } from "../pages/PaymentPlansPage";

// En tu router
<Route path="/payment-plans" element={<PaymentPlansPage />} />;
```

2. **Usar FreePublicationButton en propiedades**:

```tsx
import { FreePublicationButton } from "../components/FreePublicationButton";

// En la página de propiedades
<FreePublicationButton
  propertyId={property.id}
  onPublishSuccess={() => console.log("¡Publicado!")}
/>;
```

## 🚀 Próximos Pasos

1. Ejecutar script SQL en Supabase
2. Integrar componentes en la aplicación
3. Probar pagos con PayPal Sandbox
4. Verificar funcionamiento de publicaciones gratuitas
