import Header from "@/admin-components/Header";
import Footer from "@/admin-components/Footer";
import styles from "./legal.module.css";

export default function HelpCenter() {
  return (
    <div className={styles.container}>
      
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Admin Operations Support</p>
          <h1 className={styles.title}>Help Center</h1>
          <p className={styles.intro}>
            Guidance for reviewing volunteer applications, donor pledges, inventory campaigns, and shift records during BayaniHub relief operations.
          </p>
        </section>

        <div className={styles.grid}>
          <section className={styles.section}>
            <h2>Application Review</h2>
            <ul>
              <li>Use Volunteer Applications to verify identity, role fit, and required credentials before approval.</li>
              <li>Open Uploaded Documents from the review page and inspect files in the secure preview panel.</li>
              <li>Reject only with a clear operational reason so the applicant can correct missing or invalid details.</li>
            </ul>
          </section>
          <section className={styles.section}>
            <h2>Donor Review</h2>
            <ul>
              <li>Confirm item quantity, condition, campaign assignment, and contact information before accepting a pledge.</li>
              <li>Rejected or failed donor records should be reserved for duplicate, invalid, or unreachable submissions.</li>
              <li>Multiple donations from the same donor are allowed when each pledge has distinct items or drop-off details.</li>
            </ul>
          </section>
          <section className={styles.section}>
            <h2>Inventory Control</h2>
            <ul>
              <li>Review Donation Inventory tracks campaign targets, received quantities, and active distribution status.</li>
              <li>Export filtered records before audits, handoffs, or manual reconciliation with site managers.</li>
              <li>Keep campaign names specific to the operation, location, and aid type for easier cross-system matching.</li>
            </ul>
          </section>
          <section className={`${styles.section} ${styles.wide}`}>
            <h2>Escalation</h2>
            <p>
              For urgent account access, suspicious records, broken QR validation, or incorrect mission assignment, contact the BayaniHub system administrator and include the applicant or donor reference ID, page name, timestamp, and screenshots when available.
            </p>
            <div className={styles.contactPanel}>
              Recommended response window: critical field-operation blockers within 1 hour, account access within 4 hours, standard data corrections within 1 business day.
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
