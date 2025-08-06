/**
 * Formatea un precio como moneda mexicana
 */
export declare function formatPrice(price: number, transactionType?: "sale" | "rent"): string;
/**
 * Obtiene el label en español del tipo de propiedad
 */
export declare function getPropertyTypeLabel(type: string): string;
/**
 * Obtiene el label en español del tipo de transacción
 */
export declare function getTransactionTypeLabel(type: string): string;
/**
 * Valida un email
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Valida un número de teléfono mexicano
 */
export declare function isValidPhoneNumber(phone: string): boolean;
/**
 * Slugifica un string para URLs
 */
export declare function slugify(text: string): string;
/**
 * Capitaliza la primera letra de cada palabra
 */
export declare function capitalizeWords(text: string): string;
/**
 * Trunca un texto a un número máximo de caracteres
 */
export declare function truncateText(text: string, maxLength: number): string;
