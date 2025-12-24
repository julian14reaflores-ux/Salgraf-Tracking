// src/pages/api/sheets.js
// Endpoint API para operaciones con Google Sheets

import {
  getAllGuias,
  addGuia,
  addMultipleGuias,
  updateGuia,
  getGuiasStats,
  getRecentlyDelivered,
} from '../../lib/sheets.js';
import { handleError } from '../../lib/utils.js';

/**
 * Handler principal del endpoint
 * Soporta diferentes operaciones según el método y parámetros
 */
export default async function handler(req, res) {
  try {
    const { method } = req;
    const { action } = req.query;

    // GET: Obtener datos
    if (method === 'GET') {
      switch (action) {
        case 'all':
          // Obtener todas las guías
          const guias = await getAllGuias();
          return res.status(200).json({
            success: true,
            count: guias.length,
            guias,
          });

        case 'stats':
          // Obtener estadísticas
          const stats = await getGuiasStats();
          return res.status(200).json({
            success: true,
            stats,
          });

        case 'recent-delivered':
          // Obtener guías recién entregadas
          const recentlyDelivered = await getRecentlyDelivered();
          return res.status(200).json({
            success: true,
            count: recentlyDelivered.length,
            guias: recentlyDelivered,
          });

        default:
          return res.status(400).json({
            success: false,
            error: 'Acción no válida. Usa: all, stats, o recent-delivered',
          });
      }
    }

    // POST: Agregar o actualizar datos
    if (method === 'POST') {
      const { guias, guia, updates } = req.body;

      switch (action) {
        case 'add':
          // Agregar una guía
          if (!guia) {
            return res.status(400).json({
              success: false,
              error: 'Falta el parámetro "guia"',
            });
          }

          const addResult = await addGuia(guia);
          return res.status(200).json(addResult);

        case 'add-multiple':
          // Agregar múltiples guías
          if (!guias || !Array.isArray(guias)) {
            return res.status(400).json({
              success: false,
              error: 'Falta el parámetro "guias" (debe ser un array)',
            });
          }

          const addMultipleResult = await addMultipleGuias(guias);
          return res.status(200).json(addMultipleResult);

        case 'update':
          // Actualizar una guía
          if (!guia || !updates) {
            return res.status(400).json({
              success: false,
              error: 'Faltan parámetros "guia" o "updates"',
            });
          }

          const updateResult = await updateGuia(guia, updates);
          return res.status(200).json(updateResult);

        default:
          return res.status(400).json({
            success: false,
            error: 'Acción no válida. Usa: add, add-multiple, o update',
          });
      }
    }

    // Método no soportado
    return res.status(405).json({
      success: false,
      error: `Método ${method} no permitido`,
    });
  } catch (error) {
    console.error('Error en endpoint de sheets:', error);
    return res.status(500).json(
      handleError(error, 'Operación con Google Sheets')
    );
  }
}

// Configuración para aumentar el límite de tamaño de body
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
