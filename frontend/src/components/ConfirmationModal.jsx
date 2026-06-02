import React from 'react';

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.title}>{title || 'Подтверждение действия'}</h3>
        <p style={styles.message}>{message || 'Вы уверены?'}</p>
        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onClose}>Отмена</button>
          <button style={styles.confirmBtn} onClick={onConfirm}>Удалить</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modal: {
    backgroundColor: 'var(--bg-surface, #fff)',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
    width: '90%',
    maxWidth: '380px',
    textAlign: 'center',
    border: '1px solid var(--border-color, #e0e0e0)'
  },
  title: {
    marginTop: 0,
    color: 'var(--text-main, #333)',
    fontSize: '19px',
    fontWeight: '600',
  },
  message: {
    color: 'var(--text-muted, #666)',
    margin: '12px 0 24px 0',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
  },
  cancelBtn: {
    padding: '10px 18px',
    border: '1px solid var(--border-color, #ccc)',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: 'var(--text-main, #333)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  confirmBtn: {
    padding: '10px 18px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#ff5f1f', // Фирменный оранжевый Deala
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  }
};

export default ConfirmationModal;