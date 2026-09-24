/**
 * TaskCollab — Dashboard Page
 */
const DashboardPage = {
  ownedWorkspaces: [],
  memberWorkspaces: [],
  searchQuery: '',

  async render() {
    const main = document.getElementById('main-content');
    const header = document.getElementById('app-header');
    if (!main) return;

    if (Sidebar) {
      Sidebar.clearWorkspace();
    }

    // Render breadcrumb and header controls
    if (header) {
      header.innerHTML = `
        <div class="header-left">
          <nav class="breadcrumb">
            <span class="breadcrumb-current">Dashboard</span>
          </nav>
        </div>
        <div class="header-right">
          <div class="input-icon-wrapper" style="width: 240px;">
            <span class="input-icon">${Icons.search}</span>
            <input 
              type="text" 
              id="header-workspace-search" 
              class="input btn-sm" 
              placeholder="Search workspaces..." 
              style="padding-top: 6px; padding-bottom: 6px;"
            />
          </div>
          <button type="button" class="btn btn-primary btn-sm" id="btn-create-workspace">
            ${Icons.plus}
            <span>New Workspace</span>
          </button>
        </div>
      `;

      // Header button handlers
      const searchInput = header.querySelector('#header-workspace-search');
      if (searchInput) {
        searchInput.addEventListener(
          'input',
          Utils.debounce((e) => {
            this.searchQuery = e.target.value.toLowerCase().trim();
            this.renderGrids();
          }, 200)
        );
      }

      const createBtn = header.querySelector('#btn-create-workspace');
      if (createBtn) {
        createBtn.addEventListener('click', () => this.openCreateWorkspaceModal());
      }
    }

    // Render page loading skeleton
    main.innerHTML = `
      <div class="dashboard-header animate-fadeIn">
        <div class="dashboard-title-group">
          <h1>Workspaces</h1>
          <p>Collaborate, organize tasks, and track real-time project progress.</p>
        </div>
      </div>

      <div class="workspace-section">
        <div class="section-header">
          <div class="section-title">
            <span>Owned by Me</span>
            <span class="section-count" id="owned-count">...</span>
          </div>
        </div>
        <div class="workspace-grid" id="owned-workspaces-grid">
          ${Loader.skeletonCards(3)}
        </div>
      </div>

      <div class="workspace-section">
        <div class="section-header">
          <div class="section-title">
            <span>Member of</span>
            <span class="section-count" id="member-count">...</span>
          </div>
        </div>
        <div class="workspace-grid" id="member-workspaces-grid">
          ${Loader.skeletonCards(2)}
        </div>
      </div>
    `;

    // Fetch data from API
    try {
      const [owned, member] = await Promise.all([
        API.getOwnedWorkspaces(),
        API.getMemberWorkspaces()
      ]);

      this.ownedWorkspaces = Array.isArray(owned) ? owned : [];
      this.memberWorkspaces = Array.isArray(member) ? member : [];

      this.renderGrids();
    } catch (err) {
      console.error('Failed to load workspaces:', err);
      Toast.error(err.message || 'Failed to load workspaces');
      main.innerHTML = Loader.emptyState({
        icon: Icons.alert,
        title: 'Error Loading Workspaces',
        description: err.message || 'Please check your connection and try again.',
        actionBtnHtml: `<button class="btn btn-secondary" onclick="Router.resolve()">${Icons.dashboard} Retry</button>`
      });
    }
  },

  renderGrids() {
    const ownedContainer = document.getElementById('owned-workspaces-grid');
    const memberContainer = document.getElementById('member-workspaces-grid');
    const ownedCount = document.getElementById('owned-count');
    const memberCount = document.getElementById('member-count');

    // Filter by search query
    const filteredOwned = this.ownedWorkspaces.filter((ws) => {
      const name = (ws.name || '').toLowerCase();
      const desc = (ws.description || '').toLowerCase();
      return name.includes(this.searchQuery) || desc.includes(this.searchQuery);
    });

    const filteredMember = this.memberWorkspaces.filter((ws) => {
      const name = (ws.workspaceName || ws.name || '').toLowerCase();
      return name.includes(this.searchQuery);
    });

    if (ownedCount) ownedCount.textContent = filteredOwned.length;
    if (memberCount) memberCount.textContent = filteredMember.length;

    // 1. Render Owned Workspaces
    if (ownedContainer) {
      if (filteredOwned.length === 0) {
        ownedContainer.innerHTML = `
          <div style="grid-column: 1 / -1;">
            ${Loader.emptyState({
              icon: Icons.folder,
              title: this.searchQuery ? 'No matching owned workspaces' : 'No workspaces yet',
              description: this.searchQuery ? 'Try a different search term.' : 'Create your first workspace to start collaborating on tasks.',
              actionBtnHtml: !this.searchQuery ? `
                <button type="button" class="btn btn-primary" id="empty-create-ws-btn">
                  ${Icons.plus} <span>Create Workspace</span>
                </button>
              ` : ''
            })}
          </div>
        `;

        const emptyBtn = ownedContainer.querySelector('#empty-create-ws-btn');
        if (emptyBtn) {
          emptyBtn.addEventListener('click', () => this.openCreateWorkspaceModal());
        }
      } else {
        ownedContainer.innerHTML = filteredOwned
          .map((ws) => {
            const wsId = ws.workspaceId || ws.id;
            return `
              <div class="card card-interactive workspace-card animate-fadeIn" data-workspace-id="${wsId}">
                <div>
                  <div class="workspace-card-top">
                    <h3 class="workspace-card-title" title="${Utils.escapeHtml(ws.name)}">${Utils.escapeHtml(ws.name)}</h3>
                    <div style="display: flex; align-items: center; gap: var(--space-2);">
                      ${Badge.role('OWNER')}
                      <button type="button" class="btn-icon btn-sm delete-ws-btn" title="Delete Workspace" data-ws-id="${wsId}" data-ws-name="${Utils.escapeHtml(ws.name)}">
                        ${Icons.trash}
                      </button>
                    </div>
                  </div>
                  <p class="workspace-card-desc">${Utils.escapeHtml(ws.description || 'No description provided.')}</p>
                </div>
                <div class="workspace-card-bottom">
                  <span>Created ${Utils.formatDate(ws.createdAt)}</span>
                  <span style="display: flex; align-items: center; gap: 4px; color: var(--accent-primary); font-weight: 500;">
                    Open ${Icons.chevronRight}
                  </span>
                </div>
              </div>
            `;
          })
          .join('');

        // Workspace card click handlers
        ownedContainer.querySelectorAll('.workspace-card').forEach((card) => {
          card.addEventListener('click', (e) => {
            if (e.target.closest('.delete-ws-btn')) return;
            const wsId = card.dataset.workspaceId;
            Router.navigate(`/workspace/${wsId}`);
          });
        });

        // Delete button handlers
        ownedContainer.querySelectorAll('.delete-ws-btn').forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const wsId = btn.dataset.wsId;
            const wsName = btn.dataset.wsName;

            const confirmed = await ConfirmDialog.show({
              title: 'Delete Workspace',
              message: `Are you sure you want to permanently delete "${wsName}"? All tasks, members, and comments in this workspace will be deleted. This cannot be undone.`,
              confirmText: 'Delete Workspace',
              isDanger: true
            });

            if (confirmed) {
              try {
                await API.deleteWorkspace(wsId);
                Toast.success(`Workspace "${wsName}" deleted`);
                this.ownedWorkspaces = this.ownedWorkspaces.filter((w) => (w.workspaceId || w.id) != wsId);
                this.renderGrids();
              } catch (delErr) {
                console.error('Delete workspace error:', delErr);
                Toast.error(delErr.message || 'Failed to delete workspace');
              }
            }
          });
        });
      }
    }

    // 2. Render Member Workspaces
    if (memberContainer) {
      if (filteredMember.length === 0) {
        memberContainer.innerHTML = `
          <div style="grid-column: 1 / -1;">
            ${Loader.emptyState({
              icon: Icons.users,
              title: this.searchQuery ? 'No matching member workspaces' : 'No memberships yet',
              description: this.searchQuery ? 'Try a different search keyword.' : 'When other workspace owners add you as a Worker or Viewer, their workspaces will appear here.'
            })}
          </div>
        `;
      } else {
        memberContainer.innerHTML = filteredMember
          .map((ws) => {
            const wsId = ws.workspaceId;
            const role = ws.role || 'WORKER';
            return `
              <div class="card card-interactive workspace-card animate-fadeIn" data-workspace-id="${wsId}">
                <div>
                  <div class="workspace-card-top">
                    <h3 class="workspace-card-title" title="${Utils.escapeHtml(ws.workspaceName)}">${Utils.escapeHtml(ws.workspaceName)}</h3>
                    ${Badge.role(role)}
                  </div>
                  <p class="workspace-card-desc">Participating as ${role.toLowerCase()}.</p>
                </div>
                <div class="workspace-card-bottom">
                  <span>Role: ${role}</span>
                  <span style="display: flex; align-items: center; gap: 4px; color: var(--accent-primary); font-weight: 500;">
                    Open ${Icons.chevronRight}
                  </span>
                </div>
              </div>
            `;
          })
          .join('');

        memberContainer.querySelectorAll('.workspace-card').forEach((card) => {
          card.addEventListener('click', () => {
            const wsId = card.dataset.workspaceId;
            Router.navigate(`/workspace/${wsId}`);
          });
        });
      }
    }
  },

  openCreateWorkspaceModal() {
    const bodyHtml = `
      <form id="create-workspace-form">
        <div class="form-group">
          <label class="form-label" for="ws-name">Workspace Name *</label>
          <input 
            type="text" 
            id="ws-name" 
            class="input" 
            placeholder="e.g. Mobile App Redesign" 
            required 
            maxlength="50"
            autofocus
          />
          <div class="form-error" id="err-ws-name" style="display: none;"></div>
        </div>

        <div class="form-group">
          <label class="form-label" for="ws-desc">Description</label>
          <textarea 
            id="ws-desc" 
            class="textarea" 
            placeholder="Brief purpose or goals of this workspace..." 
            rows="3"
            maxlength="250"
          ></textarea>
        </div>
      </form>
    `;

    const footerHtml = `
      <button type="button" class="btn btn-secondary" data-modal-cancel>Cancel</button>
      <button type="button" class="btn btn-primary" id="btn-submit-create-ws">
        <span>Create Workspace</span>
      </button>
    `;

    const modal = Modal.open({
      title: 'Create New Workspace',
      bodyHtml,
      footerHtml
    });

    const submitBtn = modal.dialog.querySelector('#btn-submit-create-ws');
    const nameInput = modal.dialog.querySelector('#ws-name');
    const descInput = modal.dialog.querySelector('#ws-desc');
    const errName = modal.dialog.querySelector('#err-ws-name');

    submitBtn.addEventListener('click', async () => {
      const name = nameInput.value.trim();
      const description = descInput.value.trim();

      if (!name) {
        errName.textContent = 'Workspace name is required';
        errName.style.display = 'flex';
        nameInput.classList.add('has-error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `${Loader.spinner('sm')} <span>Creating...</span>`;

      try {
        const created = await API.createWorkspace({ name, description });
        Toast.success(`Workspace "${name}" created successfully!`);
        modal.close();

        // Navigate directly to the newly created workspace
        const newWsId = created.workspaceId || created.id;
        Router.navigate(`/workspace/${newWsId}`);
      } catch (err) {
        console.error('Create workspace error:', err);
        errName.textContent = err.message || 'Failed to create workspace';
        errName.style.display = 'flex';
        nameInput.classList.add('has-error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Create Workspace</span>`;
      }
    });
  }
};
