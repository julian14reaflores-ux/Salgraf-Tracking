// src/pages/api/cron.js
// Endpoint para cron jobs (actualizaciones automáticas programadas)

import {
  getAllGuias,
  updatePendingGuias,
} from '../../lib/sheets.js';
import { isFinalState, getCurrentEcuadorDateTime, handleError } from '../../lib/utils.js';

function isValidCronRequest(req) {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  if (process.env.CRON_SECRET) {
    const cronSecret = req.headers['authorization'];
    return cronSecret === `Bearer ${process.env.CRON_SECRET}`;
  }
  
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido',
    });
  }

  if (!isValidCronRequest(req)) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
    });
  }

  const startTime = Date.now();
  const executionTime = getCurrentEcuadorDateTime();

  try {
    console.log(`[CRON] Iniciando actualización automática: ${executionTime}`);

    const todasLasGuias = await getAllGuias();
    console.log(`[CRON] Total de guías en el sistema: ${todasLasGuias.length}`);

    const guiasPendientes = todasLasGuias.filter(
      guia => !isFinalState(guia.estado)
    );

    console.log(`[CRON] Guías pendientes de actualización: ${guiasPendientes.length}`);

    if (guiasPendientes.length === 0) {
      const duration = Date.now() - startTime;
      console.log(`[CRON] No hay guías pendientes. Duración: ${duration}ms`);
      
      return res.status(200).json({
        success: true,
        message: 'No hay guías pendientes de actualización',
        executionTime,
        duration: `${duration}ms`,
        stats: {
          total: todasLasGuias.length,
          pending: 0,
          updated: 0,
        },
      });
    }

    const guiasParaScraping = guiasPendientes.map(g => g.guia);

    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    console.log(`[CRON] Iniciando scraping de ${guiasParaScraping.length} guías...`);
    
    const scrapingResponse = await fetch(`${baseUrl}/api/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guias: guiasParaScraping,
      }),
    });

    if (!scrapingResponse.ok) {
      throw new Error(`Error al hacer scraping: ${scrapingResponse.status}`);
    }

    const scrapingData = await scrapingResponse.json();
    console.log(`[CRON] Scraping completado: ${scrapingData.successful} exitosas, ${scrapingData.failed} fallidas`);

    const updates = scrapingData.results
      .filter(result => result.success && result.estado)
      .map(result => ({
        guia: result.guia,
        data: {
          estado: result.estado,
          ciudadOrigen: result.ciudadOrigen || '',
          ciudadDestino: result.ciudadDestino || '',
          entregadoA: result.entregadoA || '',
          fechaEntrega: result.fechaEntrega || '',
        },
      }));

    console.log(`[CRON] Actualizando ${updates.length} guías en Google Sheets...`);

    const updateResult = await updatePendingGuias(updates);
    console.log(
      `[CRON] Actualización completada: ${updateResult.updated} actualizadas, ` +
      `${updateResult.skipped} omitidas, ${updateResult.errors} errores`
    );

    const duration = Date.now() - startTime;
    console.log(`[CRON] Proceso completado exitosamente. Duración total: ${duration}ms`);

    return res.status(200).json({
      success: true,
      message: 'Actualización automática completada',
      executionTime,
      duration: `${duration}ms`,
      stats: {
        total: todasLasGuias.length,
        pending: guiasPendientes.length,
        scraped: scrapingData.successful,
        updated: updateResult.updated,
        skipped: updateResult.skipped,
        errors: updateResult.errors,
      },
      details: {
        scraping: {
          successful: scrapingData.successful,
          failed: scrapingData.failed,
        },
        updates: updateResult.details,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[CRON] Error en actualización automática (${duration}ms):`, error);
    
    return res.status(500).json({
      ...handleError(error, 'Cron job de actualización'),
      executionTime,
      duration: `${duration}ms`,
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: false,
  },
  maxDuration: 60,
};
