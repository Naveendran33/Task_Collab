/**
 * TaskCollab — Sidebar Navigation Component
 */
const Sidebar = {
  currentWorkspace: null,

  setWorkspace(workspace) {
    this.currentWorkspace = workspace;
    this.render();
  },

  clearWorkspace() {
    this.currentWorkspace = null;
    this.render();
  },

  render() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar || !Auth.isLoggedIn()) {
      if (sidebar) sidebar.innerHTML = '';
      return;
    }

    const user = Auth.getUser() || { username: 'User', email: '' };
    const hash = window.location.hash.slice(1) || '/dashboard';
    const isDashboard = hash === '/dashboard' || hash === '' || hash === '/';
    const isWorkspace = hash.startsWith('/workspace');
    const isTasksTab = isWorkspace && !hash.includes('/members');
    const isMembersTab = isWorkspace && hash.includes('/members');

    let workspaceNavHtml = '';
    if (this.currentWorkspace) {
      const wsId = this.currentWorkspace.workspaceId || this.currentWorkspace.id;
      const wsName = Utils.escapeHtml(this.currentWorkspace.name || this.currentWorkspace.workspaceName || 'Workspace');

      workspaceNavHtml = `
        <div class="nav-section-title">Active Workspace</div>
        <div style="padding: 0 var(--space-3); margin-bottom: var(--space-2);">
          <div style="font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${wsName}
          </div>
        </div>
        <a href="#/workspace/${wsId}" class="nav-item ${isTasksTab ? 'active' : ''}">
          ${Icons.folder}
          <span>Tasks Board</span>
        </a>
        <a href="#/workspace/${wsId}/members" class="nav-item ${isMembersTab ? 'active' : ''}">
          ${Icons.users}
          <span>Team Members</span>
        </a>
      `;
    }

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <a href="#/dashboard" class="sidebar-logo">
          <div class="sidebar-logo-icon">TC</div>
          <span>TaskCollab</span>
        </a>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-title">Main</div>
        <a href="#/dashboard" class="nav-item ${isDashboard ? 'active' : ''}">
          ${Icons.dashboard}
          <span>Dashboard</span>
        </a>

        ${workspaceNavHtml}
      </nav>

      <div class="sidebar-user">
        <div class="user-info">
          ${Avatar.render(user.username, 'md')}
          <div class="user-text">
            <div class="user-name" title="${Utils.escapeHtml(user.username)}">${Utils.escapeHtml(user.username)}</div>
            ${user.email ? `<div class="user-email" title="${Utils.escapeHtml(user.email)}">${Utils.escapeHtml(user.email)}</div>` : ''}
          </div>
        </div>
        <button type="button" id="sidebar-logout-btn" class="btn-icon" title="Sign out" aria-label="Sign out">
          ${Icons.logout}
        </button>
      </div>
    `;

    const logoutBtn = sidebar.querySelector('#sidebar-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        Auth.logout();
        Toast.info('Signed out successfully');
      });
    }
  }
};
