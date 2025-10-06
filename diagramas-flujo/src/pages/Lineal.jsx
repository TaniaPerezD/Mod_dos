import React, { useState } from 'react';
import '../styles/metodos.css';
import { lcgLineal, linealParametros } from '../funciones/metCongruenciales.js';

const LinearAlgorithmGenerator = () => {
  const [inputs, setInputs] = useState({
    x0: '',
    k: '',
    c: '',
    p: '',
    d: '',
  });
  
  const [results, setResults] = useState([]);
  const [calculatedParams, setCalculatedParams] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Solo permitir números enteros (incluye 0)
    if (value === '' || /^\d*$/.test(value)) {
      setInputs(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleGenerar = () => {
    const { x0, k, c, p, d } = inputs;

    if (!x0 || !k || !c || !p || !d) {
      alert('Por favor, complete todos los campos');
      return;
    }

    const seed = parseInt(x0, 10);
    const kVal = parseInt(k, 10);
    const cVal = parseInt(c, 10);
    const pVal = parseInt(p, 10);
    const dVal = parseInt(d, 10);
    const nVal = pVal + 1;

    // Ejecutar generador (10 pasos por defecto; ajusta si necesitas otra cantidad)
    const filas = lcgLineal({ x0: seed, k: kVal, c: cVal, p: pVal, d: dVal, n: nVal });

    // Mapear resultados a las claves usadas por la tabla actual
    const mapped = filas.map(r => ({
      i: r.i,
      xiPrev: r.xiPrev,
      operation: r.operacion,
      xi: r.xi,
      r: r.ri,
    }));

    setResults(mapped);

    // Parámetros teóricos del generador lineal: m debe ser potencia de 2 (m = 2^g), a = 1 + 4k, g = log2(m)
    try {
      const params = linealParametros({ k: kVal, p: pVal, c: cVal });
      // params = { a, m, g }, añadimos c para mostrarlo también
      setCalculatedParams({ ...params, c: cVal });
    } catch (e) {
      alert(e.message);
      return;
    }
  };

  const handleLimpiar = () => {
    setInputs({
      x0: '',
      k: '',
      c: '',
      p: '',
      d: '',
      n: ''
    });
    setResults([]);
    setCalculatedParams(null);
  };

  return (
    <div className="linear-algorithm-container">
      <div className="generator-content">
        <h2 className="title">Algoritmo Lineal</h2>
        
        <div className="input-section">
          <div className="input-grid">
            <div className="input-group">
              <label htmlFor="x0">Semilla (X₀):</label>
              <input
                type="text"
                id="x0"
                name="x0"
                value={inputs.x0}
                onChange={handleInputChange}
                placeholder="Ingrese semilla inicial"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="k">K:</label>
              <input
                type="text"
                id="k"
                name="k"
                value={inputs.k}
                onChange={handleInputChange}
                placeholder="Ingrese valor K"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="c">c:</label>
              <input
                type="text"
                id="c"
                name="c"
                value={inputs.c}
                onChange={handleInputChange}
                placeholder="Ingrese incremento c"
              />
            </div>
            
            <div className="input-group">
            <label htmlFor="p">P:</label>
              <input
                type="text"
                id="p"
                name="p"
                value={inputs.p}
                onChange={handleInputChange}
                placeholder="Ingrese valor P"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="d">Decimales (d):</label>
              <input
                type="text"
                id="d"
                name="d"
                value={inputs.d}
                onChange={handleInputChange}
                placeholder="Cantidad de decimales"
              />
            </div>
            
          </div>
          
          <div className="button-group">
            <button className="btn-generar" onClick={handleGenerar}>
              Generar
            </button>
            <button className="btn-limpiar" onClick={handleLimpiar}>
              Limpiar
            </button>
          </div>
        </div>

        {calculatedParams && (
          <div className="params-display">
            <h3>Parámetros Calculados</h3>
            <div className="params-grid">
              <div className="param-item">
                <span className="param-label">a:</span>
                <span className="param-value">{calculatedParams.a}</span>
              </div>
              <div className="param-item">
                <span className="param-label">c:</span>
                <span className="param-value">{calculatedParams.c}</span>
              </div>
              <div className="param-item">
                <span className="param-label">g:</span>
                <span className="param-value">{calculatedParams.g}</span>
              </div>
              <div className="param-item">
                <span className="param-label">m:</span>
                <span className="param-value">{calculatedParams.m}</span>
              </div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="results-section">
            <h3>Resultados Generados - Algoritmo Lineal</h3>
            <div className="table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Paso (i)</th>
                    <th>X₍ᵢ₋₁₎</th>
                    <th>Operación Xᵢ</th>
                    <th>Xᵢ</th>
                    <th>Random (r)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, index) => (
                    <tr key={index}>
                      <td>{row.i}</td>
                      <td>{row.xiPrev}</td>
                      <td className="operation-cell">{row.operation}</td>
                      <td>{row.xi}</td>
                      <td>{Number(row.r).toFixed(parseInt(inputs.d || '0', 10))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinearAlgorithmGenerator;