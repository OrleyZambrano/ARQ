# 🔧 Instrucciones de Instalación del Sistema de Chat

## ❌ **Problema Detectado**

El error indica que tu tabla `chat_sessions` en Supabase usa `user_id` en lugar de `buyer_id`. He corregido todos los archivos para usar la estructura correcta.

## ✅ **Archivos Corregidos**

1. ✅ `CHAT_RLS_SETUP_FIXED.sql` - Script SQL corregido
2. ✅ `frontend/src/hooks/useChat.tsx` - Hook actualizado
3. ✅ `frontend/src/types/chat.types.ts` - Tipos corregidos
4. ✅ `CHAT_RLS_POLICIES.sql` - Políticas actualizadas

## 🚀 **Pasos de Instalación**

### **Paso 1: Ejecutar Script SQL en Supabase**

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor**
3. Copia y pega el contenido completo de `CHAT_RLS_SETUP_FIXED.sql`
4. Haz clic en **Run**

El script hará automáticamente:

- ✅ Eliminar políticas existentes (si las hay)
- ✅ Crear políticas RLS correctas con `user_id`
- ✅ Habilitar Realtime
- ✅ Crear triggers automáticos
- ✅ Configurar permisos
- ✅ Mostrar mensaje de confirmación

### **Paso 2: Verificar la Instalación**

Después de ejecutar el script, deberías ver:

```
NOTICE: Chat RLS policies configured successfully!
NOTICE: Tables: chat_sessions, chat_messages
NOTICE: Realtime: Enabled
NOTICE: Frontend: Ready to use
```

### **Paso 3: Verificar Estructura de Tablas**

Ejecuta esta consulta en Supabase para confirmar la estructura:

```sql
-- Verificar estructura de chat_sessions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_sessions'
ORDER BY ordinal_position;

-- Verificar estructura de chat_messages
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_messages'
ORDER BY ordinal_position;
```

**Deberías ver:**

**chat_sessions:**

- `id` (uuid)
- `property_id` (uuid)
- `user_id` (uuid) ← **Importante: debe ser user_id, no buyer_id**
- `agent_id` (uuid)
- `status` (text)
- `last_message_at` (timestamp)
- `created_at` (timestamp)

**chat_messages:**

- `id` (uuid)
- `session_id` (uuid)
- `sender_id` (uuid)
- `message` (text)
- `message_type` (text)
- `has_attachments` (boolean)
- `is_read` (boolean)
- `created_at` (timestamp)

### **Paso 4: Probar el Frontend**

1. Asegúrate de que el servidor de desarrollo esté corriendo:

   ```bash
   cd frontend
   npm run dev
   ```

2. Ve a una propiedad cualquiera
3. Busca el botón verde "Contactar"
4. Haz clic y prueba enviar un mensaje

## 🧪 **Cómo Probar el Sistema**

### **Test 1: Crear Chat desde Propiedad**

1. Ve a cualquier propiedad (`/properties/[id]`)
2. Haz clic en "Contactar"
3. Debería abrir el modal de chat
4. Escribe un mensaje y envía

### **Test 2: Gestión de Chats**

1. Ve a `/chat` o haz clic en "Mensajes" en el header
2. Deberías ver la lista de chats
3. Haz clic en un chat para abrir la conversación

### **Test 3: Tiempo Real**

1. Abre dos navegadores (o pestañas en incógnito)
2. Inicia sesión como comprador en uno y agente en otro
3. Crea un chat desde una propiedad
4. Los mensajes deberían aparecer en tiempo real

## 🐛 **Resolución de Problemas**

### **Error: "column buyer_id does not exist"**

✅ **Solucionado**: Usamos `user_id` en todos los archivos

### **Error: "policy already exists"**

✅ **Solucionado**: El script elimina políticas existentes antes de crear nuevas

### **No aparecen mensajes en tiempo real**

Ejecuta en Supabase SQL Editor:

```sql
-- Verificar que Realtime está habilitado
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

### **Error de permisos**

Ejecuta en Supabase SQL Editor:

```sql
-- Verificar políticas RLS
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('chat_sessions', 'chat_messages');
```

## ✅ **Verificación Final**

Si todo está correcto, deberías poder:

1. ✅ Ver el botón "Contactar" en las propiedades
2. ✅ Abrir el modal de chat y enviar mensajes
3. ✅ Ver notificaciones de mensajes no leídos en el header
4. ✅ Acceder a la página `/chat` y ver todos los chats
5. ✅ Los mensajes aparecen en tiempo real sin refrescar

## 📞 **Soporte**

Si tienes algún problema:

1. Verifica que ejecutaste `CHAT_RLS_SETUP_FIXED.sql` completamente
2. Confirma que tu tabla usa `user_id` y no `buyer_id`
3. Verifica que Realtime está habilitado en Supabase
4. Comprueba que no hay errores en la consola del navegador

---

## 🎉 **¡Sistema Listo!**

Una vez completados estos pasos, tendrás un sistema de chat completamente funcional con:

- ✅ Chat en tiempo real
- ✅ Chats temporales (controlados por agente)
- ✅ Seguridad RLS completa
- ✅ Notificaciones automáticas
- ✅ Interface moderna y responsive
