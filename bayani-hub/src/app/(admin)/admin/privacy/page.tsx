import Header from "@/admin-components/Header";
import Footer from "@/admin-components/Footer";
import styles from "./legal.module.css";

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Data Stewardship</p>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.intro}>
            BayaniHub handles personal, operational, and document data for disaster-response coordination. Administrators are expected to access only the records needed for official review, deployment, and reporting duties.
          </p>
        </section>

        <div className={styles.grid}>
          <section className={styles.section}>
            <h2>Information We Process</h2>
            <ul>
              <li>Volunteer names, contact details, addresses, selected roles, availability, screening answers, and uploaded credentials.</li>
              <li>Donor contact details, pledged items, campaign assignment, drop-off information, and review status.</li>
              <li>Mission, QR validation, shift, inventory, and approval activity created across BayaniHub systems.</li>
            </ul>
          </section>
          <section className={styles.section}>
            <h2>How Data Is Used</h2>
            <ul>
              <li>To verify applicant eligibility and assign volunteers to appropriate field roles.</li>
              <li>To coordinate relief inventory, donor commitments, site capacity, and mission staffing.</li>
              <li>To maintain audit trails for approvals, rejections, clock-out reviews, and operational reports.</li>
            </ul>
          </section>
          <section className={styles.section}>
            <h2>Access Controls</h2>
            <p>
              Admin access is role-based and intended for authorized BayaniHub personnel. Document previews, applicant profiles, and donor records must not be copied, forwarded, or downloaded unless required for verified operational or legal purposes.
            </p>
          </section>
          <section className={styles.section}>
            <h2>Retention And Correction</h2>
            <p>
              Records are retained while missions, audits, and assistance programs remain active. Incorrect personal or operational data should be corrected promptly through the relevant review page or escalated to the system administrator.
            </p>
          </section>
          <section className={`${styles.section} ${styles.wide}`}>
            <h2>Incident Handling</h2>
            <p>
              Any suspected unauthorized access, exposed document link, incorrect approval, or misdirected notification must be reported immediately. Include affected record IDs and avoid sharing sensitive files outside approved channels.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
