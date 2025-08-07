// Utilidades compartidas para PropFinder
/**
 * Formatea un precio como moneda mexicana
 */
export function formatPrice(price, transactionType = "sale") {
    const formatter = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    const formattedPrice = formatter.format(price);
    if (transactionType === "rent") {
        return `${formattedPrice}/mes`;
    }
    return formattedPrice;
}
/**
 * Obtiene el label en español del tipo de propiedad
 */
export function getPropertyTypeLabel(type) {
    const types = {
        apartment: "Departamento",
        house: "Casa",
        commercial: "Comercial",
        land: "Terreno",
    };
    return types[type] || type;
}
/**
 * Obtiene el label en español del tipo de transacción
 */
export function getTransactionTypeLabel(type) {
    const types = {
        sale: "Venta",
        rent: "Renta",
    };
    return types[type] || type;
}
/**
 * Valida un email
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Valida un número de teléfono mexicano
 */
export function isValidPhoneNumber(phone) {
    const phoneRegex = /^(\+52|52)?[\s-]?(\d{2})[\s-]?(\d{4})[\s-]?(\d{4})$/;
    return phoneRegex.test(phone);
}
/**
 * Slugifica un string para URLs
 */
export function slugify(text) {
    return text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
}
/**
 * Capitaliza la primera letra de cada palabra
 */
export function capitalizeWords(text) {
    return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}
/**
 * Trunca un texto a un número máximo de caracteres
 */
export function truncateText(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    return text.substr(0, maxLength - 3) + "...";
}
