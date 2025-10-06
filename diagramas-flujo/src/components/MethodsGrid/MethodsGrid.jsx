import Card from "../Card/Card";
import styles from "./MethodsGrid.module.css";

const items = [
  {
    id: "cuadrados",
    title: "Cuadrados Medios",
    text:
      "Eleva al cuadrado la semilla y toma los dígitos centrales como número aleatorio."
  },
  {
    id: "productos",
    title: "Productos Medios",
    text:
      "Usa dos semillas; al multiplicarlas, se extraen los dígitos centrales del producto."
  },
  {
    id: "lineal",
    title: "Algoritmo Lineal",
    text:
      "Usa constante multiplicativa, incremento y módulo para generar la secuencia."
  },
  {
    id: "multiplicativo",
    title: "Algoritmo Multiplicativo",
    text:
      "Como el lineal pero sin incremento; depende solo de la multiplicación y el módulo."
  }
];

export default function MethodsGrid() {
  return (
    <section className="container" id="inicio" aria-label="Métodos de generación">
      <h1 className="section-title">Generación de Números Aleatorios</h1>
      <p className="section-subtitle">
        Los números aleatorios son clave en simulaciones, criptografía y estadística.
        Estos son algunos métodos clásicos para generarlos.
      </p>

      <div className={styles.grid}>
        {items.map((it) => (
          <Card key={it.id} title={it.title} onClick={() => console.log(it.id)}>
            {it.text}
          </Card>
        ))}
      </div>
    </section>
  );
}
