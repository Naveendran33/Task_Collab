/**
 * TaskCollab — Confirmation Dialog
 */
const ConfirmDialog = {
  show({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = true
  } = {}) {
    return new Promise((resolve) => {
      let resolved = false;

      const bodyHtml = `
        <p style="color: var(--text-secondary); line-height: 1.6; font-size: var(--text-sm);">
          ${Utils.escapeHtml(message)}
        </p>
      `;

      const confirmBtnClass = isDanger ? 'btn-danger' : 'btn-primary';
      const footerHtml = `
        <button type="button" class="btn btn-secondary" data-action="cancel">${Utils.escapeHtml(cancelText)}</button>
        <button type="button" class="btn ${confirmBtnClass}" data-action="confirm">${Utils.escapeHtml(confirmText)}</button>
      `;

      const modalInstance = Modal.open({
        title,
        bodyHtml,
        footerHtml,
        onClose: () => {
          if (!resolved) {
            resolved = true;
            resolve(false);
          }
        }
      });

      const confirmBtn = modalInstance.dialog.querySelector('[data-action="confirm"]');
      const cancelBtn = modalInstance.dialog.querySelector('[data-action="cancel"]');

      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          resolved = true;
          modalInstance.close();
          resolve(true);
        });
      }

      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          resolved = true;
          modalInstance.close();
          resolve(false);
        });
      }
    });
  }
};
