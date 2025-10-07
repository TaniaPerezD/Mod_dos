import React, { useState } from "react";
import "../styles/simulacion.css";
import { simularJuegos } from "../funciones/dadosProceso";

export default function Dados() {
  const [numSimulaciones, setNumSimulaciones] = useState(30);
  const [numJuegos, setNumJuegos] = useState(10);
  const [costoJuego, setCostoJuego] = useState(2);
  const [gananciaJugador, setGananciaJugador] = useState(5);
  const [resultados, setResultados] = useState([]);
  const [promedio, setPromedio] = useState(null);

  const manejarSimulacion = () => {
    const { resultados, promedio } = simularJuegos({
      numSimulaciones,
      numJuegos,
      costoJuego,
      gananciaJugador,
    });
    setResultados(resultados);
    setPromedio(promedio);
  };

  const limpiar = () => {
    setResultados([]);
    setPromedio(null);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Simulación del Juego de Dados 🎲</h1>
      </header>

      <div className="content">
        <div className="problema-section">
          <h2 className="subtitulo">Análisis de Resultados del Juego</h2>

          <div className="columnas">
            {/* Columna Izquierda - Configuración */}
            <div className="columna-izquierda">
              <div className="card">
                <h3>Configuración de la Simulación</h3>

                <div className="input-group">
                  <label>N° de Simulaciones:</label>
                  <input
                    type="number"
                    min="1"
                    value={numSimulaciones}
                    onChange={(e) => setNumSimulaciones(Number(e.target.value))}
                  />
                </div>

                <div className="input-group">
                  <label>N° de Juegos:</label>
                  <input
                    type="number"
                    min="1"
                    value={numJuegos}
                    onChange={(e) => setNumJuegos(Number(e.target.value))}
                  />
                </div>

                <div className="input-group">
                  <label>Costo del Juego (Bs):</label>
                  <input
                    type="number"
                    min="0"
                    value={costoJuego}
                    onChange={(e) => setCostoJuego(Number(e.target.value))}
                  />
                </div>

                <div className="input-group">
                  <label>Ganancia del Jugador (Bs):</label>
                  <input
                    type="number"
                    min="0"
                    value={gananciaJugador}
                    onChange={(e) => setGananciaJugador(Number(e.target.value))}
                  />
                </div>

                <div className="botones">
                  <button onClick={manejarSimulacion} className="btn-simular">
                    Ejecutar Simulación
                  </button>
                  <button onClick={limpiar} className="btn-limpiar">
                    Limpiar
                  </button>
                </div>
              </div>
            </div>

            {/* Columna Derecha - Resultados */}
            <div className="columna-derecha">
              <div className="card">
                <h3>Resultados de las Simulaciones</h3>

                <div className="tabla-container">
                  <table className="tabla-resultados">
                    <thead>
                      <tr>
                        <th>N°</th>
                        <th>GNETA (Bs)</th>
                        <th>NJUEG (Casa)</th>
                        <th>PJUEG (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultados.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="sin-datos">
                            Ejecuta la simulación para ver los resultados
                          </td>
                        </tr>
                      ) : (
                        resultados.map((r) => (
                          <tr key={r.num}>
                            <td>{r.num}</td>
                            <td>{r.ganancia.toFixed(2)}</td>
                            <td>{r.juegosCasa}</td>
                            <td>{r.porcentajeCasa}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {promedio && (
                  <div className="estadisticas">
                    <h4>Promedio de Resultados</h4>
                    <div className="estadisticas-grid">
                      <div className="stat-item">
                        <span className="stat-label">GNETA Promedio:</span>
                        <span className="stat-value">{promedio.promedioGanancia} Bs</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">NJUEG Promedio:</span>
                        <span className="stat-value">{promedio.promedioJuegos}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">PJUEG Promedio:</span>
                        <span className="stat-value">{promedio.promedioPorcentaje}%</span>
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
