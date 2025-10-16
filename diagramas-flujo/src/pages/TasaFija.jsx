// diagramas-flujo/src/pages/TasaFija.jsx
import React, { useState } from 'react';
import '../styles/simulacion.css';

function formNum(n, dec = 2) {
  const v = Number(n ?? 0);
  return v.toLocaleString('es-BO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function simularUnaFija({ anios, capitalInicial, tasa }) {
  // anios: entero >=1
  // tasa: ej. 0.035
  // Retorna capital final (K), interes total (R)
  let K = capitalInicial;
  let R = 0;

  for (let c = 0; c < anios; c++) {
    const J = K * tasa; // interés del ciclo
    R += J;
    K += J;
  }
  return { Kfinal: K, interesTotal: R };
}

export default function TasaFija() {
  // Parámetros
  const [anios, setAnios] = useState(10);
  const [tasa, setTasa] = useState(0.035); // 3.5% por año
  const [capitalInicial, setCapitalInicial] = useState(10000);

  // Rango de capital (para aleatorizar cada simulación)
  const [usarRango, setUsarRango] = useState(false);
  const [capitalMin, setCapitalMin] = useState(8000);
  const [capitalMax, setCapitalMax] = useState(15000);

  const [resultados, setResultados] = useState(null);
  const [error, setError] = useState('');

  function validar() {
    if (anios < 1) return 'Los años deben ser ≥ 1.';
    if (tasa < 0) return 'La tasa no puede ser negativa.';
    if (usarRango) {
      if (capitalMin <= 0 || capitalMax <= 0) return 'El capital en rango debe ser > 0.';
      if (capitalMin > capitalMax) return 'capital mínimo no puede ser mayor que el máximo.';
    } else {
      if (capitalInicial <= 0) return 'El capital inicial debe ser > 0.';
    }
    return '';
  }

  function limpiar() {
    setResultados(null);
    setError('');
  }

  function simular() {
    const msg = validar();
    if (msg) { setError(msg); setResultados(null); return; }
    setError('');

    // Capital inicial usado (si hay rango, se toma UNA vez)
    let capital = usarRango
      ? (capitalMin + Math.random() * (capitalMax - capitalMin))
      : capitalInicial;

    const capitalInicialUsado = capital;
    const filas = [];
    let sumaIntereses = 0;

    for (let year = 1; year <= Math.floor(anios); year++) {
      const interes = capital * Number(tasa);
      sumaIntereses += interes;
      capital += interes; // capital acumulado al final del año

      filas.push({
        anio: year,
        interes,
        capitalAcum: capital,
      });
    }

    const resumen = {
      capitalInicial: capitalInicialUsado,
      sumaIntereses,
      capitalFinal: capital,
    };

    setResultados({ filas, resumen });
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Simulación — Interés de Tasa Fija</h1>
      </header>

      <main className="content problema-section">
        <h2 className="subtitulo">Parámetros y Resultados</h2>

        <div className="columnas">
          <section className="columna-izquierda">
            <div className="card">
              <h3>Configuración</h3>


              <div className="input-group">
                <label>Años (T)</label>
                <input
                  type="number"
                  min="1"
                  value={anios}
                  onChange={(e) => setAnios(parseInt(e.target.value || '0', 10))}
                />
              </div>

              <div className="input-group">
                <label>Tasa fija (i) — ej. 0.035 para 3.5%</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={tasa}
                  onChange={(e) => setTasa(parseFloat(e.target.value || '0'))}
                />
              </div>

              <div className="parametros-section">
                <h4>Capital inicial</h4>

                <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="checkbox"
                    checked={usarRango}
                    onChange={(e) => setUsarRango(e.target.checked)}
                    style={{ width: 18, height: 18 }}
                  />
                  <label style={{ margin: 0 }}>Usar rango aleatorio por simulación</label>
                </div>

                {!usarRango ? (
                  <div className="input-group">
                    <label>Capital inicial (Bs)</label>
                    <input
                      type="number"
                      min="1"
                      value={capitalInicial}
                      onChange={(e) => setCapitalInicial(parseFloat(e.target.value || '0'))}
                    />
                  </div>
                ) : (
                  <>
                    <div className="input-group">
                      <label>Capital mínimo (Bs)</label>
                      <input
                        type="number"
                        min="1"
                        value={capitalMin}
                        onChange={(e) => setCapitalMin(parseFloat(e.target.value || '0'))}
                      />
                    </div>
                    <div className="input-group">
                      <label>Capital máximo (Bs)</label>
                      <input
                        type="number"
                        min="1"
                        value={capitalMax}
                        onChange={(e) => setCapitalMax(parseFloat(e.target.value || '0'))}
                      />
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-simular" onClick={simular}>Simular</button>
                <button className="btn-simular btn-secundario" onClick={limpiar}>
                    Limpiar
                  </button>
              </div>

              {error && (
                <div style={{ marginTop: 12, color: '#b00020', fontWeight: 600 }}>
                  {error}
                </div>
              )}
            </div>
          </section>

          <section className="columna-derecha">
            <div className="card">
              <h3>Resultados</h3>

              <h3>Resultados</h3>

              <div className="tabla-container" style={{ marginTop: 10, maxHeight: '500px', overflowY: 'auto' }}>
                <table className="tabla-resultados">
                  <thead>
                    <tr>
                      <th>Año</th>
                      <th className="num">Interés</th>
                      <th className="num">Capital acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!resultados ? (
                      <tr>
                        <td colSpan={3} className="sin-datos" style={{ textAlign: 'center' }}>
                          Ejecuta la simulación para ver los resultados
                        </td>
                      </tr>
                    ) : (
                      resultados.filas.map((r) => (
                        <tr key={r.anio}>
                          <td>{r.anio}</td>
                          <td className="num">{formNum(r.interes)}</td>
                          <td className="num">{formNum(r.capitalAcum)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {resultados?.resumen && (
                <div className="estadisticas" style={{ marginTop: 16 }}>
                  <h4>Resumen</h4>
                  <div className="estadisticas-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className="stat-item">
                      <span className="stat-label">Capital inicial</span>
                      <span className="stat-value">Bs {formNum(resultados.resumen.capitalInicial)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Suma de intereses</span>
                      <span className="stat-value">Bs {formNum(resultados.resumen.sumaIntereses)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Capital final</span>
                      <span className="stat-value">Bs {formNum(resultados.resumen.capitalFinal)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}