// src/lib/scraper.js
// Módulo de web scraping para consultar el estado de guías LAAR Courier

import { buildTrackingUrl, delay, getScrapingDelay } from './utils.js';

/**
 * Extrae datos de tracking desde la página de LAAR Courier
 * Esta función debe ser llamada desde una API route que use Puppeteer
 * @param {string} guia - Número de guía a consultar
 * @returns {Promise<Object>} Datos extraídos del tracking
 */
export async function scrapeGuiaData(guia) {
  const url = buildTrackingUrl(guia);
  
  try {
    // Nota: Esta función será llamada desde el endpoint API que usa Puppeteer
    // Aquí solo definimos la lógica de extracción
    
    // Esta es la estructura de datos que esperamos retornar
    return {
      guia,
      estado: null,
      ciudadOrigen: null,
      ciudadDestino: null,
      entregadoA: null,
      fechaEntrega: null,
      url,
    };
  } catch (error) {
    console.error(`Error al hacer scraping de guía ${guia}:`, error);
    throw error;
  }
}

/**
 * Realiza scraping de múltiples guías con delay entre peticiones
 * @param {Array<string>} guias - Array de números de guía
 * @param {Function} scrapeFn - Función que realiza el scraping real
 * @returns {Promise<Array>} Array de resultados
 */
export async function scrapeMultipleGuias(guias, scrapeFn) {
  const results = [];
  const delayMs = getScrapingDelay();

  for (let i = 0; i < guias.length; i++) {
    const guia = guias[i];
    
    try {
      console.log(`Scraping guía ${i + 1}/${guias.length}: ${guia}`);
      
      // Realizar scraping
      const data = await scrapeFn(guia);
      results.push({
        success: true,
        guia,
        data,
      });

      // Agregar delay entre peticiones (excepto en la última)
      if (i < guias.length - 1) {
        console.log(`Esperando ${delayMs}ms antes de la siguiente petición...`);
        await delay(delayMs);
      }
    } catch (error) {
      console.error(`Error al procesar guía ${guia}:`, error);
      results.push({
        success: false,
        guia,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Selectores CSS para extraer información de la página
 * Estos pueden necesitar ajustes según la estructura actual del sitio
 */
export const SELECTORS = {
  // Contenedor principal de datos
  mainContainer: '.tracking-details, #tracking-info, .guia-info',
  
  // Estado actual
  estado: [
    '.estado-guia',
    '.status',
    '[class*="estado"]',
    'td:contains("Estado") + td',
  ],
  
  // Ciudades
  ciudadOrigen: [
    '.ciudad-origen',
    '[class*="origen"]',
    'td:contains("Origen") + td',
  ],
  ciudadDestino: [
    '.ciudad-destino',
    '[class*="destino"]',
    'td:contains("Destino") + td',
  ],
  
  // Información de entrega
  entregadoA: [
    '.entregado-a',
    '.receptor',
    'td:contains("Entregado a") + td',
    'td:contains("Recibido por") + td',
  ],
  fechaEntrega: [
    '.fecha-entrega',
    '[class*="fecha"]',
    'td:contains("Fecha de entrega") + td',
  ],
  
  // Tabla de seguimiento (para extraer múltiples estados si hay historial)
  trackingTable: 'table.tracking, .tracking-table, #trackingTable',
};

/**
 * Función auxiliar para intentar múltiples selectores
 * @param {Object} page - Página de Puppeteer
 * @param {Array<string>} selectors - Array de selectores a intentar
 * @returns {Promise<string|null>} Texto extraído o null
 */
export async function trySelectors(page, selectors) {
  for (const selector of selectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        const text = await page.evaluate(el => el.textContent.trim(), element);
        if (text) return text;
      }
    } catch (error) {
      // Continuar con el siguiente selector
      continue;
    }
  }
  return null;
}

/**
 * Extrae el estado de una guía desde el HTML de la página
 * Esta es una función de respaldo si Puppeteer no está disponible
 * @param {string} html - HTML de la página
 * @param {string} guia - Número de guía
 * @returns {Object} Datos extraídos
 */
export function parseHTMLForGuiaData(html, guia) {
  // Implementación básica de parsing de HTML
  // En producción, Puppeteer será usado, pero esto sirve de respaldo
  
  const data = {
    guia,
    estado: 'Desconocido',
    ciudadOrigen: '',
    ciudadDestino: '',
    entregadoA: '',
    fechaEntrega: '',
  };

  try {
    // Buscar patrones comunes en el HTML
    
    // Estado
    const estadoMatch = html.match(/Estado[:\s]*([^<>\n]+)/i);
    if (estadoMatch) {
      data.estado = estadoMatch[1].trim();
    }

    // Ciudad Origen
    const origenMatch = html.match(/Origen[:\s]*([^<>\n]+)/i);
    if (origenMatch) {
      data.ciudadOrigen = origenMatch[1].trim();
    }

    // Ciudad Destino
    const destinoMatch = html.match(/Destino[:\s]*([^<>\n]+)/i);
    if (destinoMatch) {
      data.ciudadDestino = destinoMatch[1].trim();
    }

    // Entregado a
    const entregadoMatch = html.match(/Entregado a[:\s]*([^<>\n]+)/i);
    if (entregadoMatch) {
      data.entregadoA = entregadoMatch[1].trim();
    }

    // Fecha de entrega
    const fechaMatch = html.match(/Fecha[^<>\n]*entrega[:\s]*([^<>\n]+)/i);
    if (fechaMatch) {
      data.fechaEntrega = fechaMatch[1].trim();
    }

    return data;
  } catch (error) {
    console.error('Error al parsear HTML:', error);
    return data;
  }
}

/**
 * Valida que los datos extraídos sean correctos
 * @param {Object} data - Datos a validar
 * @returns {boolean} True si los datos son válidos
 */
export function validateScrapedData(data) {
  // Debe tener al menos el número de guía y un estado
  return (
    data &&
    data.guia &&
    data.estado &&
    data.estado !== 'Desconocido'
  );
}

/**
 * Limpia y normaliza los datos extraídos
 * @param {Object} data - Datos a limpiar
 * @returns {Object} Datos limpios
 */
export function cleanScrapedData(data) {
  return {
    guia: data.guia || '',
    estado: (data.estado || '').trim(),
    ciudadOrigen: (data.ciudadOrigen || '').trim(),
    ciudadDestino: (data.ciudadDestino || '').trim(),
    entregadoA: (data.entregadoA || '').trim(),
    fechaEntrega: (data.fechaEntrega || '').trim(),
  };
}

/**
 * Maneja errores de scraping y retorna un objeto de error estructurado
 * @param {Error} error - Error capturado
 * @param {string} guia - Número de guía que causó el error
 * @returns {Object} Objeto de error estructurado
 */
export function handleScrapingError(error, guia) {
  console.error(`Error en scraping de guía ${guia}:`, error);
  
  return {
    success: false,
    guia,
    error: error.message || 'Error desconocido en scraping',
    data: {
      guia,
      estado: 'Error al consultar',
      ciudadOrigen: '',
      ciudadDestino: '',
      entregadoA: '',
      fechaEntrega: '',
    },
  };
}
