// diagramas-flujo/src/pages/TasaVariable.jsx
import React, { useState } from 'react';
import '../styles/simulacion.css';

function fmt(n, dec = 2) {
  const v = Number(n ?? 0);
  return v.toLocaleString('es-BO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

/**
 * Devuelve la tasa que corresponde al capital actual según las reglas declaradas.
 * Reglas:
 *  - Rango 1:  [min1, max1]       -> tasa1
 *  - Rango 2:  (max1, max2]       -> tasa2
 *  - Rango 3:  > max2              -> tasa3
 */
function tasaSegunCapital(capital, reglas) {
  const { min1, max1, max2, tasa1, tasa2, tasa3 } = reglas;
  if (capital >= min1 && capital <= max1) return tasa1;
  if (capital > max1 && capital <= max2) return tasa2;
  return tasa3;
}

/**
 * Ejecuta UNA simulación durante 'anios' años.
 * Devuelve capital final, interés total y (si se pide) el detalle por año con la tasa usada.
 */
function simularUna({ anios, capitalInicial, reglas, incluirDetalle = false }) {
  let capital = capitalInicial;
  let interesAcum = 0;
  const detalle = [];

  const tasasAplicadas = []; // para calcular tasa media aplicada en la simulación

  for (let año = 1; año <= anios; año++) {
    const tasa = tasaSegunCapital(capital, reglas);
    const interes = capital * tasa;
    interesAcum += interes;
    capital += interes;

    tasasAplicadas.push(tasa);

    if (incluirDetalle) {
      detalle.push({
        año,
        tasa,
        interes,
        capitalDespues: capital,
      });
    }
  }

  const tasaMedia = tasasAplicadas.reduce((a, b) => a + b, 0) / Math.max(1, tasasAplicadas.length);

  return {
    capitalFinal: capital,
    interesTotal: interesAcum,
    tasaMediaAplicada: tasaMedia,
    detalle,
  };
}

export default function TasaVariable() {
  // -------------------- Parámetros principales --------------------
  const [anios, setAnios] = useState(10);

  // Capital inicial: fijo o rango aleatorio
  const [usarRangoCapital, setUsarRangoCapital] = useState(false);
  const [capitalInicial, setCapitalInicial] = useState(12250); // ejemplo de tus apuntes
  const [capitalMin, setCapitalMin] = useState(8000);
  const [capitalMax, setCapitalMax] = useState(15000);

  // -------------------- Condiciones de tasa (claras) --------------------
  // Rango 1: [min1, max1] -> tasa1
  // Rango 2: (max1, max2] -> tasa2
  // Rango 3: > max2       -> tasa3
  const [min1, setMin1] = useState(0);
  const [max1, setMax1] = useState(10000);
  const [max2, setMax2] = useState(100000);
  const [tasa1, setTasa1] = useState(0.035); // 3.5%
  const [tasa2, setTasa2] = useState(0.037); // 3.7%
  const [tasa3, setTasa3] = useState(0.04);  // 4.0%

  // -------------------- Estado de resultados --------------------
  const [resultados, setResultados] = useState(null);
  const [error, setError] = useState('');

  // -------------------- Validaciones --------------------
  function validar() {
    if (anios < 1) return 'Los años deben ser ≥ 1.';

    if (usarRangoCapital) {
      if (capitalMin <= 0 || capitalMax <= 0) return 'El capital mínimo/máximo debe ser > 0.';
      if (capitalMin > capitalMax) return 'El capital mínimo no puede ser mayor que el máximo.';
    } else {
      if (capitalInicial <= 0) return 'El capital inicial debe ser > 0.';
    }

    if (max1 < 0) return 'El límite inferior del Rango 1 (max1) debe ser ≥ 0.';
    if (max2 < max1) return 'En el Rango 2, max2 debe ser ≥ max1.';
    if (tasa1 < 0 || tasa2 < 0 || tasa3 < 0) return 'Las tasas no pueden ser negativas.';

    return '';
  }

  // -------------------- Limpiar --------------------
  function limpiar() {
    setResultados(null);
    setError('');
  }

  // -------------------- Simulación --------------------
  function simular() {
    const msg = validar();
    if (msg) { setError(msg); setResultados(null); return; }
    setError('');

    const reglas = { min1: Number(min1), max1: Number(max1), max2: Number(max2), tasa1: Number(tasa1), tasa2: Number(tasa2), tasa3: Number(tasa3) };

    // Capital inicial (si se usa rango, se toma UNA sola vez)
    let capital = usarRangoCapital
      ? (capitalMin + Math.random() * (capitalMax - capitalMin))
      : capitalInicial;

    const capitalInicialUsado = capital;
    const filas = [];
    let sumaIntereses = 0;

    for (let año = 1; año <= Math.floor(anios); año++) {
      const tasa = tasaSegunCapital(capital, reglas); // decimal, ej. 0.037
      const interes = capital * tasa;
      sumaIntereses += interes;
      capital += interes; // capital acumulado al final del año

      filas.push({
        anio: año,
        tasa,
        interes,
        capitalAcum: capital,
      });
    }

    const resumen = {
      capitalInicial: capitalInicialUsado,
      sumaIntereses,
      capitalFinal: capital,
    };

    setResultados({ filas, resumen, reglas });
  }

  // -------------------- UI --------------------
  return (
    <div className="container">
      <header className="header">
        <h1>Simulación — Tasa Variable por Rango de Capital</h1>
      </header>

      <main className="content problema-section">
        <h2 className="subtitulo">Parámetros y Resultados</h2>

        <div className="columnas">
          {/* Columna izquierda: configuración */}
          <section className="columna-izquierda">
            <div className="card">
              <h3>Configuración</h3>


              <div className="input-group">
                <label>Años (ciclos)</label>
                <input
                  type="number"
                  min="1"
                  value={anios}
                  onChange={(e) => setAnios(parseInt(e.target.value || '0', 10))}
                />
              </div>

              <div className="parametros-section">
                <h4>Capital inicial</h4>

                <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="checkbox"
                    checked={usarRangoCapital}
                    onChange={(e) => setUsarRangoCapital(e.target.checked)}
                    style={{ width: 18, height: 18 }}
                  />
                  <label style={{ margin: 0 }}>Usar rango aleatorio por simulación</label>
                </div>

                {!usarRangoCapital ? (
                  <div className="input-group">
                    <label>Capital inicial fijo (Bs)</label>
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

              <div className="parametros-section">
                <h4>Condiciones de tasa (explicación)</h4>

                {/* Tabla explicativa de rangos */}
                <div className="tabla-container-capital" style={{ marginBottom: 12 }}>
                  <table className="tabla-resultados">
                    <thead>
                      <tr>
                        <th>Rango de capital</th>
                        <th className="num">Tasa aplicada</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Entre <b>{fmt(min1, 0)}</b> y <b>{fmt(max1, 0)}</b> (incluye ambos)</td>
                        <td className="num">{(tasa1 * 100).toFixed(2)}%</td>
                      </tr>
                      <tr>
                        <td>Mayor a <b>{fmt(max1, 0)}</b> y hasta <b>{fmt(max2, 0)}</b></td>
                        <td className="num">{(tasa2 * 100).toFixed(2)}%</td>
                      </tr>
                      <tr>
                        <td>Mayor a <b>{fmt(max2, 0)}</b></td>
                        <td className="num">{(tasa3 * 100).toFixed(2)}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Controles para editar los rangos y tasas */}
                <div className="input-group">
                    <label>Rango 1 — límites [min1, max1]</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <input
                        type="number"
                        min="0"
                        value={0}
                        disabled
                        style={{
                            backgroundColor: '#f2f2f2',
                            color: '#555',
                            cursor: 'not-allowed',
                            fontWeight: 60,
                            textAlign: 'center',
                        }}
                        />
                        <input
                        type="number"
                        min="0"
                        value={max1}
                        onChange={(e) => setMax1(parseFloat(e.target.value || '0'))}
                        />
                    </div>
                    <p style={{
                        marginTop: 6,
                        fontSize: '0.85rem',
                        color: '#6e6e73',
                        fontStyle: 'italic'
                    }}>
                        El valor mínimo siempre inicia en 0 para todos los cálculos.
                    </p>
                    </div>

                <div className="input-group">
                  <label>Rango 2 — límite superior (max2)</label>
                  <input type="number" min="0" value={max2} onChange={(e) => setMax2(parseFloat(e.target.value || '0'))} />
                </div>

                <div className="input-group">
                  <label>Tasas por rango (anual):</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                    <input type="number" step="0.0001" min="0" value={tasa1} onChange={(e) => setTasa1(parseFloat(e.target.value || '0'))} placeholder="tasa1" />
                    <input type="number" step="0.0001" min="0" value={tasa2} onChange={(e) => setTasa2(parseFloat(e.target.value || '0'))} placeholder="tasa2" />
                    <input type="number" step="0.0001" min="0" value={tasa3} onChange={(e) => setTasa3(parseFloat(e.target.value || '0'))} placeholder="tasa3" />
                  </div>
                </div>
              </div>

              <button className="btn-simular" onClick={simular}>Simular</button>
              <button className="btn-simular btn-secundario" onClick={limpiar}>
                    Limpiar
                  </button>

              {error && (
                <div style={{ marginTop: 12, color: '#b00020', fontWeight: 600 }}>
                  {error}
                </div>
              )}
            </div>
          </section>

          {/* Columna derecha: resultados */}
          <section className="columna-derecha">
            <div className="card">
              <h3>Resultados</h3>

              <div
                className="tabla-container"
                style={{ marginTop: 10, maxHeight: '500px', overflowY: 'auto' }}
              >
                <table className="tabla-resultados">
                  <thead>
                    <tr>
                      <th>Año</th>
                      <th className="num">Tasa (%)</th>
                      <th className="num">Interés</th>
                      <th className="num">Capital acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!resultados ? (
                      <tr>
                        <td colSpan={4} className="sin-datos" style={{ textAlign: 'center' }}>
                          Ingresa parámetros y presiona <b>Simular</b>
                        </td>
                      </tr>
                    ) : (
                      resultados.filas.map((r) => (
                        <tr key={r.anio}>
                          <td>{r.anio}</td>
                          <td className="num">{(r.tasa * 100).toFixed(2)}%</td>
                          <td className="num">Bs {fmt(r.interes)}</td>
                          <td className="num">Bs {fmt(r.capitalAcum)}</td>
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
                      <span className="stat-value">Bs {fmt(resultados.resumen.capitalInicial)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Suma de intereses</span>
                      <span className="stat-value">Bs {fmt(resultados.resumen.sumaIntereses)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Capital final</span>
                      <span className="stat-value">Bs {fmt(resultados.resumen.capitalFinal)}</span>
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
