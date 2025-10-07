import React, { useState } from 'react';
import '../styles/simulacion.css';

// ======= FUNCIONES AUXILIARES =======
function expRand(mean) {
  const u = Math.random();
  return -Math.log(1 - u) * mean;
}

function uniformRand(a, b) {
  return a + (b - a) * Math.random();
}

// ======= FUNCIÓN PRINCIPAL =======
function simularInventario({
  horizonDays = 27,
  capacity = 700,
  meanDemand = 100,
  orderCost = 100,
  carryCostPerKgDay = 0.1,
  unitAcqCost = 3.5,
  unitSellPrice = 5.0,
  initialInventory = capacity,
}) {
  const reviewPeriod = 7;
  const leadMin = 1;
  const leadMax = 3;

  let CD = 0;
  let IAZU = initialInventory;
  let PAZU = 0;
  let TENT = "-";
  let pendingOrders = [];

  let CTORD = 0;
  let CTADQ = 0;
  let CTINV = 0;
  let CTOT = 0;

  let totalDemand = 0;
  let totalSold = 0;
  let totalLost = 0;
  let revenue = 0;

  const tabla = [];

  for (CD = 1; CD <= horizonDays; CD++) {
    for (let i = pendingOrders.length - 1; i >= 0; i--) {
      if (pendingOrders[i].arrivalDay <= CD) {
        const qty = pendingOrders[i].qty;
        IAZU = Math.min(IAZU + qty, capacity);
        pendingOrders.splice(i, 1);
      }
    }

    PAZU = 0;
    if (CD % reviewPeriod === 0) {
      const orderQty = Math.max(0, capacity - IAZU);
      if (orderQty > 0) {
        PAZU = orderQty;
        // Genera y redondea el tiempo de entrega (TENT) entre 1 y 3
        let lead = uniformRand(leadMin, leadMax);
        lead = Math.round(lead);
        lead = Math.min(3, Math.max(1, lead)); // asegura que esté entre 1 y 3
        const arrivalDay = CD + lead;
        pendingOrders.push({ qty: orderQty, arrivalDay });
        TENT = lead;
        
        CTORD += orderCost;
        CTADQ += orderQty * unitAcqCost;
      }
    } else {
      if (pendingOrders.length > 0) {
        const next = Math.min(...pendingOrders.map(o => o.arrivalDay - CD));
        TENT = Math.max(0, next);
      } else {
        TENT = Infinity;
      }
    }

    const DAZU = Math.round(expRand(meanDemand));
    totalDemand += DAZU;
    const sold = Math.min(IAZU, DAZU);
    const lost = Math.max(0, DAZU - sold);
    totalSold += sold;
    totalLost += lost;
    revenue += sold * unitSellPrice;
    IAZU -= sold;

    CTINV += IAZU * carryCostPerKgDay;
    CTOT = CTORD + CTADQ + CTINV;

    tabla.push({
      Día: CD,
      Inventario: IAZU.toFixed(2),
      Demanda: DAZU.toFixed(2),
      Pedido: PAZU.toFixed(2),
      TiempoEntrega: isFinite(TENT) ? TENT.toFixed(2) : "-",
      CostoOrden: CTORD.toFixed(2),
      CostoAdquisicion: CTADQ.toFixed(2),
      CostoInventario: CTINV.toFixed(2),
      CostoTotal: CTOT.toFixed(2),
      PerdidaAcumulada: totalLost.toFixed(2),
    });
  }

  const resultados = {
    DemandaTotal: totalDemand.toFixed(2),
    TotalVendido: totalSold.toFixed(2),
    DemandaInsatisfecha: totalLost.toFixed(2),
    CostoTotal: CTOT.toFixed(2),
    Ingresos: revenue.toFixed(2),
    GananciaNeta: (revenue - CTOT).toFixed(2),
    NivelServicio: ((totalSold / totalDemand) * 100).toFixed(2) + "%",
  };

  return { tabla, resultados };
}

// ======= COMPONENTE PRINCIPAL =======
export default function SimulacionEventos() {
  const [horizonDays, setHorizonDays] = useState(27);
  const [capacity, setCapacity] = useState(700);
  const [meanDemand, setMeanDemand] = useState(100);
  const [orderCost, setOrderCost] = useState(100);
  const [carryCostPerKgDay, setCarryCostPerKgDay] = useState(0.1);
  const [unitAcqCost, setUnitAcqCost] = useState(3.5);
  const [unitSellPrice, setUnitSellPrice] = useState(5.0);
  const [initialInventory, setInitialInventory] = useState(700);

  const [tabla, setTabla] = useState([]);
  const [resultadosResumen, setResultadosResumen] = useState(null);

  const ejecutarSimulacion = () => {
    const salida = simularInventario({
      horizonDays: Math.max(1, horizonDays),
      capacity,
      meanDemand,
      orderCost,
      carryCostPerKgDay,
      unitAcqCost,
      unitSellPrice,
      initialInventory: Math.min(initialInventory, capacity),
    });

    setTabla(salida.tabla);
    setResultadosResumen(salida.resultados);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Simulación de Inventario de Azúcar</h1>
      </header>

      <div className="content">
        <div className="problema-section">
          <div className="columnas">
            {/* Columna Izquierda */}
            <div className="columna-izquierda">
              <div className="card">
                <h3>Configuración</h3>

                <div className="input-group">
                  <label>Días del horizonte:</label>
                  <input
                    type="number"
                    min="1"
                    value={horizonDays}
                    onChange={(e) => setHorizonDays(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="input-group">
                  <label>Capacidad (kg):</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value) || 0)}
                  />
                </div>

                <div className="input-group">
                  <label>Demanda media:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={meanDemand}
                    onChange={(e) => setMeanDemand(Number(e.target.value) || 0)}
                  />
                </div>

                <div className="input-group">
                  <label>Costo de orden:</label>
                  <input
                    type="number"
                    value={orderCost}
                    onChange={(e) => setOrderCost(Number(e.target.value) || 0)}
                  />
                </div>

                <div className="input-group">
                  <label>Costo inventario (por kg/día):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={carryCostPerKgDay}
                    onChange={(e) => setCarryCostPerKgDay(Number(e.target.value) || 0)}
                  />
                </div>

                <div className="input-group">
                  <label>Costo adquisición/unidad:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitAcqCost}
                    onChange={(e) => setUnitAcqCost(Number(e.target.value) || 0)}
                  />
                </div>

                <div className="input-group">
                  <label>Precio venta/unidad:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitSellPrice}
                    onChange={(e) => setUnitSellPrice(Number(e.target.value) || 0)}
                  />
                </div>

                <div className="input-group">
                  <label>Inventario inicial:</label>
                  <input
                    type="number"
                    value={initialInventory}
                    onChange={(e) => setInitialInventory(Number(e.target.value) || 0)}
                  />
                </div>

                <button onClick={ejecutarSimulacion} className="btn-simular">
                  Ejecutar simulación
                </button>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="columna-derecha">
              <div className="card">
                <h3>Resultados diarios</h3>

                {/* --- Tabla con scroll horizontal --- */}
                <div
                  className="tabla-container"
                  style={{
                    overflowX: 'auto',
                    width: '100%',
                    maxWidth: '100%',
                  }}
                >
                  <table
                    className="tabla-resultados"
                    style={{ minWidth: '950px', borderCollapse: 'collapse' }}
                  >
                    <thead>
                      <tr>
                        <th>Día</th>
                        <th>Inventario</th>
                        <th>Demanda</th>
                        <th>Pedido</th>
                        <th>Tiempo Entrega</th>
                        <th>Costo Orden</th>
                        <th>Costo Adquisicion</th>
                        <th>Costo Inventario</th>
                        <th>Costo Total</th>
                        <th>Perdida Acumulada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tabla.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="sin-datos">
                            Ejecuta la simulación para ver resultados
                          </td>
                        </tr>
                      ) : (
                        tabla.map((r) => (
                          <tr key={r.Día}>
                            <td>{r.Día}</td>
                            <td>{r.Inventario}</td>
                            <td>{r.Demanda}</td>
                            <td>{r.Pedido}</td>
                            <td>{r.TiempoEntrega}</td>
                            <td>{r.CostoOrden}</td>
                            <td>{r.CostoAdquisicion}</td>
                            <td>{r.CostoInventario}</td>
                            <td>{r.CostoTotal}</td>
                            <td>{r.PerdidaAcumulada}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* --- Resumen debajo de la tabla --- */}
                {resultadosResumen && (
                  <div className="resumen-card" style={{ marginTop: '20px' }}>
                    <h4>=== RESULTADOS ===</h4>
                    <div className="resumen-grid">
                      <div><strong>Demanda Total:</strong> {resultadosResumen.DemandaTotal}</div>
                      <div><strong>Total Vendido:</strong> {resultadosResumen.TotalVendido}</div>
                      <div><strong>Demanda Insatisfecha:</strong> {resultadosResumen.DemandaInsatisfecha}</div>
                      <div><strong>Costo Total:</strong> {resultadosResumen.CostoTotal}</div>
                      <div><strong>Ingresos:</strong> {resultadosResumen.Ingresos}</div>
                      <div><strong>Ganancia Neta:</strong> {resultadosResumen.GananciaNeta}</div>
                      <div><strong>Nivel de Servicio:</strong> {resultadosResumen.NivelServicio}</div>
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
