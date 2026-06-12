import Link from "next/link";
import styles from "./page.module.css";

const personas = [
  {
    href: "/admin/login",
    title: "Admin",
    description: "Manage applications, donors, and inventory across the platform.",
    accent: "#3B53C1",
  },
  {
    href: "/siteman/login",
    title: "Site Manager",
    description: "Run missions, review shifts, and coordinate on-site teams.",
    accent: "#0F766E",
  },
  {
    href: "/enduser/home",
    title: "End User",
    description: "Volunteer, donate, and track your contributions.",
    accent: "#B45309",
  },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>BayaniHub</h1>
          <p className={styles.subtitle}>
            Choose how you want to sign in.
          </p>
        </header>

        <div className={styles.grid}>
          {personas.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className={styles.card}
              style={{ borderTopColor: p.accent }}
            >
              <span className={styles.cardEyebrow} style={{ color: p.accent }}>
                Continue as
              </span>
              <h2 className={styles.cardTitle}>{p.title}</h2>
              <p className={styles.cardDescription}>{p.description}</p>
              <span className={styles.cardCta} style={{ color: p.accent }}>
                Go to {p.title} portal →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
