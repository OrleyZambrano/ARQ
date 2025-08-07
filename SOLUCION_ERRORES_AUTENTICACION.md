# Solución de Problemas de Autenticación

## Error: "Invalid Refresh Token: Refresh Token Not Found"

Este error ocurre cuando los tokens de autenticación almacenados en el navegador han expirado o se han corrompido.

### Soluciones Automáticas Implementadas

1. **Manejo Automático de Errores**: El sistema ahora detecta automáticamente errores de token y limpia el almacenamiento.

2. **Limpieza Inteligente**: Solo se eliminan las claves relacionadas con autenticación, preservando otros datos del usuario.

3. **Reinicio Graceful**: Cuando se detecta un error de token, la aplicación redirige automáticamente al usuario a la página de login.

### Soluciones Manuales

#### Opción 1: Refrescar la Página
Simplemente recarga la página (F5 o Ctrl+R). El sistema automáticamente detectará el problema y limpiará los tokens inválidos.

#### Opción 2: Limpiar Manualmente desde la Consola
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Copia y pega este código:

```javascript
// Limpiar almacenamiento de autenticación
const authKeys = Object.keys(localStorage).filter(key => 
  key.startsWith('supabase.auth.token') || 
  key.startsWith('sb-') ||
  key.includes('auth')
);
authKeys.forEach(key => localStorage.removeItem(key));

const sessionAuthKeys = Object.keys(sessionStorage).filter(key => 
  key.startsWith('supabase.auth.token') || 
  key.startsWith('sb-') ||
  key.includes('auth')
);
sessionAuthKeys.forEach(key => sessionStorage.removeItem(key));

console.log('Almacenamiento limpiado. Recarga la página.');
window.location.reload();
```

#### Opción 3: Usar el Script Automático
1. En la consola del navegador, ejecuta:
```javascript
fetch('/clear-auth.js').then(r => r.text()).then(eval);
```

#### Opción 4: Limpiar Manualmente el Navegador
1. Ve a Configuración del navegador
2. Busca "Privacidad y seguridad"
3. Selecciona "Borrar datos de navegación"
4. Marca solo "Cookies y otros datos de sitios web"
5. Selecciona "Solo para este sitio" si está disponible
6. Haz clic en "Borrar datos"

### Prevención

Para evitar este problema en el futuro:

1. **No Cierres la Aplicación Abruptamente**: Usa el botón de cerrar sesión cuando sea posible.

2. **Actualiza Regularmente**: Mantén la pestaña activa o refresca periódicamente si planeas usar la aplicación por largos períodos.

3. **Usa una Sola Pestaña**: Evita tener múltiples pestañas de la aplicación abiertas simultáneamente.

### Cambios Implementados

1. **AuthContext Mejorado**: Mejor manejo de errores de token y limpieza automática.

2. **Utilidades de Autenticación**: Funciones centralizadas para manejar errores y limpiar almacenamiento.

3. **Manejador de Errores**: Componente que captura errores de autenticación y permite recuperación fácil.

4. **Configuración Robusta de Supabase**: Configuración mejorada con manejo de errores de almacenamiento.

### Registro de Errores

El sistema ahora registra automáticamente todos los errores de autenticación en la consola para facilitar el diagnóstico:

- `Auth state changed`: Cambios en el estado de autenticación
- `Error getting session`: Errores al obtener la sesión
- `Token refresh failed`: Fallos en la renovación de tokens
- `Auth storage cleared`: Limpieza automática del almacenamiento

### Contacto para Soporte

Si el problema persiste después de probar todas las soluciones:

1. Abre las herramientas de desarrollador
2. Ve a la pestaña "Console"
3. Toma una captura de pantalla de cualquier error mostrado
4. Incluye la información del navegador y sistema operativo
5. Contacta al equipo de desarrollo con esta información
