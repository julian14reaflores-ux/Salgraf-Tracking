// src/pages/api/update-status.js
// Endpoint API para actualizar el estado de guías no finalizadas

import {
  getAllGuias,
  updatePendingGuias,
} from '../../lib/sheets.js';
import { isFinalState, handleError } from '../../lib/utils.js';

/**
 * Handler principal del endpoint
 * Actualiza todas las guías que no están en estado final
 */
export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido. Usa POST.',
    });
  }

  try {
    console.log('Iniciando actualización de estados...');

    // Obtener todas las guías
    const todasLasGuias = await getAllGuias();
    console.log(`Total de guías: ${todasLasGuias.length}`);

    // Filtrar guías que no están en estado final
    const guiasPendientes = todasLasGuias.filter(
      guia => !isFinalState(guia.estado)
    );

    console.log(`Guías pendientes de actualización: ${guiasPendientes.length}`);

    if (guiasPendientes.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No hay guías pendientes de actualización',
        updated: 0,
        total: todasLasGuias.length,
      });
    }

    // Preparar lista de guías para hacer scraping
    const guiasParaScraping = guiasPendientes.map(g => g.guia);

    // Llamar al endpoint de scraping
    const scrapingResponse = await fetch(
      `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/scrape`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guias: guiasParaScraping,
        }),
      }
    );

    if (!scrapingResponse.ok) {
      throw new Error('Error al hacer scraping de guías');
    }

    const scrapingData = await scrapingResponse.json();
    console.log(`Scraping completado: ${scrapingData.successful} exitosas`);

    // Preparar actualizaciones para Google Sheets
    const updates = scrapingData.results
      .filter(result => result.success)
      .map(result => ({
        guia: result.guia,
        data: {
          estado: result.estado,
          ciudadOrigen: result.ciudadOrigen,
          ciudadDestino: result.ciudadDestino,
          entregadoA: result.entregadoA,
          fechaEntrega: result.fechaEntrega,
        },
      }));

    // Actualizar en Google Sheets
    const updateResult = await updatePendingGuias(updates);
    console.log(`Actualización completada: ${updateResult.updated} guías actualizadas`);

    return res.status(200).json({
      success: true,
      message: 'Actualización completada',
      total: guiasPendientes.length,
      scraped: scrapingData.successful,
      updated: updateResult.updated,
      skipped: updateResult.skipped,
      errors: updateResult.errors,
      details: updateResult.details,
    });
  } catch (error) {
    console.error('Error en actualización de estados:', error);
    return res.status(500).json(
      handleError(error, 'Actualización de estados')
    );
  }
}

// Configuración para aumentar el timeout (actualizaciones pueden tardar)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: false,
  },
  maxDuration: 60, // 60 segundos máximo
};
