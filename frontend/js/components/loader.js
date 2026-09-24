/**
 * TaskCollab — Loader, Skeletons & Empty States
 */
const Loader = {
  spinner(size = '') {
    const sizeCls = size === 'sm' ? 'spinner-sm' : '';
    return `<div class="spinner ${sizeCls}" role="status" aria-label="Loading"></div>`;
  },

  skeletonCards(count = 3) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="card skeleton skeleton-card"></div>
      `;
    }
    return html;
  },

  skeletonRows(count = 4) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <tr>
          <td><div class="skeleton" style="height: 16px; width: 140px;"></div></td>
          <td><div class="skeleton" style="height: 16px; width: 200px;"></div></td>
          <td><div class="skeleton" style="height: 22px; width: 80px; border-radius: 9999px;"></div></td>
          <td><div class="skeleton" style="height: 16px; width: 60px;"></div></td>
        </tr>
      `;
    }
    return html;
  },

  emptyState({ icon, title, description, actionBtnHtml = '' }) {
    return `
      <div class="empty-state animate-fadeIn">
        <div class="empty-state-icon">
          ${icon || Icons.folder}
        </div>
        <h3 class="empty-state-title">${Utils.escapeHtml(title)}</h3>
        <p class="empty-state-desc">${Utils.escapeHtml(description)}</p>
        ${actionBtnHtml}
      </div>
    `;
  }
};
