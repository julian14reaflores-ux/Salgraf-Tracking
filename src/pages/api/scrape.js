// src/pages/api/scrape.js
// Endpoint API para realizar web scraping de guías usando Playwright

import { chromium } from 'playwright-core';
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
 * Obtiene el navegador configurado
 * @returns {Promise<Object>} Navegador de Playwright
 */
async function getBrowser() {
  try {
    return await chromium.launch({
      headless: true,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
      ],
    });
  } catch (error) {
    console.error('Error al lanzar navegador:', error);
    throw new Error('No se pudo inicializar el navegador');
  }
}

/**
 * Realiza scraping de una guía específica
 */
async function scrapeGuia(guia, browser) {
  const url = buildTrackingUrl(guia);
  let page;

  try {
    page = await browser.newPage();
    
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    console.log(`Navegando a: ${url}`);
    
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    const data = await page.evaluate(() => {
      const findText = (selectors) => {
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            return element.textContent.trim();
          }
        }
        return '';
      };

      const findInTable = (labelText) => {
        const rows = document.querySelectorAll('tr, .row');
        for (const row of rows) {
          const text = row.textContent;
          if (text.toLowerCase().includes(labelText.toLowerCase())) {
            const cells = row.querySelectorAll('td, .cell, span, div');
            if (cells.length > 1) {
              return cells[cells.length - 1].textContent.trim();
            }
          }
        }
        return '';
      };

      let estado = findText(['.estado', '#estado', '[class*="estado"]']);
      if (!estado) estado = findInTable('estado');

      let ciudadOrigen = findText(['.origen', '[class*="origen"]']);
      if (!ciudadOrigen) ciudadOrigen = findInTable('origen');

      let ciudadDestino = findText(['.destino', '[class*="destino"]']);
      if (!ciudadDestino) ciudadDestino = findInTable('destino');

      let entregadoA = findText(['.receptor', '[class*="entregado"]']);
      if (!entregadoA) entregadoA = findInTable('entregado');

      let fechaEntrega = findText(['.fecha-entrega', '[class*="fecha"]']);
      if (!fechaEntrega) fechaEntrega = findInTable('fecha');

      if (!estado) {
        const bodyText = document.body.textContent;
        const match = bodyText.match(/Estado[:\s]*([^\n<>]+)/i);
        if (match) estado = match[1].trim();
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
    return { guia, ...data };
  } catch (error) {
    if (page) {
      try {
        await page.close();
      } catch (e) {}
    }
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido. Usa POST.',
    });
  }

  let browser;

  try {
    const { guias } = req.body;

    if (!guias || !Array.isArray(guias) || guias.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Debes proporcionar un array de guías',
      });
    }

    const guiasLimpias = guias.map(cleanGuia).filter(isValidGuia);

    if (guiasLimpias.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron guías válidas',
      });
    }

    console.log(`Iniciando scraping de ${guiasLimpias.length} guías...`);

    browser = await getBrowser();
    const results = [];
    const delayMs = getScrapingDelay();

    for (let i = 0; i < guiasLimpias.length; i++) {
      const guia = guiasLimpias[i];
      
      try {
        console.log(`Scraping ${i + 1}/${guiasLimpias.length}: ${guia}`);
        const data = await scrapeGuia(guia, browser);
        const cleanData = cleanScrapedData(data);
        
        results.push({ success: true, ...cleanData });

        if (i < guiasLimpias.length - 1) {
          await delay(delayMs);
        }
      } catch (error) {
        console.error(`Error en scraping de ${guia}:`, error);
        results.push(handleScrapingError(error, guia));
      }
    }

    await browser.close();

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
    
    if (browser) {
      try {
        await browser.close();
      } catch (e) {}
    }

    return res.status(500).json(handleError(error, 'Scraping de guías'));
  }
}
