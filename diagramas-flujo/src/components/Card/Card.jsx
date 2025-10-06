import styles from "./Card.module.css";

export default function Card({ title, children, onClick }) {
  return (
    <article className={styles.card} onClick={onClick} role="button">
      <div className={styles.head}>{title}</div>
      <div className={styles.body}>{children}</div>
    </article>
  );
}
