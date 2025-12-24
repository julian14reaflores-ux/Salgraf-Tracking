// src/components/Filters.js
// Componente para filtrar guías por diferentes criterios

import { useState, useEffect } from 'react';

export default function Filters({ guias, onFilter }) {
  const [filters, setFilters] = useState({
    estado: '',
    ciudadOrigen: '',
    ciudadDestino: '',
    fechaDesde: '',
    fechaHasta: '',
  });

  // Extraer valores únicos para los selectores
  const estados = [...new Set(guias.map(g => g.estado).filter(Boolean))];
  const ciudadesOrigen = [...new Set(guias.map(g => g.ciudadOrigen).filter(Boolean))];
  const ciudadesDestino = [...new Set(guias.map(g => g.ciudadDestino).filter(Boolean))];

  // Aplicar filtros cuando cambien
  useEffect(() => {
    const filtered = guias.filter(guia => {
      // Filtro por estado
      if (filters.estado && guia.estado !== filters.estado) {
        return false;
      }

      // Filtro por ciudad origen
      if (filters.ciudadOrigen && guia.ciudadOrigen !== filters.ciudadOrigen) {
        return false;
      }

      // Filtro por ciudad destino
      if (filters.ciudadDestino && guia.ciudadDestino !== filters.ciudadDestino) {
        return false;
      }

      // Filtro por fecha desde
      if (filters.fechaDesde && guia.fechaCarga) {
        const guiaDate = new Date(guia.fechaCarga);
        const filterDate = new Date(filters.fechaDesde);
        if (guiaDate < filterDate) {
          return false;
        }
      }

      // Filtro por fecha hasta
      if (filters.fechaHasta && guia.fechaCarga) {
        const guiaDate = new Date(guia.fechaCarga);
        const filterDate = new Date(filters.fechaHasta);
        if (guiaDate > filterDate) {
          return false;
        }
      }

      return true;
    });

    onFilter(filtered);
  }, [filters, guias, onFilter]);

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFilters({
      estado: '',
      ciudadOrigen: '',
      ciudadDestino: '',
      fechaDesde: '',
      fechaHasta: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>🔍 Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="btn btn-sm btn-outline"
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      <div style={styles.filtersGrid}>
        {/* Filtro por estado */}
        <div>
          <label htmlFor="filter-estado" style={styles.label}>
            Estado
          </label>
          <select
            id="filter-estado"
            className="select"
            value={filters.estado}
            onChange={(e) => handleChange('estado', e.target.value)}
          >
            <option value="">Todos los estados</option>
            {estados.map(estado => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por ciudad origen */}
        <div>
          <label htmlFor="filter-origen" style={styles.label}>
            Ciudad Origen
          </label>
          <select
            id="filter-origen"
            className="select"
            value={filters.ciudadOrigen}
            onChange={(e) => handleChange('ciudadOrigen', e.target.value)}
          >
            <option value="">Todas las ciudades</option>
            {ciudadesOrigen.map(ciudad => (
              <option key={ciudad} value={ciudad}>
                {ciudad}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por ciudad destino */}
        <div>
          <label htmlFor="filter-destino" style={styles.label}>
            Ciudad Destino
          </label>
          <select
            id="filter-destino"
            className="select"
            value={filters.ciudadDestino}
            onChange={(e) => handleChange('ciudadDestino', e.target.value)}
          >
            <option value="">Todas las ciudades</option>
            {ciudadesDestino.map(ciudad => (
              <option key={ciudad} value={ciudad}>
                {ciudad}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por fecha desde */}
        <div>
          <label htmlFor="filter-fecha-desde" style={styles.label}>
            Fecha Desde
          </label>
          <input
            id="filter-fecha-desde"
            type="date"
            className="input"
            value={filters.fechaDesde}
            onChange={(e) => handleChange('fechaDesde', e.target.value)}
          />
        </div>

        {/* Filtro por fecha hasta */}
        <div>
          <label htmlFor="filter-fecha-hasta" style={styles.label}>
            Fecha Hasta
          </label>
          <input
            id="filter-fecha-hasta"
            type="date"
            className="input"
            value={filters.fechaHasta}
            onChange={(e) => handleChange('fechaHasta', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    fontSize: '0.875rem',
  },
};
