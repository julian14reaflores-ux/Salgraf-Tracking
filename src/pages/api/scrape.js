// src/pages/api/scrape.js
// Endpoint API para realizar web scraping de guías

import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import {
  buildTrackingUrl,
  isValidGuia,
  cleanGuia,
  handleError,
  delay,
  getScrapingDelay,
} from '../../lib/utils.js';
import {
  cleanScrapedData,
  handleScrapingError,
} from '../../lib/scraper.js';

/**
 * Obtiene el navegador configurado según el entorno
 * @returns {Promise<Object>} Navegador de Puppeteer
 */
async function getBrowser() {
  if (process.env.VERCEL) {
    // En producción (Vercel), usar chrome-aws-lambda
    return await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  } else {
    // En desarrollo local, usar Puppeteer regular
    return await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
}

/**
 * Realiza scraping de una guía específica
 * @param {string} guia - Número de guía
 * @param {Object} browser - Navegador de Puppeteer
 * @returns {Promise<Object>} Datos extraídos
 */
async function scrapeGuia(guia, browser) {
  const url = buildTrackingUrl(guia);
  let page;

  try {
    page = await browser.newPage();
    
    // Configurar timeout y user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    console.log(`Navegando a: ${url}`);
    
    // Navegar a la página
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Esperar a que la página cargue (ajustar selector según la estructura real)
    await page.waitForTimeout(2000);

    // Extraer datos de la página
    const data = await page.evaluate(() => {
      // Función auxiliar para buscar texto en múltiples selectores
      const findText = (selectors) => {
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            return element.textContent.trim();
          }
        }
        return '';
      };

      // Función auxiliar para buscar en tabla
      const findInTable = (labelText) => {
        const rows = document.querySelectorAll('tr, .row');
        for (const row of rows) {
          const text = row.textContent;
          if (text.toLowerCase().includes(labelText.toLowerCase())) {
            // Buscar el valor en la siguiente celda o elemento
            const cells = row.querySelectorAll('td, .cell, span, div');
            if (cells.length > 1) {
              return cells[cells.length - 1].textContent.trim();
            }
          }
        }
        return '';
      };

      // Buscar estado
      let estado = findText([
        '.estado',
        '#estado',
        '[class*="estado"]',
        '[id*="estado"]',
      ]);
      
      if (!estado) {
        estado = findInTable('estado');
      }

      // Buscar ciudad origen
      let ciudadOrigen = findText([
        '.origen',
        '#origen',
        '[class*="origen"]',
        '.ciudad-origen',
      ]);
      
      if (!ciudadOrigen) {
        ciudadOrigen = findInTable('origen');
      }

      // Buscar ciudad destino
      let ciudadDestino = findText([
        '.destino',
        '#destino',
        '[class*="destino"]',
        '.ciudad-destino',
      ]);
      
      if (!ciudadDestino) {
        ciudadDestino = findInTable('destino');
      }

      // Buscar entregado a
      let entregadoA = findText([
        '.receptor',
        '[class*="entregado"]',
        '[class*="receptor"]',
      ]);
      
      if (!entregadoA) {
        entregadoA = findInTable('entregado');
        if (!entregadoA) {
          entregadoA = findInTable('recibido');
        }
      }

      // Buscar fecha de entrega
      let fechaEntrega = findText([
        '.fecha-entrega',
        '[class*="fecha"]',
      ]);
      
      if (!fechaEntrega) {
        fechaEntrega = findInTable('fecha');
      }

      // Si no encontramos estado, buscar en todo el contenido visible
      if (!estado) {
        const bodyText = document.body.textContent;
        
        // Patrones comunes de estados
        const estadoPatterns = [
          /Estado[:\s]*([^\n<>]+)/i,
          /Status[:\s]*([^\n<>]+)/i,
        ];
        
        for (const pattern of estadoPatterns) {
          const match = bodyText.match(pattern);
          if (match && match[1]) {
            estado = match[1].trim();
            break;
          }
        }
      }

      return {
        estado: estado || 'No disponible',
        ciudadOrigen: ciudadOrigen || '',
        ciudadDestino: ciudadDestino || '',
        entregadoA: entregadoA || '',
        fechaEntrega: fechaEntrega || '',
      };
    });

    await page.close();

    return {
      guia,
      ...data,
    };
  } catch (error) {
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        console.error('Error al cerrar página:', closeError);
      }
    }
    throw error;
  }
}

/**
 * Handler principal del endpoint
 */
export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido. Usa POST.',
    });
  }

  let browser;

  try {
    const { guias } = req.body;

    // Validar entrada
    if (!guias || !Array.isArray(guias) || guias.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Debes proporcionar un array de guías',
      });
    }

    // Limpiar y validar guías
    const guiasLimpias = guias
      .map(cleanGuia)
      .filter(isValidGuia);

    if (guiasLimpias.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron guías válidas',
      });
    }

    console.log(`Iniciando scraping de ${guiasLimpias.length} guías...`);

    // Inicializar navegador
    browser = await getBrowser();

    // Realizar scraping de cada guía con delay
    const results = [];
    const delayMs = getScrapingDelay();

    for (let i = 0; i < guiasLimpias.length; i++) {
      const guia = guiasLimpias[i];
      
      try {
        console.log(`Scraping ${i + 1}/${guiasLimpias.length}: ${guia}`);
        
        const data = await scrapeGuia(guia, browser);
        const cleanData = cleanScrapedData(data);
        
        results.push({
          success: true,
          ...cleanData,
        });

        // Delay entre peticiones (excepto en la última)
        if (i < guiasLimpias.length - 1) {
          await delay(delayMs);
        }
      } catch (error) {
        console.error(`Error en scraping de ${guia}:`, error);
        results.push(handleScrapingError(error, guia));
      }
    }

    // Cerrar navegador
    await browser.close();

    // Calcular estadísticas
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    return res.status(200).json({
      success: true,
      message: `Scraping completado: ${successful} exitosas, ${failed} fallidas`,
      total: results.length,
      successful,
      failed,
      results,
    });
  } catch (error) {
    console.error('Error en endpoint de scraping:', error);
    
    // Intentar cerrar el navegador si está abierto
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error al cerrar navegador:', closeError);
      }
    }

    return res.status(500).json(
      handleError(error, 'Scraping de guías')
    );
  }
}
