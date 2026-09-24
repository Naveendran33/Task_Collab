/**
 * TaskCollab — User Avatar Component
 */
const Avatar = {
  render(name = 'User', size = 'md', extraClass = '') {
    const initials = Utils.getInitials(name);
    const color = Utils.getAvatarColor(name);
    const escaped = Utils.escapeHtml(name);

    return `
      <div class="avatar avatar-${size} ${extraClass}" 
           style="background-color: ${color};" 
           title="${escaped}" 
           aria-label="${escaped}">
        ${initials}
      </div>
    `;
  }
};
