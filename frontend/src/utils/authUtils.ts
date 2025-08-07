/**
 * Utilidades para manejo de autenticación
 */

/**
 * Limpia el almacenamiento local y de sesión cuando hay errores de token
 */
export const clearAuthStorage = () => {
  try {
    // Limpiar localStorage
    const authKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('supabase.auth.token') || 
      key.startsWith('sb-') ||
      key.includes('auth')
    );
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Limpiar sessionStorage
    const sessionAuthKeys = Object.keys(sessionStorage).filter(key => 
      key.startsWith('supabase.auth.token') || 
      key.startsWith('sb-') ||
      key.includes('auth')
    );
    
    sessionAuthKeys.forEach(key => {
      sessionStorage.removeItem(key);
    });
    
    console.log('Auth storage cleared successfully');
  } catch (error) {
    console.error('Error clearing auth storage:', error);
  }
};

/**
 * Verifica si un error es relacionado con tokens de autenticación
 */
export const isAuthTokenError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toString() || '';
  
  return (
    errorMessage.includes('refresh') ||
    errorMessage.includes('token') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('expired') ||
    errorCode === '400' ||
    errorCode === '401' ||
    errorCode === '403'
  );
};

/**
 * Maneja errores de autenticación de manera consistente
 */
export const handleAuthError = async (error: any, supabaseClient: any) => {
  if (isAuthTokenError(error)) {
    console.warn('Auth token error detected, cleaning up:', error);
    clearAuthStorage();
    try {
      await supabaseClient.auth.signOut();
    } catch (signOutError) {
      console.error('Error during sign out:', signOutError);
    }
  }
};
