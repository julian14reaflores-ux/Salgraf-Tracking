// src/lib/utils.js
// Funciones auxiliares para el sistema de tracking

import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export function formatEcuadorDate(date, formatStr = 'yyyy-MM-dd HH:mm:ss') {
  const timezone = 'America/Guayaquil';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(dateObj, timezone, formatStr);
}

export function getCurrentEcuadorDateTime() {
  return formatEcuadorDate(new Date());
}

export function isValidGuia(guia) {
  const regex = /^[A-Z]{2}\d{5,10}$/;
  return regex.test(guia.trim().toUpperCase());
}

export function cleanGuia(guia) {
  return guia.trim().toUpperCase().replace(/\s+/g, '');
}

export function parseGuiasList(guiasText) {
  const guias = guiasText
    .split(',')
    .map(cleanGuia)
    .filter(guia => guia && isValidGuia(guia));
  
  return [...new Set(guias)];
}

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

export function generateGuiaId(guia) {
  return `${guia}-${Date.now()}`;
}

export function trimHistorial(historial, maxStates = 3) {
  try {
    if (!historial) return '[]';
    
    const estados = JSON.parse(historial);
    if (!Array.isArray(estados)) return '[]';
    
    const trimmed = estados.slice(-maxStates);
    return JSON.stringify(trimmed);
  } catch (error) {
    console.error('Error al procesar historial:', error);
    return '[]';
  }
}

export function addToHistorial(historial, nuevoEstado) {
  try {
    const estados = historial ? JSON.parse(historial) : [];
    
    estados.push({
      ...nuevoEstado,
      timestamp: getCurrentEcuadorDateTime()
    });
    
    return trimHistorial(JSON.stringify(estados), 3);
  } catch (error) {
    console.error('Error al agregar estado al historial:', error);
    return JSON.stringify([{
      ...nuevoEstado,
      timestamp: getCurrentEcuadorDateTime()
    }]);
  }
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getScrapingDelay() {
  return parseInt(process.env.SCRAPING_DELAY_MS || '2000', 10);
}

export function getMaxGuiasPerBatch() {
  return parseInt(process.env.MAX_GUIAS_PER_BATCH || '50', 10);
}

export function formatEstado(estado) {
  if (!estado) return 'Desconocido';
  return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
}

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

export function handleError(error, context = 'Operación') {
  console.error(`Error en ${context}:`, error);
  
  return {
    success: false,
    error: error.message || 'Error desconocido',
    context,
    timestamp: getCurrentEcuadorDateTime()
  };
}

export function buildTrackingUrl(guia) {
  return `https://fenixoper.laarcourier.com/Tracking/Guiacompleta.aspx?Guia=${guia}`;
}

export function isValidScrapedData(data) {
  return (
    data &&
    typeof data === 'object' &&
    data.estado &&
    typeof data.estado === 'string' &&
    data.estado.trim() !== ''
  );
}
