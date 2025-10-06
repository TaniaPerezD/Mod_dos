import React, { useState } from 'react';
import '../styles/metodos.css';
import { lcgMultiplicativo } from '../funciones/metCongruenciales.js';

const MultiplicativeAlgorithmGenerator = () => {
  const [inputs, setInputs] = useState({
    x0: '',
    k: '',
    p: '',
    d: '',
    n: '',
    cOption: '3+8k', // opción para a: 3+8k o 5+8k
  });

  const [results, setResults] = useState([]);
  const [calculatedParams, setCalculatedParams] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^\d*$/.test(value)) {
      setInputs((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleGenerar = () => {
    const { x0, k, p, d, cOption } = inputs;

    if ([x0, k, p, d].some(v => v === '')) {
      alert('Por favor, complete todos los campos');
      return;
    }

    try {
      const seed = parseInt(x0, 10);
      const kVal = parseInt(k, 10);
      const pVal = parseInt(p, 10); // cantidad a generar
      const dVal = parseInt(d, 10);
      const nVal = pVal + 1; // generar exactamente p números
      const opcionA = cOption; // '3+8k' o '5+8k'

      const filas = lcgMultiplicativo({ x0: seed, k: kVal, p: pVal, d: dVal, n: nVal, opcionA, pEsCantidad: true });

      setResults(filas);
      setCalculatedParams(filas && filas.meta ? { ...filas.meta } : null);
    } catch (err) {
      alert(err.message || 'Error al generar la secuencia');
      setResults([]);
      setCalculatedParams(null);
    }
  };

  const handleLimpiar = () => {
    setInputs({
      x0: '',
      k: '',
      p: '',
      d: '',
      n: '',
      cOption: '3+8k',
    });
    setResults([]);
    setCalculatedParams(null);
  };

  return (
    <div className="linear-algorithm-container">
      <div className="generator-content">
        <h2 className="title">Algoritmo Multiplicativo</h2>

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
              <label>Opción a:</label>
              <div>
                <label>
                  <input
                    type="radio"
                    name="cOption"
                    value="3+8k"
                    checked={inputs.cOption === '3+8k'}
                    onChange={(e) => setInputs(prev => ({ ...prev, cOption: e.target.value }))}
                  />
                  (3 + 8k)
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="radio"
                    name="cOption"
                    value="5+8k"
                    checked={inputs.cOption === '5+8k'}
                    onChange={(e) => setInputs(prev => ({ ...prev, cOption: e.target.value }))}
                  />
                  (5 + 8k)
                </label>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="p">Cantidad a generar (p):</label>
              <input
                type="text"
                id="p"
                name="p"
                value={inputs.p}
                onChange={handleInputChange}
                placeholder="Cantidad de números a generar"
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
            <h3>Resultados Generados - Algoritmo Multiplicativo</h3>
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
                      <td className="operation-cell">{row.operacion}</td>
                      <td>{row.xi}</td>
                      <td>{Number(row.ri).toFixed(parseInt(inputs.d || '0', 10))}</td>
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

export default MultiplicativeAlgorithmGenerator;
 