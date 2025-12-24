// src/components/Dashboard.js
// Componente principal del dashboard que integra todos los demás

import { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import LoadGuias from './LoadGuias';
import Filters from './Filters';
import GuiaTable from './GuiaTable';

export default function Dashboard() {
  const [guias, setGuias] = useState([]);
  const [filteredGuias, setFilteredGuias] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentDelivered, setRecentDelivered] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadGuias();
    loadStats();
    checkRecentDelivered();
  }, []);

  // Cargar todas las guías
  const loadGuias = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sheets?action=all');
      const data = await response.json();

      if (data.success) {
        setGuias(data.guias);
        setFilteredGuias(data.guias);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error al cargar las guías');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await fetch('/api/sheets?action=stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  // Verificar guías recién entregadas
  const checkRecentDelivered = async () => {
    try {
      const response = await fetch('/api/sheets?action=recent-delivered');
      const data = await response.json();

      if (data.success) {
        setRecentDelivered(data.count);
      }
    } catch (err) {
      console.error('Error al verificar entregas recientes:', err);
    }
  };

  // Manejar carga de nuevas guías
  const handleLoadGuias = async (nuevasGuias) => {
    setLoading(true);
    setError(null);

    try {
      // Hacer scraping de las guías
      const scrapingResponse = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guias: nuevasGuias }),
      });

      const scrapingData = await scrapingResponse.json();

      if (!scrapingData.success) {
        throw new Error(scrapingData.error || 'Error en el scraping');
      }

      // Preparar datos para Google Sheets
      const guiasParaAgregar = scrapingData.results
        .filter(r => r.success)
        .map(r => ({
          guia: r.guia,
          estado: r.estado,
          ciudadOrigen: r.ciudadOrigen,
          ciudadDestino: r.ciudadDestino,
          entregadoA: r.entregadoA,
          fechaEntrega: r.fechaEntrega,
        }));

      // Guardar en Google Sheets
      const sheetsResponse = await fetch('/api/sheets?action=add-multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guias: guiasParaAgregar }),
      });

      const sheetsData = await sheetsResponse.json();

      if (!sheetsData.success) {
        throw new Error(sheetsData.error || 'Error al guardar en Google Sheets');
      }

      // Recargar datos
      await loadGuias();
      await loadStats();

      return sheetsData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar una guía específica
  const handleUpdateGuia = async (numeroGuia) => {
    setError(null);

    try {
      // Hacer scraping de la guía
      const scrapingResponse = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guias: [numeroGuia] }),
      });

      const scrapingData = await scrapingResponse.json();

      if (!scrapingData.success || scrapingData.results.length === 0) {
        throw new Error('Error al consultar el estado de la guía');
      }

      const result = scrapingData.results[0];

      if (!result.success) {
        throw new Error(result.error || 'No se pudo obtener el estado');
      }

      // Actualizar en Google Sheets
      const sheetsResponse = await fetch('/api/sheets?action=update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guia: numeroGuia,
          updates: {
            estado: result.estado,
            ciudadOrigen: result.ciudadOrigen,
            ciudadDestino: result.ciudadDestino,
            entregadoA: result.entregadoA,
            fechaEntrega: result.fechaEntrega,
          },
        }),
      });

      const sheetsData = await sheetsResponse.json();

      if (!sheetsData.success) {
        throw new Error(sheetsData.error || 'Error al actualizar en Google Sheets');
      }

      // Recargar datos
      await loadGuias();
      await loadStats();
      await checkRecentDelivered();
    } catch (err) {
      setError(err.message);
      console.error('Error al actualizar guía:', err);
    }
  };

  // Manejar filtrado
  const handleFilter = useCallback((filtered) => {
    setFilteredGuias(filtered);
  }, []);

  return (
    <div>
      <Header stats={stats} recentDelivered={recentDelivered} />

      <div className="container">
        {error && (
          <div className="alert alert-error animate-fade-in" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Sección de carga */}
        <div style={{ marginBottom: '2rem' }}>
          <LoadGuias
            onLoad={handleLoadGuias}
            maxGuias={parseInt(process.env.NEXT_PUBLIC_MAX_GUIAS_PER_BATCH || '50', 10)}
          />
        </div>

        {/* Sección de filtros */}
        {guias.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <Filters guias={guias} onFilter={handleFilter} />
          </div>
        )}

        {/* Tabla de guías */}
        <div style={{ marginBottom: '2rem' }}>
          {loading && guias.length === 0 ? (
            <div className="card">
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <span className="loading" style={{ width: '3rem', height: '3rem' }}></span>
                <p style={{ marginTop: '1rem' }}>Cargando guías...</p>
              </div>
            </div>
          ) : (
            <GuiaTable guias={filteredGuias} onUpdate={handleUpdateGuia} />
          )}
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <div className="container">
            <p style={styles.footerText}>
              © 2024 LAAR Courier - Sistema de Tracking
            </p>
            <p style={styles.footerSubtext}>
              Actualizaciones automáticas a las 10:00, 13:00 y 16:00
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  footer: {
    marginTop: '4rem',
    padding: '2rem 0',
    borderTop: '2px solid #E5E7EB',
    textAlign: 'center',
  },
  footerText: {
    margin: 0,
    fontWeight: '600',
    color: '#000000',
  },
  footerSubtext: {
    margin: '0.5rem 0 0 0',
    fontSize: '0.875rem',
    color: '#6B7280',
  },
};
