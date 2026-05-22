"use client";

import { CheckCircle2 } from "lucide-react";
import styles from "./DonationSuccessModal.module.css";

interface DonationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export default function DonationSuccessModal({ isOpen, onClose, data }: DonationSuccessModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <CheckCircle2 size={50} color="#22c55e" strokeWidth={1.5} />
          </div>
          
          <h2 className={styles.title}>Donation Sent Successfully!</h2>
          
          <div className={styles.infoBox}>
            <p>Donation of <span className={styles.amount}>{data.amount}</span> sent to <strong>{data.name}</strong></p>
          </div>

          <button className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}