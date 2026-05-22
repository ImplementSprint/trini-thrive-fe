"use client";

import { X, Lock } from "lucide-react";
import styles from "./SettingsMenuModal.module.css";

interface SettingsMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePasswordClick: () => void;
}

export default function SettingsMenuModal({ isOpen, onClose, onChangePasswordClick }: SettingsMenuModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Settings</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>
        
        <div className={styles.menuList}>
          <button className={styles.menuItem} onClick={onChangePasswordClick}>
            <Lock size={18} /> <span>Change Password</span>
          </button>
        </div>
      </div>
    </div>
  );
}