import Header from "@/admin-components/Header";
import Footer from "@/admin-components/Footer";
import styles from "./legal.module.css";

export default function TermsOfService() {
  return (
    <div className={styles.container}>
      
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Administrator Responsibilities</p>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.intro}>
            These terms define acceptable use of the BayaniHub Admin Portal for relief coordination, volunteer verification, donor review, and inventory oversight.
          </p>
        </section>

        <div className={styles.grid}>
          <section className={styles.section}>
            <h2>Authorized Use</h2>
            <ul>
              <li>Use the portal only for official BayaniHub operations, verification, deployment, and reporting work.</li>
              <li>Keep login credentials private and sign out on shared or field devices.</li>
              <li>Do not approve, reject, delete, or alter records without a valid operational basis.</li>
            </ul>
          </section>
          <section className={styles.section}>
            <h2>Review Standards</h2>
            <ul>
              <li>Evaluate applications consistently against role requirements, uploaded documents, and mission capacity.</li>
              <li>Confirm donor pledges based on item details, condition, campaign relevance, and reachable contact information.</li>
              <li>Record decisions promptly so end-user portals and site-manager dashboards stay aligned.</li>
            </ul>
          </section>
          <section className={styles.section}>
            <h2>Operational Integrity</h2>
            <p>
              Admins must not create misleading campaigns, manipulate inventory counts, bypass QR or shift-review workflows, or use applicant data for non-relief purposes.
            </p>
          </section>
          <section className={styles.section}>
            <h2>System Availability</h2>
            <p>
              BayaniHub may be updated during active operations to improve reliability, security, and data accuracy. Report outages or inconsistent records immediately through the escalation process.
            </p>
          </section>
          <section className={`${styles.section} ${styles.wide}`}>
            <h2>Account Suspension</h2>
            <p>
              Access may be restricted for suspected misuse, unauthorized disclosure, repeated incorrect reviews, or activity that could compromise beneficiaries, volunteers, donors, or field teams.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
