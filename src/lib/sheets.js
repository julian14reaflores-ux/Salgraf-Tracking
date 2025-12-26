// src/lib/sheets.js
// Cliente para interactuar con Google Sheets API

import { google } from 'googleapis';
import {
  getCurrentEcuadorDateTime,
  generateGuiaId,
  addToHistorial,
  isFinalState
} from './utils.js';

/**
 * Inicializa y retorna el cliente de Google Sheets autenticado
 * @returns {Object} Cliente de Google Sheets
 */
function getGoogleSheetsClient() {
  // Validar que existan las variables necesarias
  if (!process.env.GOOGLE_CREDENTIALS_BASE64) {
    throw new Error('GOOGLE_CREDENTIALS_BASE64 no está configurado');
  }

  if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
    throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID no está configurado');
  }

  // Decodificar credenciales desde Base64
  const credentialsJson = Buffer.from(
    process.env.GOOGLE_CREDENTIALS_BASE64, 
    'base64'
  ).toString('utf-8');
  
  const credentials = JSON.parse(credentialsJson);

  // Configurar autenticación
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  // Crear cliente de Sheets
  const sheets = google.sheets({ version: 'v4', auth });

  return {
    sheets,
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    tabName: process.env.GOOGLE_SHEETS_TAB_NAME || 'Tracking',
  };
}

/**
 * Obtiene todas las guías de la hoja
 * @returns {Promise<Array>} Array de guías con sus datos
 */
export async function getAllGuias() {
  try {
    const { sheets, spreadsheetId, tabName } = getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}!A2:J`,
    });

    const rows = response.data.values || [];

    return rows.map((row, index) => ({
      rowIndex: index + 2,
      id: row[0] || '',
      guia: row[1] || '',
      fechaCarga: row[2] || '',
      estado: row[3] || '',
      ciudadOrigen: row[4] || '',
      ciudadDestino: row[5] || '',
      entregadoA: row[6] || '',
      fechaEntrega: row[7] || '',
      ultimaActualizacion: row[8] || '',
      historial: row[9] || '[]',
    }));
  } catch (error) {
    console.error('Error al obtener guías:', error);
    throw new Error(`No se pudo obtener las guías: ${error.message}`);
  }
}

/**
 * Busca una guía específica por su número
 * @param {string} numeroGuia - Número de guía a buscar
 * @returns {Promise<Object|null>} Datos de la guía o null si no existe
 */
export async function findGuia(numeroGuia) {
  try {
    const guias = await getAllGuias();
    return guias.find(g => g.guia === numeroGuia) || null;
  } catch (error) {
    console.error('Error al buscar guía:', error);
    throw error;
  }
}

/**
 * Agrega una nueva guía a la hoja
 * @param {Object} guiaData - Datos de la guía
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function addGuia(guiaData) {
  try {
    const { sheets, spreadsheetId, tabName } = getGoogleSheetsClient();

    const existingGuia = await findGuia(guiaData.guia);
    if (existingGuia) {
      return {
        success: false,
        message: 'La guía ya existe',
        guia: existingGuia,
      };
    }

    const currentDateTime = getCurrentEcuadorDateTime();
    const id = generateGuiaId(guiaData.guia);

    const historialInicial = addToHistorial('[]', {
      estado: guiaData.estado || 'Desconocido',
      ciudadOrigen: guiaData.ciudadOrigen || '',
      ciudadDestino: guiaData.ciudadDestino || '',
    });

    const values = [
      [
        id,
        guiaData.guia,
        currentDateTime,
        guiaData.estado || 'Desconocido',
        guiaData.ciudadOrigen || '',
        guiaData.ciudadDestino || '',
        guiaData.entregadoA || '',
        guiaData.fechaEntrega || '',
        currentDateTime,
        historialInicial,
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tabName}!A:J`,
      valueInputOption: 'RAW',
      resource: { values },
    });

    return {
      success: true,
      message: 'Guía agregada exitosamente',
      id,
    };
  } catch (error) {
    console.error('Error al agregar guía:', error);
    throw new Error(`No se pudo agregar la guía: ${error.message}`);
  }
}

/**
 * Actualiza una guía existente
 * @param {string} numeroGuia - Número de guía a actualizar
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function updateGuia(numeroGuia, updates) {
  try {
    const { sheets, spreadsheetId, tabName } = getGoogleSheetsClient();

    const guia = await findGuia(numeroGuia);
    if (!guia) {
      return {
        success: false,
        message: 'Guía no encontrada',
      };
    }

    const currentDateTime = getCurrentEcuadorDateTime();

    let nuevoHistorial = guia.historial;
    if (updates.estado && updates.estado !== guia.estado) {
      nuevoHistorial = addToHistorial(guia.historial, {
        estado: updates.estado,
        ciudadOrigen: updates.ciudadOrigen || guia.ciudadOrigen,
        ciudadDestino: updates.ciudadDestino || guia.ciudadDestino,
      });
    }

    const values = [
      [
        guia.id,
        guia.guia,
        guia.fechaCarga,
        updates.estado !== undefined ? updates.estado : guia.estado,
        updates.ciudadOrigen !== undefined ? updates.ciudadOrigen : guia.ciudadOrigen,
        updates.ciudadDestino !== undefined ? updates.ciudadDestino : guia.ciudadDestino,
        updates.entregadoA !== undefined ? updates.entregadoA : guia.entregadoA,
        updates.fechaEntrega !== undefined ? updates.fechaEntrega : guia.fechaEntrega,
        currentDateTime,
        nuevoHistorial,
      ],
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tabName}!A${guia.rowIndex}:J${guia.rowIndex}`,
      valueInputOption: 'RAW',
      resource: { values },
    });

    return {
      success: true,
      message: 'Guía actualizada exitosamente',
      updated: true,
    };
  } catch (error) {
    console.error('Error al actualizar guía:', error);
    throw new Error(`No se pudo actualizar la guía: ${error.message}`);
  }
}

/**
 * Agrega múltiples guías de una vez
 * @param {Array<Object>} guiasData - Array de datos de guías
 * @returns {Promise<Object>} Resultado de la operación con contadores
 */
export async function addMultipleGuias(guiasData) {
  const results = {
    success: true,
    added: 0,
    skipped: 0,
    errors: 0,
    details: [],
  };

  for (const guiaData of guiasData) {
    try {
      const result = await addGuia(guiaData);
      
      if (result.success) {
        results.added++;
        results.details.push({
          guia: guiaData.guia,
          status: 'added',
        });
      } else {
        results.skipped++;
        results.details.push({
          guia: guiaData.guia,
          status: 'skipped',
          reason: result.message,
        });
      }
    } catch (error) {
      results.errors++;
      results.details.push({
        guia: guiaData.guia,
        status: 'error',
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Actualiza el estado de guías que no están en estado final
 * @param {Array<Object>} updates - Array con actualizaciones
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function updatePendingGuias(updates) {
  const results = {
    success: true,
    updated: 0,
    skipped: 0,
    errors: 0,
    details: [],
  };

  for (const update of updates) {
    try {
      const guia = await findGuia(update.guia);
      
      if (!guia) {
        results.skipped++;
        results.details.push({
          guia: update.guia,
          status: 'skipped',
          reason: 'No encontrada',
        });
        continue;
      }

      if (isFinalState(guia.estado)) {
        results.skipped++;
        results.details.push({
          guia: update.guia,
          status: 'skipped',
          reason: 'Estado final',
        });
        continue;
      }

      const result = await updateGuia(update.guia, update.data);
      
      if (result.success) {
        results.updated++;
        results.details.push({
          guia: update.guia,
          status: 'updated',
        });
      }
    } catch (error) {
      results.errors++;
      results.details.push({
        guia: update.guia,
        status: 'error',
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Obtiene estadísticas de las guías
 * @returns {Promise<Object>} Estadísticas con contadores por estado
 */
export async function getGuiasStats() {
  try {
    const guias = await getAllGuias();

    const stats = {
      total: guias.length,
      porEstado: {},
      ultimaActualizacion: getCurrentEcuadorDateTime(),
    };

    guias.forEach(guia => {
      const estado = guia.estado || 'Desconocido';
      stats.porEstado[estado] = (stats.porEstado[estado] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
}

/**
 * Obtiene guías recién entregadas (últimas 24 horas)
 * @returns {Promise<Array>} Array de guías recién entregadas
 */
export async function getRecentlyDelivered() {
  try {
    const guias = await getAllGuias();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return guias.filter(guia => {
      if (!isFinalState(guia.estado)) return false;
      if (!guia.ultimaActualizacion) return false;

      try {
        const updateDate = new Date(guia.ultimaActualizacion);
        return updateDate >= oneDayAgo;
      } catch {
        return false;
      }
    });
  } catch (error) {
    console.error('Error al obtener guías recién entregadas:', error);
    throw error;
  }
}
