// src/lib/utils.js
// Funciones auxiliares para el sistema de tracking

import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

/**
 * Formatea una fecha en la zona horaria de Ecuador
 * @param {Date|string} date - Fecha a formatear
 * @param {string} formatStr - Formato deseado (default: 'yyyy-MM-dd HH:mm:ss')
 * @returns {string} Fecha formateada
 */
export function formatEcuadorDate(date, formatStr = 'yyyy-MM-dd HH:mm:ss') {
  const timezone = 'America/Guayaquil';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(dateObj, timezone, formatStr);
}

/**
 * Obtiene la fecha y hora actual de Ecuador
 * @returns {string} Fecha y hora actual formateada
 */
export function getCurrentEcuadorDateTime() {
  return formatEcuadorDate(new Date());
}

/**
 * Valida si un número de guía tiene el formato correcto
 * @param {string} guia - Número de guía a validar
 * @returns {boolean} True si es válido
 */
export function isValidGuia(guia) {
  // Formato típico: LC seguido de números (ej: LC51960903)
  const regex = /^[A-Z]{2}\d{5,10}$/;
  return regex.test(guia.trim().toUpperCase());
}

/**
 * Limpia y normaliza un número de guía
 * @param {string} guia - Número de guía a limpiar
 * @returns {string} Guía limpia y en mayúsculas
 */
export function cleanGuia(guia) {
  return guia.trim().toUpperCase().replace(/\s+/g, '');
}

/**
 * Procesa una lista de guías separadas por comas
 * @param {string} guiasText - Texto con guías separadas por comas
 * @returns {Array<string>} Array de guías limpias y válidas
 */
export function parseGuiasList(guiasText) {
  const guias = guiasText
    .split(',')
    .map(cleanGuia)
    .filter(guia => guia && isValidGuia(guia));
  
  // Eliminar duplicados
  return [...new Set(guias)];
}

/**
 * Determina si una guía está en estado final (no requiere más actualizaciones)
 * @param {string} estado - Estado de la guía
 * @returns {boolean} True si está en estado final
 */
export function isFinalState(estado) {
  if (!estado) return false;
  
  const estadoLower = estado.toLowerCase();
  const finalStates = [
    'entregado',
    'devolución/entrega',
    'devolucion/entrega',
    'siniestro/entrega'
  ];
  
  return finalStates.some(finalState => estadoLower.includes(finalState));
}

/**
 * Genera un ID único para una guía
 * @param {string} guia - Número de guía
 * @returns {string} ID único
 */
export function generateGuiaId(guia) {
  return `${guia}-${Date.now()}`;
}

/**
 * Mantiene solo los últimos N estados en el historial
 * @param {string} historial - Historial en formato JSON string
 * @param {number} maxStates - Máximo de estados a mantener (default: 3)
 * @returns {string} Historial actualizado
 */
export function trimHistorial(historial, maxStates = 3) {
  try {
    if (!historial) return '[]';
    
    const estados = JSON.parse(historial);
    if (!Array.isArray(estados)) return '[]';
    
    // Mantener solo los últimos N estados
    const trimmed = estados.slice(-maxStates);
    return JSON.stringify(trimmed);
  } catch (error) {
    console.error('Error al procesar historial:', error);
    return '[]';
  }
}

/**
 * Agrega un nuevo estado al historial
 * @param {string} historial - Historial actual en formato JSON string
 * @param {Object} nuevoEstado - Nuevo estado a agregar
 * @returns {string} Historial actualizado
 */
export function addToHistorial(historial, nuevoEstado) {
  try {
    const estados = historial ? JSON.parse(historial) : [];
    
    // Agregar nuevo estado con timestamp
    estados.push({
      ...nuevoEstado,
      timestamp: getCurrentEcuadorDateTime()
    });
    
    // Mantener solo los últimos 3
    return trimHistorial(JSON.stringify(estados), 3);
  } catch (error) {
    console.error('Error al agregar estado al historial:', error);
    return JSON.stringify([{
      ...nuevoEstado,
      timestamp: getCurrentEcuadorDateTime()
    }]);
  }
}

/**
 * Retrasa la ejecución por un tiempo determinado
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise} Promesa que se resuelve después del delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Obtiene el delay configurado para scraping
 * @returns {number} Delay en milisegundos
 */
export function getScrapingDelay() {
  return parseInt(process.env.SCRAPING_DELAY_MS || '2000', 10);
}

/**
 * Obtiene el límite máximo de guías por lote
 * @returns {number} Máximo de guías
 */
export function getMaxGuiasPerBatch() {
  return parseInt(process.env.MAX_GUIAS_PER_BATCH || '50', 10);
}

/**
 * Formatea el estado para mostrar
 * @param {string} estado - Estado de la guía
 * @returns {string} Estado formateado
 */
export function formatEstado(estado) {
  if (!estado) return 'Desconocido';
  return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
}

/**
 * Obtiene el color del badge según el estado
 * @param {string} estado - Estado de la guía
 * @returns {string} Clase de color
 */
export function getEstadoBadgeColor(estado) {
  if (!estado) return 'gray';
  
  const estadoLower = estado.toLowerCase();
  
  if (estadoLower.includes('entregado')) return 'green';
  if (estadoLower.includes('tránsito') || estadoLower.includes('transito')) return 'blue';
  if (estadoLower.includes('origen') || estadoLower.includes('bodega')) return 'yellow';
  if (estadoLower.includes('devolución') || estadoLower.includes('devolucion')) return 'orange';
  if (estadoLower.includes('siniestro')) return 'red';
  if (estadoLower.includes('novedad')) return 'purple';
  
  return 'gray';
}

/**
 * Valida las variables de entorno requeridas
 * @throws {Error} Si falta alguna variable requerida
 */
export function validateEnvironmentVariables() {
  const required = [
    'GOOGLE_SHEETS_SPREADSHEET_ID',
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_CREDENTIALS_BASE64'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno requeridas: ${missing.join(', ')}\n` +
      'Por favor, configura estas variables en .env.local o en Vercel'
    );
  }
}

/**
 * Maneja errores y retorna respuesta JSON apropiada
 * @param {Error} error - Error capturado
 * @param {string} context - Contexto donde ocurrió el error
 * @returns {Object} Objeto con error formateado
 */
export function handleError(error, context = 'Operación') {
  console.error(`Error en ${context}:`, error);
  
  return {
    success: false,
    error: error.message || 'Error desconocido',
    context,
    timestamp: getCurrentEcuadorDateTime()
  };
}

/**
 * Construye URL para el tracking de LAAR Courier
 * @param {string} guia - Número de guía
 * @returns {string} URL completa
 */
export function buildTrackingUrl(guia) {
  return `https://fenixoper.laarcourier.com/Tracking/Guiacompleta.aspx?Guia=${guia}`;
}

/**
 * Valida que los datos de scraping sean correctos
 * @param {Object} data - Datos del scraping
 * @returns {boolean} True si los datos son válidos
 */
export function isValidScrapedData(data) {
  return (
    data &&
    typeof data === 'object' &&
    data.estado &&
    typeof data.estado === 'string' &&
    data.estado.trim() !== ''
  );
}
