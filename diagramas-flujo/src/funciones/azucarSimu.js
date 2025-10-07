// --- Simulación del inventario de azúcar ---
// Distribución de demanda: exponencial (media = meanDemand)
// Tiempo de entrega: uniforme entre 1 y 3 días (entero)
// Cada 7 días se revisa el inventario y se ordena lo necesario

// ======== FUNCIONES AUXILIARES ========

// Genera un número aleatorio exponencial con media `mean`
function expRand(mean) {
    const u = Math.random();
    return -Math.log(1 - u) * mean;
  }
  
  // Genera un número aleatorio entero entre a y b (incluidos)
  function uniformRandInt(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }
  
  // ======== FUNCIÓN PRINCIPAL ========
  
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
  
    // Variables de estado
    let CD = 0; // Día actual
    let IAZU = initialInventory; // Inventario actual
    let PAZU = 0; // Pedido del día
    let TENT = "-"; // Tiempo de entrega
    let pendingOrders = [];
  
    // Costos acumulados
    let CTORD = 0;
    let CTADQ = 0;
    let CTINV = 0;
    let CTOT = 0;
  
    // Resultados globales
    let totalDemand = 0;
    let totalSold = 0;
    let totalLost = 0;
    let revenue = 0;
  
    // Tabla de resultados diarios
    const tabla = [];
  
    for (CD = 1; CD <= horizonDays; CD++) {
      // Llegan pedidos
      for (let i = pendingOrders.length - 1; i >= 0; i--) {
        if (pendingOrders[i].arrivalDay === CD) {
          IAZU = Math.min(IAZU + pendingOrders[i].qty, capacity);
          pendingOrders.splice(i, 1);
        }
      }
  
      // Revisión de inventario y pedido (cada 7 días)
      PAZU = 0;
      if (CD % reviewPeriod === 0) {
        const orderQty = Math.max(0, capacity - IAZU);
        if (orderQty > 0) {
          PAZU = orderQty;
          const lead = uniformRandInt(1, 3); // ENTERO entre 1 y 3
          const arrivalDay = CD + lead;
          pendingOrders.push({ qty: orderQty, arrivalDay });
          TENT = lead;
  
          CTORD += orderCost;
          CTADQ += orderQty * unitAcqCost;
        } else {
          TENT = pendingOrders.length > 0
            ? Math.min(...pendingOrders.map(o => o.arrivalDay - CD))
            : "-";
        }
      } else {
        // Actualiza TENT según el pedido más próximo
        if (pendingOrders.length > 0) {
          TENT = Math.min(...pendingOrders.map(o => o.arrivalDay - CD));
        } else {
          TENT = "-";
        }
      }
  
      // Demanda diaria (REDONDEADA A ENTERO)
      const DAZU = Math.round(expRand(meanDemand));
      totalDemand += DAZU;
  
      const sold = Math.min(IAZU, DAZU);
      const lost = DAZU - sold;
  
      totalSold += sold;
      totalLost += lost;
      revenue += sold * unitSellPrice;
      IAZU -= sold;
  
      // Costos
      CTINV += IAZU * carryCostPerKgDay;
      CTOT = CTORD + CTADQ + CTINV;
  
      // Guardar resultados del día
      tabla.push({
        Día: CD,
        Inventario: IAZU.toFixed(2),
        Demanda: DAZU,
        Pedido: PAZU,
        TiempoEntrega: Number.isFinite(TENT) ? TENT : "-",
        CostoOrden: CTORD.toFixed(2),
        CostoAdquisicion: CTADQ.toFixed(2),
        CostoInventario: CTINV.toFixed(2),
        CostoTotal: CTOT.toFixed(2),
        PerdidaAcumulada: totalLost,
      });
    }
  
    // Resultados finales
    const resultados = {
      DemandaTotal: totalDemand,
      TotalVendido: totalSold,
      DemandaInsatisfecha: totalLost,
      CostoTotal: CTOT.toFixed(2),
      Ingresos: revenue.toFixed(2),
      GananciaNeta: (revenue - CTOT).toFixed(2),
      NivelServicio: ((totalSold / totalDemand) * 100).toFixed(2) + "%",
    };
  
    return { tabla, resultados };
  }
  
  // ======== EJECUCIÓN ========
  
  const salida = simularInventario({
    horizonDays: 27,
    capacity: 700,
    meanDemand: 100,
    orderCost: 100,
    carryCostPerKgDay: 0.1,
    unitAcqCost: 3.5,
    unitSellPrice: 5.0,
    initialInventory: 700,
  });
  
  console.table(salida.tabla);
  console.log("=== RESULTADOS ===");
  console.log(salida.resultados);
  