/**
 * TaskCollab — Badges Component
 */
const Badge = {
  status(status) {
    if (!status) return '';
    const normalized = String(status).toUpperCase();
    const label = normalized.replace('_', ' ');
    const cls = normalized.toLowerCase();
    return `<span class="badge badge-status-${cls}">${label}</span>`;
  },

  priority(priority) {
    if (!priority) return '';
    const normalized = String(priority).toUpperCase();
    const cls = normalized.toLowerCase();
    return `<span class="badge badge-priority-${cls}">${normalized}</span>`;
  },

  role(role) {
    if (!role) return '';
    const normalized = String(role).toUpperCase();
    const cls = normalized.toLowerCase();
    return `<span class="badge badge-role-${cls}">${normalized}</span>`;
  }
};
