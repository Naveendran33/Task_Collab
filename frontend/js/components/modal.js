/**
 * TaskCollab — Native Dialog Modal Component
 */
const Modal = {
  activeDialog: null,

  open({ title, bodyHtml, footerHtml = '', onClose = null }) {
    // Close any currently open modal
    this.close();

    const dialog = document.createElement('dialog');
    dialog.className = 'modal-dialog';
    dialog.setAttribute('closedby', 'any');
    dialog.setAttribute('aria-labelledby', 'modal-dialog-title');

    dialog.innerHTML = `
      <div class="modal-panel animate-slideUp">
        <div class="modal-header">
          <h3 id="modal-dialog-title">${Utils.escapeHtml(title)}</h3>
          <button type="button" class="btn-icon modal-close-btn" aria-label="Close dialog">
            ${Icons.close}
          </button>
        </div>
        <div class="modal-body">
          ${bodyHtml}
        </div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>
    `;

    document.body.appendChild(dialog);
    this.activeDialog = dialog;

    const handleClose = () => {
      if (typeof onClose === 'function') {
        try {
          onClose();
        } catch (e) {
          console.error('Error in modal onClose:', e);
        }
      }
      dialog.remove();
      if (this.activeDialog === dialog) {
        this.activeDialog = null;
      }
    };

    dialog.addEventListener('close', handleClose);

    // Light-dismiss click-outside fallback for browsers without native closedby support
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isInContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isInContent) {
          dialog.close();
        }
      });
    }

    // Close button
    const closeBtn = dialog.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => dialog.close());
    }

    // Cancel buttons inside body or footer
    dialog.querySelectorAll('[data-modal-cancel]').forEach((btn) => {
      btn.addEventListener('click', () => dialog.close());
    });

    dialog.showModal();

    return {
      dialog,
      close: () => dialog.close()
    };
  },

  close() {
    if (this.activeDialog) {
      try {
        this.activeDialog.close();
      } catch {}
      this.activeDialog = null;
    }
  }
};
