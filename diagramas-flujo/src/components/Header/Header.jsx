import styles from "./Header.module.css";
import logo from "../../assets/logo.svg";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.row}>
          <div className={styles.brand}>
            <img src={logo} alt="logo" />
            <span>Generador de Números Aleatorios</span>
          </div>

          <nav className={styles.nav}>
            <Link to="/inicio" className={styles.link}>Inicio</Link>
            <Link to="/azucar" className={styles.link}>azucar</Link>
            <Link to="/tienda" className={styles.link}>tienda</Link>
            <Link to="/huevos" className={styles.link}>Huevos</Link>
            <Link to="/multiplicativo" className={styles.link}>Multiplicativo</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

