/**
 * TaskCollab — Workspace Detail Page (Kanban Board & Members Management)
 */
const WorkspacePage = {
  workspaceId: null,
  workspace: null,
  currentUserRole: 'VIEWER', // Default until loaded
  currentMemberId: null,
  tasks: [],
  members: [],
  activeTab: 'tasks',
  taskFilter: 'all', // 'all' | 'mine'

  async render(params) {
    this.workspaceId = params.workspaceId;
    this.activeTab = params.tab || 'tasks';

    const main = document.getElementById('main-content');
    const header = document.getElementById('app-header');
    if (!main) return;

    // Render skeleton initially
    main.innerHTML = `
      <div class="workspace-page-header animate-fadeIn">
        <div class="skeleton" style="height: 36px; width: 300px; margin-bottom: 8px;"></div>
        <div class="skeleton" style="height: 18px; width: 450px;"></div>
      </div>
      <div class="kanban-board">
        <div class="kanban-col col-todo"><div class="skeleton" style="height: 350px;"></div></div>
        <div class="kanban-col col-in-progress"><div class="skeleton" style="height: 350px;"></div></div>
        <div class="kanban-col col-done"><div class="skeleton" style="height: 350px;"></div></div>
      </div>
    `;

    try {
      // Fetch tasks and members in parallel
      const [tasksRes, membersRes] = await Promise.all([
        API.getTasks(this.workspaceId),
        API.getMembers(this.workspaceId)
      ]);

      this.tasks = Array.isArray(tasksRes) ? tasksRes : [];
      this.members = Array.isArray(membersRes) ? membersRes : [];

      // Determine current user's role and memberId
      const currentUser = Auth.getUser();
      const myMembership = this.members.find((m) => m.userId === currentUser?.userId);

      if (myMembership) {
        this.currentUserRole = myMembership.userRole || myMembership.role || 'VIEWER';
        this.currentMemberId = myMembership.workspaceMemberId || myMembership.memberId;
      } else {
        // Fallback: check if owned
        try {
          const owned = await API.getOwnedWorkspaces();
          const isOwner = owned.some((w) => (w.workspaceId || w.id) == this.workspaceId);
          if (isOwner) this.currentUserRole = 'OWNER';
        } catch {}
      }

      // Extract workspace info from tasks or members or fetch owned
      if (this.tasks.length > 0 && this.tasks[0].workspace) {
        this.workspace = this.tasks[0].workspace;
      } else if (this.members.length > 0 && this.members[0].workspaceName) {
        this.workspace = {
          workspaceId: this.workspaceId,
          name: this.members[0].workspaceName,
          description: ''
        };
      } else {
        // Fetch from owned list
        try {
          const owned = await API.getOwnedWorkspaces();
          const found = owned.find((w) => (w.workspaceId || w.id) == this.workspaceId);
          if (found) {
            this.workspace = found;
          } else {
            const memberWs = await API.getMemberWorkspaces();
            const mFound = memberWs.find((w) => w.workspaceId == this.workspaceId);
            this.workspace = {
              workspaceId: this.workspaceId,
              name: mFound ? mFound.workspaceName : `Workspace #${this.workspaceId}`,
              description: ''
            };
          }
        } catch {
          this.workspace = {
            workspaceId: this.workspaceId,
            name: `Workspace #${this.workspaceId}`,
            description: ''
          };
        }
      }

      // Update Sidebar with active workspace
      if (Sidebar) {
        Sidebar.setWorkspace(this.workspace);
      }

      // Render top header and breadcrumbs
      this.renderHeader();

      // Render tab contents
      if (this.activeTab === 'members') {
        this.renderMembersTab();
      } else {
        this.renderKanbanTab();
      }
    } catch (err) {
      console.error('Workspace load error:', err);
      Toast.error(err.message || 'Failed to load workspace');
      main.innerHTML = Loader.emptyState({
        icon: Icons.alert,
        title: 'Unable to Load Workspace',
        description: err.message || 'You may not have permission to view this workspace.',
        actionBtnHtml: `<a href="#/dashboard" class="btn btn-secondary">${Icons.dashboard} Back to Dashboard</a>`
      });
    }

    // Cleanup hook when navigating away
    return () => {
      if (window.TaskDetail) {
        TaskDetail.close();
      }
    };
  },

  renderHeader() {
    const header = document.getElementById('app-header');
    if (!header) return;

    const wsName = Utils.escapeHtml(this.workspace.name || 'Workspace');
    const isOwner = this.currentUserRole === 'OWNER';

    header.innerHTML = `
      <div class="header-left">
        <nav class="breadcrumb">
          <a href="#/dashboard">Dashboard</a>
          <span class="breadcrumb-separator">${Icons.chevronRight}</span>
          <span class="breadcrumb-current">${wsName}</span>
        </nav>
      </div>
      <div class="header-right">
        ${Badge.role(this.currentUserRole)}
        ${isOwner ? `
          <button type="button" class="btn btn-primary btn-sm" id="btn-create-task-header">
            ${Icons.plus} <span>Create Task</span>
          </button>
        ` : ''}
      </div>
    `;

    const createBtn = header.querySelector('#btn-create-task-header');
    if (createBtn) {
      createBtn.addEventListener('click', () => this.openCreateTaskModal());
    }
  },

  renderTabsNav() {
    return `
      <div class="tab-bar">
        <a href="#/workspace/${this.workspaceId}" class="tab-item ${this.activeTab === 'tasks' ? 'active' : ''}">
          ${Icons.folder}
          <span>Tasks</span>
          <span class="section-count">${this.tasks.length}</span>
        </a>
        <a href="#/workspace/${this.workspaceId}/members" class="tab-item ${this.activeTab === 'members' ? 'active' : ''}">
          ${Icons.users}
          <span>Members</span>
          <span class="section-count">${this.members.length}</span>
        </a>
      </div>
    `;
  },

  // ==========================================================================
  // KANBAN TAB
  // ==========================================================================
  renderKanbanTab() {
    const main = document.getElementById('main-content');
    if (!main) return;

    const wsName = Utils.escapeHtml(this.workspace.name || 'Workspace');
    const wsDesc = Utils.escapeHtml(this.workspace.description || '');
    const isOwner = this.currentUserRole === 'OWNER';

    main.innerHTML = `
      <div class="workspace-page-header animate-fadeIn">
        <div class="workspace-header-main">
          <div class="workspace-info">
            <h1>${wsName}</h1>
            ${wsDesc ? `<p>${wsDesc}</p>` : ''}
          </div>
          <div class="workspace-header-actions">
            ${isOwner ? `
              <button type="button" class="btn btn-primary" id="btn-create-task-main">
                ${Icons.plus} <span>New Task</span>
              </button>
            ` : ''}
          </div>
        </div>

        ${this.renderTabsNav()}

        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4);">
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            <button type="button" class="btn btn-sm ${this.taskFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" id="filter-all-tasks">
              All Tasks (${this.tasks.length})
            </button>
            <button type="button" class="btn btn-sm ${this.taskFilter === 'mine' ? 'btn-primary' : 'btn-secondary'}" id="filter-my-tasks">
              Assigned to Me
            </button>
          </div>
        </div>
      </div>

      <div class="kanban-board animate-fadeIn">
        <div class="kanban-col col-todo" data-status="TODO">
          <div class="kanban-col-header">
            <div class="kanban-col-title">
              <span>To Do</span>
              <span class="kanban-col-count" id="count-todo">0</span>
            </div>
          </div>
          <div class="task-list" id="col-list-todo"></div>
        </div>

        <div class="kanban-col col-in-progress" data-status="IN_PROGRESS">
          <div class="kanban-col-header">
            <div class="kanban-col-title">
              <span>In Progress</span>
              <span class="kanban-col-count" id="count-in_progress">0</span>
            </div>
          </div>
          <div class="task-list" id="col-list-in_progress"></div>
        </div>

        <div class="kanban-col col-done" data-status="DONE">
          <div class="kanban-col-header">
            <div class="kanban-col-title">
              <span>Done</span>
              <span class="kanban-col-count" id="count-done">0</span>
            </div>
          </div>
          <div class="task-list" id="col-list-done"></div>
        </div>
      </div>
    `;

    // Filter toggle listeners
    const btnAll = main.querySelector('#filter-all-tasks');
    const btnMine = main.querySelector('#filter-my-tasks');
    if (btnAll) {
      btnAll.addEventListener('click', () => {
        this.taskFilter = 'all';
        this.populateKanbanColumns();
        btnAll.className = 'btn btn-sm btn-primary';
        btnMine.className = 'btn btn-sm btn-secondary';
      });
    }
    if (btnMine) {
      btnMine.addEventListener('click', () => {
        this.taskFilter = 'mine';
        this.populateKanbanColumns();
        btnMine.className = 'btn btn-sm btn-primary';
        btnAll.className = 'btn btn-sm btn-secondary';
      });
    }

    const createBtnMain = main.querySelector('#btn-create-task-main');
    if (createBtnMain) {
      createBtnMain.addEventListener('click', () => this.openCreateTaskModal());
    }

    this.populateKanbanColumns();
  },

  populateKanbanColumns() {
    const listTodo = document.getElementById('col-list-todo');
    const listProgress = document.getElementById('col-list-in_progress');
    const listDone = document.getElementById('col-list-done');
    const countTodo = document.getElementById('count-todo');
    const countProgress = document.getElementById('count-in_progress');
    const countDone = document.getElementById('count-done');

    if (!listTodo || !listProgress || !listDone) return;

    const currentUser = Auth.getUser();

    // Filter tasks if 'mine' selected
    const filteredTasks = this.tasks.filter((task) => {
      if (this.taskFilter === 'mine') {
        const assignee = task.assignee;
        return assignee && assignee.userId === currentUser?.userId;
      }
      return true;
    });

    const todos = filteredTasks.filter((t) => t.status === 'TODO');
    const inProgress = filteredTasks.filter((t) => t.status === 'IN_PROGRESS');
    const done = filteredTasks.filter((t) => t.status === 'DONE');

    if (countTodo) countTodo.textContent = todos.length;
    if (countProgress) countProgress.textContent = inProgress.length;
    if (countDone) countDone.textContent = done.length;

    listTodo.innerHTML = this.renderTaskCardList(todos);
    listProgress.innerHTML = this.renderTaskCardList(inProgress);
    listDone.innerHTML = this.renderTaskCardList(done);

    // Attach card click handlers to open Task Detail slide-over
    document.querySelectorAll('.task-card').forEach((card) => {
      card.addEventListener('click', () => {
        const taskId = parseInt(card.dataset.taskId, 10);
        const task = this.tasks.find((t) => t.taskId === taskId);
        if (task && window.TaskDetail) {
          TaskDetail.open({
            task,
            workspace: this.workspace,
            currentUserRole: this.currentUserRole,
            members: this.members,
            onTaskUpdated: (updatedTask) => {
              const idx = this.tasks.findIndex((t) => t.taskId === updatedTask.taskId);
              if (idx !== -1) {
                this.tasks[idx] = updatedTask;
                this.populateKanbanColumns();
              }
            },
            onTaskDeleted: (delTaskId) => {
              this.tasks = this.tasks.filter((t) => t.taskId !== delTaskId);
              this.populateKanbanColumns();
            }
          });
        }
      });
    });
  },

  renderTaskCardList(taskList) {
    if (taskList.length === 0) {
      return `
        <div style="padding: var(--space-6) var(--space-4); text-align: center; color: var(--text-tertiary); font-size: var(--text-xs);">
          No tasks in this column
        </div>
      `;
    }

    return taskList
      .map((task) => {
        const isOverdue = Utils.isOverdue(task.dueDate, task.status);
        const assigneeName = task.assignee?.username || 'Unassigned';

        return `
          <div class="task-card" data-task-id="${task.taskId}">
            <div class="task-card-header">
              <span class="task-card-title">${Utils.escapeHtml(task.title)}</span>
              ${Badge.priority(task.priority)}
            </div>

            <div class="task-card-footer">
              <div class="task-card-meta-left">
                ${task.assignee ? Avatar.render(assigneeName, 'sm') : '<span style="font-size: 11px; color: var(--text-tertiary);">Unassigned</span>'}
                ${task.assignee ? `<span style="font-size: 11px; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${Utils.escapeHtml(assigneeName)}</span>` : ''}
              </div>
              <div class="task-card-meta-right">
                ${task.dueDate ? `
                  <div class="task-due-date ${isOverdue ? 'is-overdue' : ''}" title="Due: ${Utils.formatDate(task.dueDate)}">
                    ${Icons.calendar}
                    <span>${Utils.formatDate(task.dueDate)}</span>
                  </div>
                ` : ''}
                <div class="task-comment-count" title="Comments">
                  ${Icons.comment}
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  },

  openCreateTaskModal() {
    // Only WORKER or OWNER members can be assignees (VIEWERs cannot receive tasks)
    const assignableMembers = this.members.filter(
      (m) => (m.userRole || m.role) !== 'VIEWER'
    );

    const assigneeOptions = assignableMembers
      .map((m) => {
        const mId = m.workspaceMemberId || m.memberId;
        return `<option value="${mId}">${Utils.escapeHtml(m.username)} (${m.userRole || m.role})</option>`;
      })
      .join('');

    const bodyHtml = `
      <form id="create-task-form">
        <div class="form-group">
          <label class="form-label" for="task-title">Title *</label>
          <input 
            type="text" 
            id="task-title" 
            class="input" 
            placeholder="e.g. Implement user authentication" 
            required 
            maxlength="100"
            autofocus
          />
          <div class="form-error" id="err-task-title" style="display: none;"></div>
        </div>

        <div class="form-group">
          <label class="form-label" for="task-desc">Description</label>
          <textarea 
            id="task-desc" 
            class="textarea" 
            placeholder="Task objectives and details..." 
            rows="3"
          ></textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div class="form-group">
            <label class="form-label" for="task-priority">Priority *</label>
            <select id="task-priority" class="select">
              <option value="LOW">Low</option>
              <option value="MEDIUM" selected>Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="task-status">Status *</label>
            <select id="task-status" class="select">
              <option value="TODO" selected>To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div class="form-group">
            <label class="form-label" for="task-assignee">Assignee</label>
            <select id="task-assignee" class="select">
              <option value="">Unassigned</option>
              ${assigneeOptions}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="task-duedate">Due Date</label>
            <input type="date" id="task-duedate" class="input" />
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button type="button" class="btn btn-secondary" data-modal-cancel>Cancel</button>
      <button type="button" class="btn btn-primary" id="btn-submit-task">
        <span>Create Task</span>
      </button>
    `;

    const modal = Modal.open({
      title: 'Create New Task',
      bodyHtml,
      footerHtml
    });

    const submitBtn = modal.dialog.querySelector('#btn-submit-task');
    const titleInput = modal.dialog.querySelector('#task-title');
    const descInput = modal.dialog.querySelector('#task-desc');
    const prioritySelect = modal.dialog.querySelector('#task-priority');
    const statusSelect = modal.dialog.querySelector('#task-status');
    const assigneeSelect = modal.dialog.querySelector('#task-assignee');
    const duedateInput = modal.dialog.querySelector('#task-duedate');
    const errTitle = modal.dialog.querySelector('#err-task-title');

    submitBtn.addEventListener('click', async () => {
      const title = titleInput.value.trim();
      const description = descInput.value.trim();
      const priority = prioritySelect.value;
      const status = statusSelect.value;
      const assigneeMemberId = assigneeSelect.value ? parseInt(assigneeSelect.value, 10) : null;
      const rawDate = duedateInput.value;
      const dueDate = rawDate ? Utils.formatDateForApi(rawDate) : null;

      if (!title) {
        errTitle.textContent = 'Task title is required';
        errTitle.style.display = 'flex';
        titleInput.classList.add('has-error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `${Loader.spinner('sm')} <span>Creating...</span>`;

      try {
        const payload = {
          title,
          description,
          workspaceId: this.workspaceId,
          assigneeMemberId,
          status,
          priority,
          dueDate
        };

        const newTask = await API.createTask(payload);
        Toast.success(`Task "${title}" created!`);
        modal.close();

        this.tasks.push(newTask);
        this.populateKanbanColumns();
      } catch (err) {
        console.error('Create task error:', err);
        errTitle.textContent = err.message || 'Failed to create task';
        errTitle.style.display = 'flex';
        titleInput.classList.add('has-error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Create Task</span>`;
      }
    });
  },

  // ==========================================================================
  // MEMBERS TAB
  // ==========================================================================
  renderMembersTab() {
    const main = document.getElementById('main-content');
    if (!main) return;

    const wsName = Utils.escapeHtml(this.workspace.name || 'Workspace');
    const isOwner = this.currentUserRole === 'OWNER';

    main.innerHTML = `
      <div class="workspace-page-header animate-fadeIn">
        <div class="workspace-header-main">
          <div class="workspace-info">
            <h1>${wsName}</h1>
            <p>Manage workspace contributors and role permissions.</p>
          </div>
          <div class="workspace-header-actions">
            ${isOwner ? `
              <button type="button" class="btn btn-primary" id="btn-add-member">
                ${Icons.plus} <span>Add Member</span>
              </button>
            ` : ''}
          </div>
        </div>

        ${this.renderTabsNav()}
      </div>

      <div class="members-container animate-fadeIn">
        <div class="members-toolbar">
          <div style="font-weight: 600; font-size: var(--text-base); color: var(--text-primary);">
            Workspace Members (${this.members.length})
          </div>
          ${isOwner ? `
            <button type="button" class="btn btn-secondary btn-sm" id="btn-add-member-alt">
              ${Icons.plus} <span>Add Member</span>
            </button>
          ` : ''}
        </div>

        <table class="members-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              ${isOwner ? '<th style="text-align: right;">Actions</th>' : ''}
            </tr>
          </thead>
          <tbody id="members-table-body">
            ${this.renderMembersRows()}
          </tbody>
        </table>
      </div>
    `;

    // Add member handlers
    const addBtn = main.querySelector('#btn-add-member');
    const addBtnAlt = main.querySelector('#btn-add-member-alt');
    if (addBtn) addBtn.addEventListener('click', () => this.openAddMemberModal());
    if (addBtnAlt) addBtnAlt.addEventListener('click', () => this.openAddMemberModal());

    this.attachMemberRowListeners();
  },

  renderMembersRows() {
    const isOwner = this.currentUserRole === 'OWNER';
    const currentUserId = Auth.getUser()?.userId;

    if (this.members.length === 0) {
      return `
        <tr>
          <td colspan="${isOwner ? 3 : 2}" style="text-align: center; color: var(--text-tertiary); padding: var(--space-6);">
            No members found
          </td>
        </tr>
      `;
    }

    return this.members
      .map((member) => {
        const memberId = member.workspaceMemberId || member.memberId;
        const role = member.userRole || member.role;
        const isSelf = member.userId === currentUserId;
        const isMemberOwner = role === 'OWNER';

        return `
          <tr data-member-id="${memberId}">
            <td>
              <div class="member-user-cell">
                ${Avatar.render(member.username, 'md')}
                <div class="member-user-details">
                  <span class="member-username">${Utils.escapeHtml(member.username)} ${isSelf ? '<span style="font-size: 11px; color: var(--accent-primary);">(You)</span>' : ''}</span>
                  <span class="member-email">${Utils.escapeHtml(member.email || '')}</span>
                </div>
              </div>
            </td>
            <td>
              ${isOwner && !isMemberOwner && !isSelf ? `
                <select class="select member-role-select" data-member-id="${memberId}" style="width: 140px; padding-top: 4px; padding-bottom: 4px; font-size: var(--text-xs);">
                  <option value="WORKER" ${role === 'WORKER' ? 'selected' : ''}>Worker</option>
                  <option value="VIEWER" ${role === 'VIEWER' ? 'selected' : ''}>Viewer</option>
                </select>
              ` : Badge.role(role)}
            </td>
            ${isOwner ? `
              <td style="text-align: right;">
                ${!isMemberOwner && !isSelf ? `
                  <button type="button" class="btn-icon delete-member-btn" data-member-id="${memberId}" data-username="${Utils.escapeHtml(member.username)}" title="Remove member">
                    ${Icons.trash}
                  </button>
                ` : '<span style="font-size: var(--text-xs); color: var(--text-tertiary);">Owner</span>'}
              </td>
            ` : ''}
          </tr>
        `;
      })
      .join('');
  },

  attachMemberRowListeners() {
    const tableBody = document.getElementById('members-table-body');
    if (!tableBody) return;

    // Role update listener
    tableBody.querySelectorAll('.member-role-select').forEach((select) => {
      select.addEventListener('change', async () => {
        const memberId = select.dataset.memberId;
        const newRole = select.value;
        try {
          await API.updateRole(memberId, newRole);
          Toast.success(`Member role updated to ${newRole}`);
          const mem = this.members.find((m) => (m.workspaceMemberId || m.memberId) == memberId);
          if (mem) {
            mem.userRole = newRole;
            mem.role = newRole;
          }
        } catch (err) {
          console.error('Update role error:', err);
          Toast.error(err.message || 'Failed to update role');
          this.renderMembersTab();
        }
      });
    });

    // Remove member listener
    tableBody.querySelectorAll('.delete-member-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const memberId = btn.dataset.memberId;
        const username = btn.dataset.username;

        const confirmed = await ConfirmDialog.show({
          title: 'Remove Member',
          message: `Are you sure you want to remove "${username}" from this workspace? They will lose access to all tasks and comments.`,
          confirmText: 'Remove Member',
          isDanger: true
        });

        if (confirmed) {
          try {
            await API.deleteMember(memberId);
            Toast.success(`Removed "${username}" from workspace`);
            this.members = this.members.filter((m) => (m.workspaceMemberId || m.memberId) != memberId);
            this.renderMembersTab();
          } catch (err) {
            console.error('Delete member error:', err);
            Toast.error(err.message || 'Failed to remove member');
          }
        }
      });
    });
  },

  openAddMemberModal() {
    const bodyHtml = `
      <div>
        <div class="form-group">
          <label class="form-label" for="search-user-input">Search User *</label>
          <div class="input-icon-wrapper">
            <span class="input-icon">${Icons.search}</span>
            <input 
              type="text" 
              id="search-user-input" 
              class="input" 
              placeholder="Search by username..." 
              autocomplete="off"
              autofocus
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="add-member-role">Assign Role</label>
          <select id="add-member-role" class="select">
            <option value="WORKER" selected>Worker (Can be assigned tasks, comment)</option>
            <option value="VIEWER">Viewer (Read-only access)</option>
          </select>
        </div>

        <div style="font-size: var(--text-xs); font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: var(--space-2);">
          Search Results
        </div>
        <div id="user-search-results" style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-2);">
          <div style="color: var(--text-tertiary); font-size: var(--text-xs); padding: var(--space-4) 0; text-align: center;">
            Type a username above to search for registered users.
          </div>
        </div>
      </div>
    `;

    const footerHtml = `
      <button type="button" class="btn btn-secondary" data-modal-cancel>Close</button>
    `;

    const modal = Modal.open({
      title: 'Add Workspace Member',
      bodyHtml,
      footerHtml
    });

    const searchInput = modal.dialog.querySelector('#search-user-input');
    const roleSelect = modal.dialog.querySelector('#add-member-role');
    const resultsContainer = modal.dialog.querySelector('#user-search-results');

    searchInput.addEventListener(
      'input',
      Utils.debounce(async (e) => {
        const query = e.target.value.trim();
        if (!query) {
          resultsContainer.innerHTML = `
            <div style="color: var(--text-tertiary); font-size: var(--text-xs); padding: var(--space-4) 0; text-align: center;">
              Type a username above to search.
            </div>
          `;
          return;
        }

        resultsContainer.innerHTML = `
          <div style="text-align: center; padding: var(--space-3);">
            ${Loader.spinner('sm')}
          </div>
        `;

        try {
          const users = await API.searchUsers(query);
          if (!users || users.length === 0) {
            resultsContainer.innerHTML = `
              <div style="color: var(--text-tertiary); font-size: var(--text-xs); padding: var(--space-4) 0; text-align: center;">
                No users found matching "${Utils.escapeHtml(query)}"
              </div>
            `;
            return;
          }

          // Filter out users already in workspace
          resultsContainer.innerHTML = users
            .map((u) => {
              const alreadyMember = this.members.some((m) => m.userId === u.userId);
              return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) var(--space-3); background: var(--bg-tertiary); border-radius: var(--radius-md); border: 1px solid var(--border-default);">
                  <div style="display: flex; align-items: center; gap: var(--space-2);">
                    ${Avatar.render(u.username, 'sm')}
                    <div style="display: flex; flex-direction: column;">
                      <span style="font-size: var(--text-sm); font-weight: 600; color: var(--text-primary);">${Utils.escapeHtml(u.username)}</span>
                      <span style="font-size: 11px; color: var(--text-tertiary);">${Utils.escapeHtml(u.email || '')}</span>
                    </div>
                  </div>
                  ${alreadyMember
                    ? `<span style="font-size: var(--text-xs); color: var(--text-tertiary);">Already Member</span>`
                    : `
                      <button type="button" class="btn btn-primary btn-sm add-user-btn" data-user-id="${u.userId}" data-username="${Utils.escapeHtml(u.username)}">
                        ${Icons.plus} Add
                      </button>
                    `
                  }
                </div>
              `;
            })
            .join('');

          // Attach add button handlers
          resultsContainer.querySelectorAll('.add-user-btn').forEach((btn) => {
            btn.addEventListener('click', async () => {
              const userId = parseInt(btn.dataset.userId, 10);
              const username = btn.dataset.username;
              const role = roleSelect.value;

              btn.disabled = true;
              btn.innerHTML = `${Loader.spinner('sm')}`;

              try {
                const added = await API.addMember({
                  workspaceId: this.workspaceId,
                  userId,
                  role
                });

                Toast.success(`Added "${username}" as ${role}`);
                this.members.push(added);
                modal.close();
                this.renderMembersTab();
              } catch (err) {
                console.error('Add member error:', err);
                Toast.error(err.message || 'Failed to add member');
                btn.disabled = false;
                btn.innerHTML = `${Icons.plus} Add`;
              }
            });
          });
        } catch (searchErr) {
          console.error('User search error:', searchErr);
          resultsContainer.innerHTML = `
            <div style="color: var(--error); font-size: var(--text-xs); padding: var(--space-4) 0; text-align: center;">
              Search failed. Please try again.
            </div>
          `;
        }
      }, 300)
    );
  }
};
