/**
 * TaskCollab — Toast Notification System
 */
const Toast = {
  getContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  },

  show(message, type = 'info', duration = 4000) {
    const container = this.getContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = Icons.check;
    if (type === 'error') iconSvg = Icons.alert;
    else if (type === 'info') iconSvg = Icons.sparkle;

    toast.innerHTML = `
      <span class="toast-icon">${iconSvg}</span>
      <div class="toast-message">${Utils.escapeHtml(message)}</div>
      <button type="button" class="toast-close" aria-label="Close notification">
        ${Icons.close}
      </button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    let timer = null;

    const dismiss = () => {
      if (timer) clearTimeout(timer);
      toast.classList.add('dismissing');
      setTimeout(() => {
        toast.remove();
      }, 250);
    };

    closeBtn.addEventListener('click', dismiss);

    if (duration > 0) {
      timer = setTimeout(dismiss, duration);
    }

    container.appendChild(toast);
    return dismiss;
  },

  success(message, duration = 4000) {
    return this.show(message, 'success', duration);
  },

  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  },

  info(message, duration = 4000) {
    return this.show(message, 'info', duration);
  }
};
