import React, { useMemo, useRef, useState } from "react";
import "../styles/simulacion.css";
function uniformInt(min, max) {
  const a = Math.ceil(min);
  const b = Math.floor(max);
  return Math.floor(Math.random() * (b - a + 1)) + a;
}
function sampleArticulosPorCliente(p0, p1, p2, p3) {
  const u = Math.random();
  if (u < p0) return 0;
  if (u < p0 + p1) return 1;
  if (u < p0 + p1 + p2) return 2;
  return 3;
}

export default function SimulacionEventos() {
  const resultsRef = useRef(null);
  const [numSimulaciones, setNumSimulaciones] = useState("");
  const [numHoras, setNumHoras] = useState("");
  const [costoFijo, setCostoFijo] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [costoUnitario, setCostoUnitario] = useState("");
  const [minLleg, setMinLleg] = useState("");
  const [maxLleg, setMaxLleg] = useState("");
  const [p0, setP0] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");

  // Para ver los resultados
  const [tablaSims, setTablaSims] = useState([]);   
  const [promedios, setPromedios] = useState(null); 
    //validaciones, aca falta poner mensajes de errooor
  const isValid = useMemo(() => {
    const sims = parseInt(numSimulaciones, 10);
    const horas = parseInt(numHoras, 10);
    const min = parseInt(minLleg, 10);
    const max = parseInt(maxLleg, 10);
    const cf = parseFloat(costoFijo);
    const pv = parseFloat(precioVenta);
    const cu = parseFloat(costoUnitario);
    const _p0 = parseFloat(p0), _p1 = parseFloat(p1),
          _p2 = parseFloat(p2), _p3 = parseFloat(p3);

    if (!Number.isFinite(sims) || sims <= 0) return false;
    if (!Number.isFinite(horas) || horas <= 0) return false;
    if (!Number.isFinite(min) || min < 0) return false;
    if (!Number.isFinite(max) || max < min) return false;
    if (!Number.isFinite(cf) || cf < 0) return false;
    if (!Number.isFinite(pv) || pv < 0) return false;
    if (!Number.isFinite(cu) || cu < 0) return false;

    if (!Number.isFinite(_p0) || _p0 < 0) return false;
    if (!Number.isFinite(_p1) || _p1 < 0) return false;
    if (!Number.isFinite(_p2) || _p2 < 0) return false;
    if (!Number.isFinite(_p3) || _p3 < 0) return false;

    return _p0 + _p1 + _p2 + _p3 > 0; // si las prob son diferentes de 1, se debe normalizar
  }, [numSimulaciones, numHoras, minLleg, maxLleg, costoFijo, precioVenta, costoUnitario, p0, p1, p2, p3]);

  const ejecutarSimulacion = () => {
    if (!isValid) return;

    const sims  = parseInt(numSimulaciones, 10);
    const horas = parseInt(numHoras, 10);
    const cf    = parseFloat(costoFijo);
    const pv    = parseFloat(precioVenta);
    const cu    = parseFloat(costoUnitario);
    const min   = parseInt(minLleg, 10);
    const max   = parseInt(maxLleg, 10);

    const sumP = parseFloat(p0) + parseFloat(p1) + parseFloat(p2) + parseFloat(p3);
    const pp0 = parseFloat(p0) / sumP;
    const pp1 = parseFloat(p1) / sumP;
    const pp2 = parseFloat(p2) / sumP;
    const pp3 = parseFloat(p3) / sumP;

    const margenUnit = pv - cu;

    const filas = [];
    let accTartc = 0;
    let accGnet  = 0;

    for (let s = 1; s <= sims; s++) {
      let totalArt = 0;

      for (let h = 1; h <= horas; h++) {
        const LLECLI = uniformInt(min, max);
        for (let i = 0; i < LLECLI; i++) {
          totalArt += sampleArticulosPorCliente(pp0, pp1, pp2, pp3);
        }
      }

      const gnetDia = margenUnit * totalArt - cf;

      filas.push({ nsim: s, tartc: totalArt, gnet: gnetDia.toFixed(2) });
      accTartc += totalArt;
      accGnet  += gnetDia;
    }

    setTablaSims(filas);
    setPromedios({
      tartcProm: (accTartc / sims).toFixed(2),
      gnetProm:  (accGnet  / sims).toFixed(2),
    });

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const limpiar = () => {
    setNumSimulaciones("");
    setNumHoras("");
    setCostoFijo("");
    setPrecioVenta("");
    setCostoUnitario("");
    setMinLleg("");
    setMaxLleg("");
    setP0(""); setP1(""); setP2(""); setP3("");
    setTablaSims([]);
    setPromedios(null);
  };


  return (
    <div className="container">
      <header className="header">
        <h1>Simulación de Eventos Discretos — Tienda</h1>
      </header>

      <div className="content">
        <div className="problema-section">
          <h2 className="subtitulo">Llegada de Clientes a una Tienda</h2>

          <div className="columnas">
            <div className="columna-izquierda">
              <div className="card">
                <h3>Parámetros de la Simulación</h3>

                <div className="input-group">
                  <label>Número de Simulaciones (días):</label>
                  <input
                    type="number" min="1" step="1"
                    value={numSimulaciones}
                    onChange={(e)=>setNumSimulaciones(e.target.value)}
                    placeholder="1"
                  />
                </div>

                <div className="input-group">
                  <label>Número de Horas por día:</label>
                  <input
                    type="number" min="1" step="1"
                    value={numHoras}
                    onChange={(e)=>setNumHoras(e.target.value)}
                    placeholder="10"
                  />
                </div>

                <div className="input-group">
                  <label>Costo fijo (Bs./día):</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={costoFijo}
                    onChange={(e)=>setCostoFijo(e.target.value)}
                    placeholder="300"
                  />
                </div>

                <div className="input-group">
                  <label>Precio Venta (Bs./art.):</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={precioVenta}
                    onChange={(e)=>setPrecioVenta(e.target.value)}
                    placeholder="75"
                  />
                </div>

                <div className="input-group">
                  <label>Precio Compra/Coste (Bs./art.):</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={costoUnitario}
                    onChange={(e)=>setCostoUnitario(e.target.value)}
                    placeholder="50"
                  />
                </div>

                <div className="parametros-section">
                  <h4>Llegada Clientes por Hora (Uniforme)</h4>
                  <div className="two-col">
                    <div className="input-group">
                      <label>Mín:</label>
                      <input
                        type="number" min="0" step="1"
                        value={minLleg}
                        onChange={(e)=>setMinLleg(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="input-group">
                      <label>Máx:</label>
                      <input
                        type="number" min="0" step="1"
                        value={maxLleg}
                        onChange={(e)=>setMaxLleg(e.target.value)}
                        placeholder="4"
                      />
                    </div>
                  </div>
                </div>

                <div className="parametros-section">
                  <h4>Compra de Artículos por Cliente</h4>
                  <div className="grid-4">
                    <div className="input-group">
                      <label>P(0):</label>
                      <input type="number" min="0" step="0.01"
                        value={p0} onChange={(e)=>setP0(e.target.value)} placeholder="0.2" />
                    </div>
                    <div className="input-group">
                      <label>P(1):</label>
                      <input type="number" min="0" step="0.01"
                        value={p1} onChange={(e)=>setP1(e.target.value)} placeholder="0.3" />
                    </div>
                    <div className="input-group">
                      <label>P(2):</label>
                      <input type="number" min="0" step="0.01"
                        value={p2} onChange={(e)=>setP2(e.target.value)} placeholder="0.4" />
                    </div>
                    <div className="input-group">
                      <label>P(3):</label>
                      <input type="number" min="0" step="0.01"
                        value={p3} onChange={(e)=>setP3(e.target.value)} placeholder="0.1" />
                    </div>
                  </div>
                  <small>Si P0+P1+P2+P3 ≠ 1, se normaliza automáticamente.</small>
                </div>

                {!isValid && (
                  <p className="hint error">
                    Completa parámetros válidos (enteros positivos, min ≤ max y probabilidades ≥ 0).
                  </p>
                )}

                <div className="acciones">
                  <button className="btn-simular" onClick={ejecutarSimulacion} disabled={!isValid}>
                    Simular
                  </button>
                  <button className="btn-simular btn-secundario" onClick={limpiar}>
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
            <div className="columna-derecha" ref={resultsRef}>
              <div className="card">
                <h3>Resultados de la Simulación</h3>

                <div className="tabla-container">
                  <table className="tabla-resultados">
                    <thead>
                      <tr>
                        <th>NSIM</th>
                        <th>TARTC (Art.)</th>
                        <th>GNETA (Bs.)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tablaSims.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="sin-datos">
                            Ingresa parámetros y presiona <strong>Simular</strong>
                          </td>
                        </tr>
                      ) : (
                        tablaSims.map((r) => (
                          <tr key={r.nsim}>
                            <td>{r.nsim}</td>
                            <td><strong>{r.tartc}</strong></td>
                            <td>{r.gnet}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {promedios && (
                  <div className="estadisticas">
                    <h4>Promedio de Resultados</h4>
                    <div className="estadisticas-grid">
                      <div className="stat-item">
                        <span className="stat-label">TARTC (Art.):</span>
                        <span className="stat-value">{promedios.tartcProm}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">GNETA (Bs.):</span>
                        <span className="stat-value">{promedios.gnetProm}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
