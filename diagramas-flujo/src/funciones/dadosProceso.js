
export function lanzarDado() {
  return Math.floor(Math.random() * 6) + 1;
}

export function simularJuegos({
  numSimulaciones,
  numJuegos,
  costoJuego,
  gananciaJugador
}) {
  let resultados = [];
  let sumaGanancia = 0;
  let sumaJuegosCasa = 0;
  let sumaPorcentaje = 0;

  for (let i = 1; i <= numSimulaciones; i++) {
    let gananciaCasa = 0;
    let juegosCasa = 0;

    for (let j = 0; j < numJuegos; j++) {
      const dado1 = lanzarDado();
      const dado2 = lanzarDado();
      const suma = dado1 + dado2;

      if (suma === 7) {
        // jugador gana → la casa pierde
        gananciaCasa -= gananciaJugador;
      } else {
        // casa gana → cobra el costo del juego
        gananciaCasa += costoJuego;
        juegosCasa++;
      }
    }

    const porcentajeCasa = (juegosCasa / numJuegos) * 100;

    resultados.push({
      num: i,
      ganancia: gananciaCasa,
      juegosCasa,
      porcentajeCasa: porcentajeCasa.toFixed(2),
    });

    sumaGanancia += gananciaCasa;
    sumaJuegosCasa += juegosCasa;
    sumaPorcentaje += porcentajeCasa;
  }

  // Cálculo de promedios
  const promedioGanancia = (sumaGanancia / numSimulaciones).toFixed(2);
  const promedioJuegos = (sumaJuegosCasa / numSimulaciones).toFixed(2);
  const promedioPorcentaje = (sumaPorcentaje / numSimulaciones).toFixed(2);

  return {
    resultados,
    promedio: {
      promedioGanancia,
      promedioJuegos,
      promedioPorcentaje,
    },
  };
}
