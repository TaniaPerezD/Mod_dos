import React, { useState } from 'react';
import '../styles/simulacion.css';

export default function SimulacionEventos() {
  const [numSimulaciones, setNumSimulaciones] = useState(100);
  const [parametros, setParametros] = useState([
    { id: 1, nombre: 'Parámetro 1', valor: 5 },
    { id: 2, nombre: 'Parámetro 2', valor: 10 },
    { id: 3, nombre: 'Parámetro 3', valor: 15 }
  ]);
  const [resultados, setResultados] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);

  const agregarParametro = () => {
    const nuevoId = parametros.length + 1;
    setParametros([...parametros, { 
      id: nuevoId, 
      nombre: `Parámetro ${nuevoId}`, 
      valor: 0 
    }]);
  };

  const actualizarParametro = (id, valor) => {
    setParametros(parametros.map(p => 
      p.id === id ? { ...p, valor: parseFloat(valor) || 0 } : p
    ));
  };

  const ejecutarSimulacion = () => {
    const nuevosResultados = [];
    let sumaVar1 = 0, sumaVar2 = 0, sumaVar3 = 0;
    
    for (let i = 1; i <= numSimulaciones; i++) {
      const var1 = Math.random() * parametros[0]?.valor || 0;
      const var2 = Math.random() * parametros[1]?.valor || 0;
      const var3 = var1 + var2 + (parametros[2]?.valor || 0);
      
      nuevosResultados.push({
        iteracion: i,
        variable1: var1.toFixed(2),
        variable2: var2.toFixed(2),
        variable3: var3.toFixed(2)
      });
      
      sumaVar1 += var1;
      sumaVar2 += var2;
      sumaVar3 += var3;
    }
    
    setResultados(nuevosResultados);
    setEstadisticas({
      promedioVar1: (sumaVar1 / numSimulaciones).toFixed(2),
      promedioVar2: (sumaVar2 / numSimulaciones).toFixed(2),
      promedioVar3: (sumaVar3 / numSimulaciones).toFixed(2),
      totalIteraciones: numSimulaciones
    });
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Simulación de Eventos Discretos</h1>
      </header>

      <div className="content">
        <div className="problema-section">
          <h2 className="subtitulo">Problema de Simulación X:</h2>
          
          <div className="columnas">
            {/* Columna Izquierda - Inputs */}
            <div className="columna-izquierda">
              <div className="card">
                <h3>Configuración de Simulación</h3>
                
                <div className="input-group">
                  <label htmlFor="numSim">Número de Simulaciones:</label>
                  <input
                    id="numSim"
                    type="number"
                    min="1"
                    max="10000"
                    value={numSimulaciones}
                    onChange={(e) => setNumSimulaciones(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="parametros-section">
                  <div className="parametros-header">
                    <h4>Parámetros de Simulación</h4>
                    <button onClick={agregarParametro} className="btn-agregar">
                      + Agregar
                    </button>
                  </div>
                  
                  {parametros.map((param) => (
                    <div key={param.id} className="input-group">
                      <label>{param.nombre}:</label>
                      <input
                        type="number"
                        step="0.1"
                        value={param.valor}
                        onChange={(e) => actualizarParametro(param.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <button onClick={ejecutarSimulacion} className="btn-simular">
                  Ejecutar Simulación
                </button>
              </div>
            </div>

            {/* Columna Derecha - Resultados */}
            <div className="columna-derecha">
              <div className="card">
                <h3>Resultados de la Simulación</h3>
                
                <div className="tabla-container">
                  <table className="tabla-resultados">
                    <thead>
                      <tr>
                        <th>Iteración</th>
                        <th>Variable 1</th>
                        <th>Variable 2</th>
                        <th>Variable 3</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultados.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="sin-datos">
                            Ejecuta la simulación para ver resultados
                          </td>
                        </tr>
                      ) : (
                        resultados.map((r) => (
                          <tr key={r.iteracion}>
                            <td>{r.iteracion}</td>
                            <td>{r.variable1}</td>
                            <td>{r.variable2}</td>
                            <td>{r.variable3}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {estadisticas && (
                  <div className="estadisticas">
                    <h4>Parámetros de los Resultados</h4>
                    <div className="estadisticas-grid">
                      <div className="stat-item">
                        <span className="stat-label">Total Iteraciones:</span>
                        <span className="stat-value">{estadisticas.totalIteraciones}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Promedio Variable 1:</span>
                        <span className="stat-value">{estadisticas.promedioVar1}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Promedio Variable 2:</span>
                        <span className="stat-value">{estadisticas.promedioVar2}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Promedio Variable 3:</span>
                        <span className="stat-value">{estadisticas.promedioVar3}</span>
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