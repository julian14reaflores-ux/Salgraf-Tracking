// src/components/GuiaTable.js
// Componente de tabla para mostrar guías con sus datos

import { useState } from 'react';

export default function GuiaTable({ guias, onUpdate }) {
  const [updating, setUpdating] = useState({});

  const handleUpdate = async (guia) => {
    setUpdating(prev => ({ ...prev, [guia]: true }));
    
    try {
      await onUpdate(guia);
    } finally {
      setUpdating(prev => ({ ...prev, [guia]: false }));
    }
  };

  const getEstadoBadge = (estado) => {
    if (!estado) return 'badge-gray';
    
    const estadoLower = estado.toLowerCase();
    
    if (estadoLower.includes('entregado')) return 'badge-green';
    if (estadoLower.includes('tránsito') || estadoLower.includes('transito')) return 'badge-blue';
    if (estadoLower.includes('origen') || estadoLower.includes('bodega')) return 'badge-yellow';
    if (estadoLower.includes('devolución') || estadoLower.includes('devolucion')) return 'badge-orange';
    if (estadoLower.includes('siniestro')) return 'badge-red';
    if (estadoLower.includes('novedad')) return 'badge-purple';
    
    return 'badge-gray';
  };

  const needsUpdate = (estado) => {
    if (!estado) return true;
    const estadoLower = estado.toLowerCase();
    return !(
      estadoLower.includes('entregado') ||
      estadoLower.includes('devolución/entrega') ||
      estadoLower.includes('devolucion/entrega') ||
      estadoLower.includes('siniestro/entrega')
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-EC', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (!guias || guias.length === 0) {
    return (
      <div className="card">
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📦</div>
          <h3>No hay guías para mostrar</h3>
          <p style={{ color: '#6B7280' }}>
            Carga algunas guías para comenzar a hacer seguimiento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Guía</th>
            <th>Estado</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Entregado A</th>
            <th>Fecha Entrega</th>
            <th>Última Actualización</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {guias.map((guia) => (
            <tr key={guia.id || guia.guia}>
              <td style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                {guia.guia}
              </td>
              <td>
                <span className={`badge ${getEstadoBadge(guia.estado)}`}>
                  {guia.estado || 'Desconocido'}
                </span>
              </td>
              <td>{guia.ciudadOrigen || '-'}</td>
              <td>{guia.ciudadDestino || '-'}</td>
              <td>{guia.entregadoA || '-'}</td>
              <td>{formatDate(guia.fechaEntrega)}</td>
              <td style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                {formatDate(guia.ultimaActualizacion)}
              </td>
              <td>
                {needsUpdate(guia.estado) ? (
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleUpdate(guia.guia)}
                    disabled={updating[guia.guia]}
                  >
                    {updating[guia.guia] ? (
                      <>
                        <span className="loading"></span>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        🔄 Actualizar
                      </>
                    )}
                  </button>
                ) : (
                  <span style={{ fontSize: '0.875rem', color: '#10B981' }}>
                    ✓ Finalizado
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={styles.tableFooter}>
        Mostrando {guias.length} guía{guias.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

const styles = {
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  tableFooter: {
    padding: '1rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#6B7280',
    borderTop: '2px solid #E5E7EB',
  },
};
