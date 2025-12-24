// src/components/LoadGuias.js
// Componente para cargar guías de manera masiva

import { useState } from 'react';

export default function LoadGuias({ onLoad, maxGuias = 50 }) {
  const [guiasText, setGuiasText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!guiasText.trim()) {
      setError('Por favor, ingresa al menos una guía');
      return;
    }

    // Parsear guías
    const guias = guiasText
      .split(',')
      .map(g => g.trim().toUpperCase())
      .filter(g => g);

    if (guias.length === 0) {
      setError('No se encontraron guías válidas');
      return;
    }

    if (guias.length > maxGuias) {
      setError(`Máximo ${maxGuias} guías por carga. Tienes ${guias.length}.`);
      return;
    }

    setLoading(true);

    try {
      await onLoad(guias);
      setSuccess(`${guias.length} guía(s) cargada(s) exitosamente`);
      setGuiasText('');
    } catch (err) {
      setError(err.message || 'Error al cargar las guías');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem' }}>📋 Cargar Guías</h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="guias" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Números de Guía (separados por comas)
          </label>
          <textarea
            id="guias"
            className="input textarea"
            placeholder="Ejemplo: LC51960903, LC51960904, LC51960905"
            value={guiasText}
            onChange={(e) => setGuiasText(e.target.value)}
            disabled={loading}
            rows={4}
          />
          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem' }}>
            Límite: {maxGuias} guías por carga
          </p>
        </div>

        {error && (
          <div className="alert alert-error animate-fade-in">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success animate-fade-in">
            {success}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? (
            <>
              <span className="loading"></span>
              Cargando...
            </>
          ) : (
            <>
              ⬆️ Cargar Guías
            </>
          )}
        </button>
      </form>
    </div>
  );
}
