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

export default async function handler(req, res) {
  try {
    const { method } = req;
    const { action } = req.query;

    if (method === 'GET') {
      switch (action) {
        case 'all':
          const guias = await getAllGuias();
          return res.status(200).json({
            success: true,
            count: guias.length,
            guias,
          });

        case 'stats':
          const stats = await getGuiasStats();
          return res.status(200).json({
            success: true,
            stats,
          });

        case 'recent-delivered':
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

    if (method === 'POST') {
      const { guias, guia, updates } = req.body;

      switch (action) {
        case 'add':
          if (!guia) {
            return res.status(400).json({
              success: false,
              error: 'Falta el parámetro "guia"',
            });
          }

          const addResult = await addGuia(guia);
          return res.status(200).json(addResult);

        case 'add-multiple':
          if (!guias || !Array.isArray(guias)) {
            return res.status(400).json({
              success: false,
              error: 'Falta el parámetro "guias" (debe ser un array)',
            });
          }

          const addMultipleResult = await addMultipleGuias(guias);
          return res.status(200).json(addMultipleResult);

        case 'update':
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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
