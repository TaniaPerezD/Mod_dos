// diagramas-flujo/src/pages/Huevos.jsx
import React, { useState } from 'react';
import '../styles/simulacion.css';

/**
 * Generador Poisson (Knuth) para lambda >= 0
 * Retorna número entero de eventos en el intervalo.
 */
function poissonKnuth(lambda) {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1.0;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

/**
 * Ejecuta UNA simulación por 'dias' con parámetros dados.
 * Devuelve totales y (opcional) el detalle diario.
 */
function simularUna({
  dias,
  lambdaPoisson,
  pvuh, // precio huevo
  pvup, // precio pollo
  pRotos, // prob huevo roto
  pAPollo, // prob huevo -> pollo
  pVendido, // prob huevo vendido como huevo
  pMuertePollo, // prob pollo muere
  pSobrevivePollo, // prob pollo sobrevive
  incluirDetalle = false,
}) {

  let THR = 0; // total huevos rotos
  let THH = 0; // total huevos vendidos como huevo
  let TPS = 0; // total pollos que sobreviven
  let THP = 0; // total huevos producidos
  let THPO = 0; // total huevos que intentaron ser pollos
  let TPM = 0; // total pollos que mueren
  let ingresoTotal = 0;

  const detalle = [];

  for (let d = 1; d <= dias; d++) {
    const huevosHoy = poissonKnuth(lambdaPoisson);
    let huevosRotosDia = 0;
    let huevosVendDia = 0;
    let pollosVivosDia = 0;
    let huevosAPollosDia = 0;
    let pollosMuertosDia = 0;

    for (let h = 0; h < huevosHoy; h++) {
      const rEH = Math.random();
      if (rEH < pRotos) {
        huevosRotosDia++;
      } else if (rEH < pRotos + pAPollo) {
        // Va a pollo
        huevosAPollosDia++;
        const rEP = Math.random();
        if (rEP < pSobrevivePollo) {
          pollosVivosDia++; // sobrevive
        } else {
          pollosMuertosDia++;
        }
      } else if (rEH < pRotos + pAPollo + pVendido) {
        // Se vende como huevo
        huevosVendDia++;
      }
    }

    const ingresoDia = huevosVendDia * pvuh + pollosVivosDia * pvup;
    ingresoTotal += ingresoDia;

    // acumular totales
    THR += huevosRotosDia;
    THH += huevosVendDia;
    TPS += pollosVivosDia;
    THP += huevosHoy;
    THPO += huevosAPollosDia;
    TPM += pollosMuertosDia;

    if (incluirDetalle) {
      detalle.push({
        dia: d,
        huevosHoy,
        huevosRotosDia,
        huevosVendDia,
        huevosAPollosDia,
        pollosVivosDia,
        pollosMuertosDia,
        ingresoDia,
      });
    }
  }

  return {
    THR,
    THH,
    TPS,
    THP,
    THPO,
    TPM,
    ingresoTotal,
    ingresoPromedioDia: dias > 0 ? ingresoTotal / dias : 0,
    detalle,
  };
}

/**
 * Ejecuta 'numSimulaciones' simulaciones independientes.
 * Devuelve el arreglo de resúmenes y los agregados/medias.
 */
function simularLote(params, numSimulaciones) {
  const resumenes = [];
  let agg = {
    THR: 0,
    THH: 0,
    TPS: 0,
    THP: 0,
    THPO: 0,
    TPM: 0,
    ingresoTotal: 0,
    ingresoPromedioDia: 0, // se promedia luego
  };

  for (let i = 0; i < numSimulaciones; i++) {
    const r = simularUna({ ...params, incluirDetalle: i === numSimulaciones - 1 }); // guardamos detalle de la última
    resumenes.push({ idx: i + 1, ...r });
    agg.THR += r.THR;
    agg.THH += r.THH;
    agg.TPS += r.TPS;
    agg.THP += r.THP;
    agg.THPO += r.THPO;
    agg.TPM += r.TPM;
    agg.ingresoTotal += r.ingresoTotal;
    agg.ingresoPromedioDia += r.ingresoPromedioDia;
  }

  const n = Math.max(1, numSimulaciones);
  const promedios = {
    THR: agg.THR / n,
    THH: agg.THH / n,
    TPS: agg.TPS / n,
    THP: agg.THP / n,
    THPO: agg.THPO / n,
    TPM: agg.TPM / n,
    ingresoTotal: agg.ingresoTotal / n,
    ingresoPromedioDia: agg.ingresoPromedioDia / n,
  };

  return { resumenes, agregados: agg, promedios };
}

export default function Huevos() {
  // Entradas configurables
  const [numSimulaciones, setNumSimulaciones] = useState(30);
  const [dias, setDias] = useState(10);
  const [lambdaPoisson, setLambdaPoisson] = useState(10); // media de Poisson (huevos/día)
  const [pvuh, setPvuh] = useState(1.0); // precio por huevo
  const [pvup, setPvup] = useState(5.0); // precio por pollo

  const [pRotos, setPRotos] = useState(0.2); // prob huevo roto
  const [pAPollo, setPAPollo] = useState(0.3); // prob huevo -> pollo
  const [pVendido, setPVendido] = useState(0.5); // prob huevo vendido como huevo
  const [pMuertePollo, setPMuertePollo] = useState(0.2); // prob pollo muere
  const [pSobrevivePollo, setPSobrevivePollo] = useState(0.8); // prob pollo sobrevive

  // Estado de resultados
  const [resultados, setResultados] = useState(null);
  const [error, setError] = useState('');

  function validarEntradas() {
    if (numSimulaciones <= 0 || !Number.isFinite(numSimulaciones)) {
      return 'El número de simulaciones debe ser mayor a 0.';
    }
    if (dias <= 0 || !Number.isFinite(dias)) {
      return 'El número de días debe ser mayor a 0.';
    }
    if (lambdaPoisson < 0) {
      return 'La media de Poisson no puede ser negativa.';
    }
    if (pvuh < 0 || pvup < 0) {
      return 'Los precios no pueden ser negativos.';
    }
    if (pRotos < 0 || pAPollo < 0 || pVendido < 0 || pMuertePollo < 0 || pSobrevivePollo < 0) {
      return 'Las probabilidades no pueden ser negativas.';
    }
    if (pRotos > 1 || pAPollo > 1 || pVendido > 1 || pMuertePollo > 1 || pSobrevivePollo > 1) {
      return 'Las probabilidades no pueden ser mayores a 1.';
    }
    const sumHuevo = pRotos + pAPollo + pVendido;
    if (Math.abs(sumHuevo - 1) > 1e-6) {
      return 'Las probabilidades de huevo deben sumar 1 (Rotos + →Pollo + Vendido).';
    }
    const sumPollo = pMuertePollo + pSobrevivePollo;
    if (Math.abs(sumPollo - 1) > 1e-6) {
      return 'Las probabilidades del pollo deben sumar 1 (Muere + Sobrevive).';
    }
    return '';
  }

  function formNum(n, dec = 2) {
    return Number(n).toFixed(dec);
  }

  function onSimular() {
    const msg = validarEntradas();
    if (msg) {
      setError(msg);
      setResultados(null);
      return;
    }
    setError('');
    const { resumenes, agregados, promedios } = simularLote(
      { dias, lambdaPoisson, pvuh, pvup, pRotos, pAPollo, pVendido, pMuertePollo, pSobrevivePollo },
      numSimulaciones
    );
    setResultados({ resumenes, agregados, promedios });
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Simulación de Producción de Huevos y Pollos</h1>
      </header>

      <main className="content problema-section">
        <h2 className="subtitulo">Parámetros y Resultados</h2>

        <div className="columnas">
          {/* Columna izquierda: parámetros */}
          <section className="columna-izquierda">
            <div className="card">
              <h3>Configuración de la simulación</h3>

              <div className="input-group">
                <label>Número de simulaciones</label>
                <input
                  type="number"
                  min="1"
                  value={numSimulaciones}
                  onChange={(e) => setNumSimulaciones(parseInt(e.target.value || '0', 10))}
                />
              </div>

              <div className="input-group">
                <label>Días por simulación</label>
                <input
                  type="number"
                  min="1"
                  value={dias}
                  onChange={(e) => setDias(parseInt(e.target.value || '0', 10))}
                />
              </div>

              <div className="input-group">
                <label>Media de Poisson (huevos/día)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={lambdaPoisson}
                  onChange={(e) => setLambdaPoisson(parseFloat(e.target.value || '0'))}
                />
              </div>

              <div className="parametros-section">
                <div className="parametros-header">
                  <h4>Probabilidades de estados del huevo</h4>
                </div>

                <div className="input-group">
                  <label>p(Huevo roto)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={pRotos}
                    onChange={(e) => setPRotos(parseFloat(e.target.value || '0'))}
                  />
                </div>

                <div className="input-group">
                  <label>p(Huevo → Pollo)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={pAPollo}
                    onChange={(e) => setPAPollo(parseFloat(e.target.value || '0'))}
                  />
                </div>

                <div className="input-group">
                  <label>p(Huevo vendido como huevo)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={pVendido}
                    onChange={(e) => setPVendido(parseFloat(e.target.value || '0'))}
                  />
                </div>
                <div style={{ color: '#666', fontSize: '.85rem', marginTop: '-8px', marginBottom: '12px' }}>
                  Debe cumplirse: p(Rotos) + p(→Pollo) + p(Vendido) = 1
                </div>

                <div className="input-group">
                  <label>p(Muerte del pollo)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={pMuertePollo}
                    onChange={(e) => setPMuertePollo(parseFloat(e.target.value || '0'))}
                  />
                </div>
                <div className="input-group">
                  <label>p(Sobrevive el pollo)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={pSobrevivePollo}
                    onChange={(e) => setPSobrevivePollo(parseFloat(e.target.value || '0'))}
                  />
                </div>
                <div style={{ color: '#666', fontSize: '.85rem', marginTop: '-8px' }}>
                  Debe cumplirse: p(Muere) + p(Sobrevive) = 1
                </div>
              </div>

              <div className="parametros-section">
                <h4>Precios</h4>
                <div className="input-group">
                  <label>Precio unitario del huevo (PVUH)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pvuh}
                    onChange={(e) => setPvuh(parseFloat(e.target.value || '0'))}
                  />
                </div>
                <div className="input-group">
                  <label>Precio unitario del pollo (PVUP)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pvup}
                    onChange={(e) => setPvup(parseFloat(e.target.value || '0'))}
                  />
                </div>
              </div>

              <button className="btn-simular" onClick={onSimular}>
                Simular
              </button>

              {error && (
                <div
                  style={{
                    marginTop: 12,
                    color: '#b22222',
                    fontWeight: 600,
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          </section>

          {/* Columna derecha: resultados */}
          <section className="columna-derecha">
            <div className="card">
              <h3>Resultados</h3>

              {!resultados ? (
                <div className="sin-datos">Aún no hay datos. Configura y presiona “Simular”.</div>
              ) : (
                <>
                  {/* Resumen por simulación */}
                  <div className="tabla-container" style={{ marginTop: 10 }}>
                    <table className="tabla-resultados">
                      <thead>
                        <tr>
                          <th>Sim</th>
                          <th>Huevos prod.</th>
                          <th>Rotos</th>
                          <th>→ Pollos</th>
                          <th>Vendidos</th>
                          <th>Pollos vivos</th>
                          <th>Pollos muertos</th>
                          <th>Ingreso total</th>
                          <th>Ingreso prom. día</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultados.resumenes.map((r) => (
                          <tr key={r.idx}>
                            <td>{r.idx}</td>
                            <td>{r.THP}</td>
                            <td>{r.THR}</td>
                            <td>{r.THPO}</td>
                            <td>{r.THH}</td>
                            <td>{r.TPS}</td>
                            <td>{r.TPM}</td>
                            <td>Bs {formNum(r.ingresoTotal)}</td>
                            <td>Bs {formNum(r.ingresoPromedioDia)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Agregados y promedios */}
                  <div className="estadisticas" style={{ marginTop: 16 }}>
                    <h4>Estadísticas del lote</h4>
                    <div className="estadisticas-grid">
                      <div className="stat-item">
                        <span className="stat-label">Ingreso promedio por día</span>
                        <span className="stat-value">Bs {formNum(resultados.promedios.ingresoPromedioDia)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Prom. huevos rotos / sim</span>
                        <span className="stat-value">{formNum(resultados.promedios.THR, 0)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Prom. pollos muertos / sim</span>
                        <span className="stat-value">{formNum(resultados.promedios.TPM, 0)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Prom. huevos vendidos / sim</span>
                        <span className="stat-value">{formNum(resultados.promedios.THH, 0)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Prom. pollos vendidos / sim</span>
                        <span className="stat-value">{formNum(resultados.promedios.TPS, 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Detalle de la última simulación para visualizar días */}
                  {resultados.resumenes.length > 0 &&
                    resultados.resumenes[resultados.resumenes.length - 1].detalle?.length > 0 && (
                      <div style={{ marginTop: 20 }}>
                    
                        <div className="tabla-container">
                          <table className="tabla-resultados">
                            <thead>
                              <tr>
                                <th>Día</th>
                                <th>Huevos</th>
                                <th>Rotos</th>
                                <th>→ Pollos</th>
                                <th>Pollos vivos</th>
                                <th>Pollos muertos</th>
                                <th>Vendidos</th>
                                <th>Ingreso día</th>
                              </tr>
                            </thead>
                            <tbody>
                              {resultados.resumenes[resultados.resumenes.length - 1].detalle.map((d) => (
                                <tr key={d.dia}>
                                  <td>{d.dia}</td>
                                  <td>{d.huevosHoy}</td>
                                  <td>{d.huevosRotosDia}</td>
                                  <td>{d.huevosAPollosDia}</td>
                                  <td>{d.pollosVivosDia}</td>
                                  <td>{d.pollosMuertosDia}</td>
                                  <td>{d.huevosVendDia}</td>
                                  <td>Bs {formNum(d.ingresoDia)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}