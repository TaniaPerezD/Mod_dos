/* global BigInt */
// randomGenerators.js
// Lógica de generadores congruenciales (Lineal y Multiplicativo) usando BigInt
// Soporta dos modos para "p":
//   - pEsCantidad=false (por defecto): p es el módulo m directamente (debe ser potencia de 2)
//   - pEsCantidad=true          : p es la CANTIDAD de números a generar; el método deriva g y m con
//                                 g = floor(log2(p)) + 2  y  m = 2^g, y usa n = p si no se pasa n.

/** Convierte a BigInt de forma segura */
const B = (v) => {
  if (typeof v === "bigint") return v;
  if (typeof v === "number") return BigInt(Math.trunc(v));
  if (typeof v === "string") return BigInt(v.trim());
  throw new TypeError("Valor no convertible a BigInt: " + v);
};

/** Máximo común divisor para BigInt */
const gcdBI = (a, b) => {
  a = B(a < 0n ? -a : a);
  b = B(b < 0n ? -b : b);
  while (b !== 0n) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
};

/** ¿Es potencia de dos? (para BigInt) */
const isPow2BI = (m) => {
  m = B(m);
  return m > 0n && (m & (m - 1n)) === 0n;
};

/** log2 entero de una potencia de dos (para BigInt) */
const ilog2Pow2BI = (m) => {
  m = B(m);
  if (!isPow2BI(m)) throw new Error("m debe ser potencia de 2");
  let g = -1n;
  while (m > 0n) {
    m >>= 1n;
    g++;
  }
  return Number(g);
};

/** Deriva m y g desde la cantidad p (números a generar): g=floor(log2(p))+2; m=2^g */
const deriveMFromCount = (pCount) => {
  const pNum = Number(pCount);
  if (!Number.isFinite(pNum) || pNum <= 0) throw new Error("p (cantidad) debe ser > 0");
  const g = Math.floor(Math.log2(pNum)) + 2;
  const m = 1n << BigInt(g); // 2^g
  return { m, g };
};

/** Normaliza xi a [0,1) como Number. */
const normalize01 = (xi, m) => {
  const denom = Number(m - 1n);
  const num = Number(xi);
  return denom > 0 ? num / denom : 0;
};

/** Valida entradas básicas */
const assertBasic = (params, necesitaC) => {
  const { x0, k, p, d, n, pEsCantidad } = params;
  if ([x0, k, p, d].some((v) => v === undefined || v === null))
    throw new Error("Faltan parámetros requeridos: x0, k, p, d.");
  if (necesitaC && params.c === undefined)
    throw new Error("Falta parámetro: c.");
  if (!pEsCantidad) {
    if (n === undefined || n === null) throw new Error("Falta n (cantidad).");
    if (B(n) <= 0n) throw new Error("n debe ser > 0.");
  }
  if (B(p) <= 0n) throw new Error("p debe ser > 0.");
  if (B(d) < 0n) throw new Error("D (decimales) debe ser >= 0.");
};

/**
 * Generador Congruencial Lineal (LCG con c>0):
 * Xi+1 = (a * Xi + c) mod m
 * Teoría:  m = 2^g  (potencia de 2),  a = 1 + 4k,  c coprimo con m,  g = log2(m)
 * Si pEsCantidad=true: p es la CANTIDAD; se deriva m y g como arriba.
 * Devuelve filas { i, xiPrev, operacion, xi, ri } y rows.meta = { a, m, g }
 */
export function lcgLineal({ x0, k, c, p, d, n, pEsCantidad = false }) {
  assertBasic({ x0, k, p, d, n, c, pEsCantidad }, true);

  const a = 1n + 4n * B(k);

  let m, g, N;
  if (pEsCantidad) {
    const { m: mDer, g: gDer } = deriveMFromCount(Number(p));
    m = mDer;
    g = gDer;
    N = Number(n ?? p);
  } else {
    m = B(p);
    if (!isPow2BI(m)) throw new Error("Para el generador lineal, m (=P) debe ser potencia de 2 (m = 2^g).");
    g = ilog2Pow2BI(m);
    N = Number(n);
  }

  if (gcdBI(B(c), m) !== 1n) throw new Error("Para el generador lineal, c debe ser relativamente primo con m.");

  let xi = B(x0);
  const rows = [];
  rows.meta = { a: a.toString(), m: m.toString(), g };

  for (let i = 1; i <= N; i++) {
    const xiPrev = xi;
    const operacion = `(${a.toString()} * ${xiPrev.toString()} + ${B(c).toString()}) mod ${m.toString()}`;
    xi = (a * xi + B(c)) % m;
    const ri = normalize01(xi, m); // sin redondear aquí; la UI formatea con d decimales
    rows.push({ i, xiPrev: xiPrev.toString(), operacion, xi: xi.toString(), ri });
  }
  return rows;
}

/**
 * Generador Congruencial Multiplicativo (c=0):
 * Xi+1 = (a * Xi) mod m
 * Teoría:  m = 2^g (potencia de 2),  a = 3+8k **o** 5+8k,  X0 impar,  g = log2(m)
 * Si pEsCantidad=true: p es la CANTIDAD; se deriva m y g como arriba.
 * Devuelve filas { i, xiPrev, operacion, xi, ri } y rows.meta = { a, m, g }
 */
export function lcgMultiplicativo({ x0, k, p, d, n, opcionA = "3+8k", pEsCantidad = false }) {
  assertBasic({ x0, k, p, d, n, pEsCantidad }, false);

  let m, g, N;
  if (pEsCantidad) {
    const { m: mDer, g: gDer } = deriveMFromCount(Number(p));
    m = mDer;
    g = gDer;
    N = Number(n ?? p);
  } else {
    m = B(p);
    if (!isPow2BI(m)) throw new Error("Para el generador multiplicativo, m (=P) debe ser potencia de 2 (m = 2^g).");
    g = ilog2Pow2BI(m);
    N = Number(n);
  }

  if ((B(x0) & 1n) === 0n) throw new Error("Para el generador multiplicativo, x0 debe ser impar.");

  const base = opcionA === "5+8k" ? 5n : 3n;
  const a = base + 8n * B(k);

  let xi = B(x0);
  const rows = [];
  rows.meta = { a: a.toString(), m: m.toString(), g };

  for (let i = 1; i <= N; i++) {
    const xiPrev = xi;
    const operacion = `(${a.toString()} * ${xiPrev.toString()}) mod ${m.toString()}`;
    xi = (a * xi) % m;
    const ri = normalize01(xi, m); // sin redondear aquí; la UI formatea con d decimales
    rows.push({ i, xiPrev: xiPrev.toString(), operacion, xi: xi.toString(), ri });
  }
  return rows;
}

/** Obtiene a, m y g para el algoritmo lineal a partir de m (no cantidad) */
export function linealParametros({ k, m, c }) {
  const a = 1n + 4n * B(k);
  const mBI = B(m);
  if (!isPow2BI(mBI)) throw new Error("Para el generador lineal, m debe ser potencia de 2.");
  if (gcdBI(B(c), mBI) !== 1n) throw new Error("Para el generador lineal, c debe ser relativamente primo con m.");
  const g = ilog2Pow2BI(mBI);
  return { a: a.toString(), m: mBI.toString(), g };
}

/** Devuelve solo el arreglo de ri (útil si no necesitas la tabla completa) */
export function soloRi(rows) { return rows.map((r) => r.ri); }