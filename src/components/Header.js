// src/components/Header.js
// Componente del encabezado con contadores por estado y alertas

import { useEffect, useState } from 'react';

export default function Header({ stats, recentDelivered = 0 }) {
  const [showAlert, setShowAlert] = useState(false);

  // Mostrar alerta cuando hay guías recién entregadas
  useEffect(() => {
    if (recentDelivered > 0) {
      setShowAlert(true);
      
      // Auto-ocultar después de 5 segundos
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [recentDelivered]);

  return (
    <header style={styles.header}>
      <div className="container">
        {/* Logo y título */}
        <div style={styles.titleSection}>
          <h1 style={styles.title}>
            🚚 Sistema de Tracking LAAR Courier
          </h1>
          <p style={styles.subtitle}>
            Seguimiento en tiempo real de tus envíos
          </p>
        </div>

        {/* Alerta de guías recién entregadas */}
        {showAlert && recentDelivered > 0 && (
          <div style={styles.alertContainer} className="animate-fade-in">
            <div style={styles.alert}>
              <span style={styles.alertIcon}>✅</span>
              <div>
                <strong>¡Nuevas entregas!</strong>
                <p style={styles.alertText}>
                  {recentDelivered} guía{recentDelivered > 1 ? 's han' : ' ha'} sido entregada{recentDelivered > 1 ? 's' : ''} recientemente.
                </p>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                style={styles.closeButton}
                aria-label="Cerrar alerta"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Contadores de estado */}
        {stats && (
          <div style={styles.statsContainer}>
            <div style={styles.statsGrid}>
              {/* Total */}
              <div style={styles.statCard}>
                <div style={styles.statIcon}>📦</div>
                <div>
                  <div style={styles.statValue}>{stats.total || 0}</div>
                  <div style={styles.statLabel}>Total Guías</div>
                </div>
              </div>

              {/* Contadores por estado */}
              {stats.porEstado && Object.entries(stats.porEstado).map(([estado, cantidad]) => {
                const config = getEstadoConfig(estado);
                return (
                  <div key={estado} style={styles.statCard}>
                    <div style={{ ...styles.statIcon, ...config.style }}>
                      {config.icon}
                    </div>
                    <div>
                      <div style={styles.statValue}>{cantidad}</div>
                      <div style={styles.statLabel}>{estado}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Última actualización */}
            {stats.ultimaActualizacion && (
              <div style={styles.lastUpdate}>
                Última actualización: {stats.ultimaActualizacion}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

/**
 * Obtiene la configuración visual de cada estado
 */
function getEstadoConfig(estado) {
  const estadoLower = estado.toLowerCase();

  if (estadoLower.includes('entregado')) {
    return {
      icon: '✅',
      style: { backgroundColor: '#D1FAE5', color: '#065F46' },
    };
  }

  if (estadoLower.includes('tránsito') || estadoLower.includes('transito')) {
    return {
      icon: '🚛',
      style: { backgroundColor: '#DBEAFE', color: '#1E40AF' },
    };
  }

  if (estadoLower.includes('origen') || estadoLower.includes('bodega')) {
    return {
      icon: '📍',
      style: { backgroundColor: '#FEF3C7', color: '#92400E' },
    };
  }

  if (estadoLower.includes('devolución') || estadoLower.includes('devolucion')) {
    return {
      icon: '↩️',
      style: { backgroundColor: '#FFEDD5', color: '#9A3412' },
    };
  }

  if (estadoLower.includes('siniestro')) {
    return {
      icon: '⚠️',
      style: { backgroundColor: '#FEE2E2', color: '#991B1B' },
    };
  }

  if (estadoLower.includes('novedad')) {
    return {
      icon: '📌',
      style: { backgroundColor: '#EDE9FE', color: '#5B21B6' },
    };
  }

  return {
    icon: '📋',
    style: { backgroundColor: '#F3F4F6', color: '#374151' },
  };
}

const styles = {
  header: {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    padding: '2rem 0',
    borderBottom: '4px solid #FFD700',
    marginBottom: '2rem',
  },
  titleSection: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    margin: '0 0 0.5rem 0',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: '#FFD700',
    margin: 0,
  },
  alertContainer: {
    marginBottom: '1.5rem',
  },
  alert: {
    backgroundColor: '#FFD700',
    color: '#000000',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  alertIcon: {
    fontSize: '2rem',
  },
  alertText: {
    margin: 0,
    fontSize: '0.875rem',
  },
  closeButton: {
    marginLeft: 'auto',
    background: 'transparent',
    border: 'none',
    color: '#000000',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0 0.5rem',
    lineHeight: 1,
  },
  statsContainer: {
    marginTop: '1rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
  },
  statCard: {
    backgroundColor: '#1F2937',
    borderRadius: '0.75rem',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    border: '2px solid #374151',
    transition: 'all 0.15s ease-in-out',
    cursor: 'default',
  },
  statIcon: {
    fontSize: '2rem',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '3rem',
    minHeight: '3rem',
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 1,
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  lastUpdate: {
    marginTop: '1rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#9CA3AF',
  },
};
