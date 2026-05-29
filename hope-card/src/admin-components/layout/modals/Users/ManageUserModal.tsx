'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import BaseModal from '../shared/BaseModal';
import styles from './ManageUserModal.module.css';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'Donor' | 'Beneficiary' | 'Campaign Manager';
  status: string;
}

interface ManageUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ManageUserModal({
  isOpen,
  user,
  onClose,
  onSuccess,
}: ManageUserModalProps) {
  const [selectedAction, setSelectedAction] = useState<
    'suspend' | 'ban' | 'reactivate' | null
  >(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!isOpen || !user) return null;

  const isActive = user.status === 'approved' || user.status === 'active';
  const isSuspendedOrBanned =
    user.status === 'suspended' || user.status === 'banned';

  const handleAction = async () => {
    if (!selectedAction || !reason.trim()) {
      setMessage({
        type: 'error',
        text: 'Please select an action and provide a reason',
      });
      return;
    }

    if (reason.trim().length < 3) {
      setMessage({
        type: 'error',
        text: 'Reason must be at least 3 characters',
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');

      if (!token) {
        setMessage({ type: 'error', text: 'Authentication token not found' });
        return;
      }

      const response = await fetch(
        `/admin/api/users/${user.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status:
              selectedAction === 'reactivate' ? 'active' : selectedAction,
            reason: reason.trim(),
            role: user.role,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to update user: ${response.status}`,
        );
      }

      setMessage({
        type: 'success',
        text: `User account ${selectedAction === 'reactivate' ? 'reactivated' : selectedAction} successfully`,
      });

      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedAction(null);
    setReason('');
    setMessage(null);
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Manage User Account">
      <div className={styles.container}>
        {/* User Info */}
        <div className={styles.userInfo}>
          <div className={styles.infoField}>
            <label>Name</label>
            <p>{`${user.first_name} ${user.last_name}`}</p>
          </div>
          <div className={styles.infoField}>
            <label>Email</label>
            <p>{user.email}</p>
          </div>
          <div className={styles.infoField}>
            <label>Role</label>
            <p>{user.role}</p>
          </div>
          <div className={styles.infoField}>
            <label>Current Status</label>
            <p className={styles.status}>
              {user.status === 'approved'
                ? 'Active'
                : user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </p>
          </div>
        </div>

        {/* Action Selection */}
        <div className={styles.actions}>
          {isActive && (
            <>
              <button
                onClick={() => {
                  setSelectedAction('suspend');
                  setReason('');
                  setMessage(null);
                }}
                className={`${styles.actionButton} ${
                  selectedAction === 'suspend' ? styles.selected : ''
                }`}
              >
                Suspend Account
              </button>
              <button
                onClick={() => {
                  setSelectedAction('ban');
                  setReason('');
                  setMessage(null);
                }}
                className={`${styles.actionButton} ${
                  selectedAction === 'ban' ? styles.selected : ''
                }`}
              >
                Ban Account
              </button>
            </>
          )}
          {isSuspendedOrBanned && (
            <button
              onClick={() => {
                setSelectedAction('reactivate');
                setReason('');
                setMessage(null);
              }}
              className={`${styles.actionButton} ${
                selectedAction === 'reactivate' ? styles.selected : ''
              }`}
            >
              Reactivate Account
            </button>
          )}
        </div>

        {/* Reason Field */}
        {selectedAction && (
          <div className={styles.reasonSection}>
            <label htmlFor="reason">
              Reason for Action <span className={styles.required}>*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 500))}
              placeholder="Please explain why this action is being taken..."
              maxLength={500}
              className={styles.textarea}
              disabled={loading}
            />
            <div className={styles.charCount}>
              {reason.length}/500 characters
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.type === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Footer Buttons */}
        <div className={styles.footer}>
          <button
            onClick={handleClose}
            className={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </button>
          {selectedAction && (
            <button
              onClick={handleAction}
              className={styles.confirmButton}
              disabled={loading || !reason.trim()}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
