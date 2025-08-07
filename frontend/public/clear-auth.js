/**
 * Script para limpiar manualmente el almacenamiento de autenticación
 * Ejecutar en la consola del navegador si hay problemas persistentes
 */

console.log('🧹 Limpiando almacenamiento de autenticación...');

// Limpiar localStorage
const localStorageKeys = Object.keys(localStorage);
const authKeysLocal = localStorageKeys.filter(key => 
  key.startsWith('supabase.auth.token') || 
  key.startsWith('sb-') ||
  key.includes('auth') ||
  key.includes('session')
);

console.log('📦 Eliminando claves de localStorage:', authKeysLocal);
authKeysLocal.forEach(key => {
  localStorage.removeItem(key);
  console.log(`   ❌ Eliminado: ${key}`);
});

// Limpiar sessionStorage
const sessionStorageKeys = Object.keys(sessionStorage);
const authKeysSession = sessionStorageKeys.filter(key => 
  key.startsWith('supabase.auth.token') || 
  key.startsWith('sb-') ||
  key.includes('auth') ||
  key.includes('session')
);

console.log('📦 Eliminando claves de sessionStorage:', authKeysSession);
authKeysSession.forEach(key => {
  sessionStorage.removeItem(key);
  console.log(`   ❌ Eliminado: ${key}`);
});

// Limpiar cookies relacionadas con autenticación
const cookiesToClear = [
  'sb-access-token',
  'sb-refresh-token',
  'supabase-auth-token',
  'auth-token'
];

console.log('🍪 Limpiando cookies de autenticación...');
cookiesToClear.forEach(cookieName => {
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  console.log(`   ❌ Cookie eliminada: ${cookieName}`);
});

console.log('✅ Limpieza completada. Recarga la página para continuar.');
console.log('🔄 Ejecutando recarga automática en 2 segundos...');

setTimeout(() => {
  window.location.reload();
}, 2000);
