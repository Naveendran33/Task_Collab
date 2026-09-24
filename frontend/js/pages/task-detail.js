/**
 * TaskCollab — Task Detail Slide-Over Panel & Live Comments
 */
const TaskDetail = {
  currentTaskId: null,
  activeBackdrop: null,
  comments: [],

  async open({ task, workspace, currentUserRole, members, onTaskUpdated, onTaskDeleted }) {
    this.close(); // Close any previously open panel

    this.currentTaskId = task.taskId;
    const currentUserId = Auth.getUser()?.userId;
    const isOwner = currentUserRole === 'OWNER';
    const isAssignee = task.assignee && task.assignee.userId === currentUserId;
    const canComment = isOwner || isAssignee;

    // Filter assignable members (only WORKER or OWNER, exclude VIEWER)
    const assignableMembers = members.filter(
      (m) => (m.userRole || m.role) !== 'VIEWER'
    );

    const backdrop = document.createElement('div');
    backdrop.className = 'slide-over-backdrop';

    backdrop.innerHTML = `
      <div class="slide-over-panel animate-slideInRight" role="dialog" aria-modal="true" aria-labelledby="task-detail-title">
        <div class="slide-over-header">
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);">
              ${Badge.status(task.status)}
              ${Badge.priority(task.priority)}
            </div>
            ${isOwner ? `
              <input 
                type="text" 
                id="task-title-edit" 
                class="task-detail-title-edit" 
                value="${Utils.escapeHtml(task.title)}" 
                title="Click to edit title"
              />
            ` : `
              <h2 id="task-detail-title" style="font-size: var(--text-xl); font-weight: 700; color: var(--text-primary); line-height: 1.3;">
                ${Utils.escapeHtml(task.title)}
              </h2>
            `}
          </div>
          <button type="button" class="btn-icon" id="close-slide-over-btn" aria-label="Close task details">
            ${Icons.close}
          </button>
        </div>

        <div class="slide-over-body">
          <!-- Task Metadata Card -->
          <div class="task-detail-grid">
            <!-- Status (Editable by Assignee only) -->
            <div class="task-detail-field-group">
              <span class="task-detail-label">Status</span>
              ${isAssignee ? `
                <select id="detail-task-status" class="select" style="padding-top: 4px; padding-bottom: 4px; font-size: var(--text-xs);">
                  <option value="TODO" ${task.status === 'TODO' ? 'selected' : ''}>To Do</option>
                  <option value="IN_PROGRESS" ${task.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
                  <option value="DONE" ${task.status === 'DONE' ? 'selected' : ''}>Done</option>
                </select>
              ` : `
                <span style="font-size: var(--text-sm); color: var(--text-primary); font-weight: 500;">
                  ${task.status.replace('_', ' ')}
                </span>
              `}
            </div>

            <!-- Priority (Editable by Owner only) -->
            <div class="task-detail-field-group">
              <span class="task-detail-label">Priority</span>
              ${isOwner ? `
                <select id="detail-task-priority" class="select" style="padding-top: 4px; padding-bottom: 4px; font-size: var(--text-xs);">
                  <option value="LOW" ${task.priority === 'LOW' ? 'selected' : ''}>Low</option>
                  <option value="MEDIUM" ${task.priority === 'MEDIUM' ? 'selected' : ''}>Medium</option>
                  <option value="HIGH" ${task.priority === 'HIGH' ? 'selected' : ''}>High</option>
                </select>
              ` : `
                <span style="font-size: var(--text-sm); color: var(--text-primary); font-weight: 500;">
                  ${task.priority}
                </span>
              `}
            </div>

            <!-- Assignee (Editable by Owner only) -->
            <div class="task-detail-field-group">
              <span class="task-detail-label">Assignee</span>
              ${isOwner ? `
                <select id="detail-task-assignee" class="select" style="padding-top: 4px; padding-bottom: 4px; font-size: var(--text-xs);">
                  <option value="">Unassigned</option>
                  ${assignableMembers.map((m) => {
                    const mId = m.workspaceMemberId || m.memberId;
                    const isSelected = task.assignee && (task.assignee.workspaceMemberId == mId || task.assignee.memberId == mId || task.assignee.userId == m.userId);
                    return `<option value="${mId}" ${isSelected ? 'selected' : ''}>${Utils.escapeHtml(m.username)}</option>`;
                  }).join('')}
                </select>
              ` : `
                <div style="display: flex; align-items: center; gap: var(--space-2);">
                  ${task.assignee ? Avatar.render(task.assignee.username, 'sm') : ''}
                  <span style="font-size: var(--text-sm); color: var(--text-primary);">
                    ${task.assignee ? Utils.escapeHtml(task.assignee.username) : 'Unassigned'}
                  </span>
                </div>
              `}
            </div>

            <!-- Due Date (Editable by Owner only) -->
            <div class="task-detail-field-group">
              <span class="task-detail-label">Due Date</span>
              ${isOwner ? `
                <input 
                  type="date" 
                  id="detail-task-duedate" 
                  class="input" 
                  value="${Utils.formatDateForInput(task.dueDate)}" 
                  style="padding-top: 3px; padding-bottom: 3px; font-size: var(--text-xs);"
                />
              ` : `
                <span style="font-size: var(--text-sm); color: var(--text-primary); font-weight: 500;">
                  ${Utils.formatDate(task.dueDate)}
                </span>
              `}
            </div>
          </div>

          <!-- Description (Editable by Owner) -->
          <div class="task-detail-field-group">
            <span class="task-detail-label">Description</span>
            ${isOwner ? `
              <textarea 
                id="detail-task-description" 
                class="textarea" 
                rows="3" 
                placeholder="Click to add a task description..."
              >${Utils.escapeHtml(task.description || '')}</textarea>
            ` : `
              <div style="font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; background: var(--bg-tertiary); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--border-default);">
                ${Utils.escapeHtml(task.description || 'No description provided.')}
              </div>
            `}
          </div>

          <!-- Live Comments Feed -->
          <div class="comments-container">
            <div class="comments-header">
              <span style="display: flex; align-items: center; gap: var(--space-2);">
                ${Icons.comment}
                <span>Discussion & Activity</span>
              </span>
              <span class="section-count" id="comment-feed-count">0</span>
            </div>

            <div class="comments-feed" id="comments-feed-list">
              <div style="text-align: center; padding: var(--space-4);">
                ${Loader.spinner('sm')}
              </div>
            </div>

            ${canComment ? `
              <form id="comment-add-form" class="comment-input-area">
                <textarea 
                  id="comment-input-text" 
                  class="textarea" 
                  placeholder="Write a comment..." 
                  rows="2" 
                  required
                ></textarea>
                <button type="submit" class="btn btn-primary btn-icon" id="comment-send-btn" title="Send comment" aria-label="Send comment">
                  ${Icons.send}
                </button>
              </form>
            ` : `
              <div style="font-size: var(--text-xs); color: var(--text-tertiary); text-align: center; padding: var(--space-2);">
                Only task assignees and workspace owners can post comments.
              </div>
            `}
          </div>
        </div>

        <div class="slide-over-footer">
          <span style="font-size: 11px; color: var(--text-tertiary);">
            Created ${Utils.timeAgo(task.createdAt)}
          </span>
          ${isOwner ? `
            <button type="button" class="btn btn-danger btn-sm" id="detail-delete-task-btn">
              ${Icons.trash} <span>Delete Task</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.activeBackdrop = backdrop;

    // Close handlers
    const closeBtn = backdrop.querySelector('#close-slide-over-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.close();
    });

    // ------------------------------------------------------------------------
    // OWNER ACTIONS: Inline Title, Description, Priority, Due Date, Reassign
    // ------------------------------------------------------------------------
    if (isOwner) {
      // 1. Title change (blur / enter)
      const titleInput = backdrop.querySelector('#task-title-edit');
      if (titleInput) {
        const saveTitle = async () => {
          const newTitle = titleInput.value.trim();
          if (!newTitle || newTitle === task.title) return;
          try {
            const updated = await API.updateTask(task.taskId, {
              name: newTitle,
              description: task.description,
              priority: task.priority
            });
            task.title = updated.title || newTitle;
            onTaskUpdated?.(task);
            Toast.success('Task title updated');
          } catch (err) {
            console.error('Update title error:', err);
            Toast.error(err.message || 'Failed to update title');
            titleInput.value = task.title;
          }
        };

        titleInput.addEventListener('blur', saveTitle);
        titleInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            titleInput.blur();
          }
        });
      }

      // 2. Description change (blur)
      const descInput = backdrop.querySelector('#detail-task-description');
      if (descInput) {
        descInput.addEventListener('blur', async () => {
          const newDesc = descInput.value.trim();
          if (newDesc === (task.description || '')) return;
          try {
            const updated = await API.updateTask(task.taskId, {
              name: task.title,
              description: newDesc,
              priority: task.priority
            });
            task.description = updated.description;
            onTaskUpdated?.(task);
            Toast.success('Task description updated');
          } catch (err) {
            console.error('Update description error:', err);
            Toast.error(err.message || 'Failed to update description');
            descInput.value = task.description || '';
          }
        });
      }

      // 3. Priority change
      const prioritySelect = backdrop.querySelector('#detail-task-priority');
      if (prioritySelect) {
        prioritySelect.addEventListener('change', async () => {
          const newPriority = prioritySelect.value;
          try {
            const updated = await API.updateTask(task.taskId, {
              name: task.title,
              description: task.description,
              priority: newPriority
            });
            task.priority = updated.priority;
            onTaskUpdated?.(task);
            Toast.success(`Priority set to ${newPriority}`);
          } catch (err) {
            console.error('Update priority error:', err);
            Toast.error(err.message || 'Failed to update priority');
            prioritySelect.value = task.priority;
          }
        });
      }

      // 4. Assignee change
      const assigneeSelect = backdrop.querySelector('#detail-task-assignee');
      if (assigneeSelect) {
        assigneeSelect.addEventListener('change', async () => {
          const newAssigneeId = assigneeSelect.value ? parseInt(assigneeSelect.value, 10) : null;
          if (!newAssigneeId) return;
          try {
            const updated = await API.assignTask(task.taskId, newAssigneeId);
            task.assignee = updated.assignee;
            onTaskUpdated?.(task);
            Toast.success(`Task reassigned to ${updated.assignee?.username}`);
          } catch (err) {
            console.error('Reassign error:', err);
            Toast.error(err.message || 'Failed to reassign task');
          }
        });
      }

      // 5. Due date change
      const dueDateInput = backdrop.querySelector('#detail-task-duedate');
      if (dueDateInput) {
        dueDateInput.addEventListener('change', async () => {
          const rawDate = dueDateInput.value;
          const formatted = Utils.formatDateForApi(rawDate);
          if (!formatted) return;
          try {
            const updated = await API.setDueDate(task.taskId, formatted);
            task.dueDate = updated.dueDate;
            onTaskUpdated?.(task);
            Toast.success(`Due date set to ${Utils.formatDate(task.dueDate)}`);
          } catch (err) {
            console.error('Set due date error:', err);
            Toast.error(err.message || 'Failed to set due date');
          }
        });
      }

      // 6. Delete task
      const deleteBtn = backdrop.querySelector('#detail-delete-task-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
          const confirmed = await ConfirmDialog.show({
            title: 'Delete Task',
            message: `Are you sure you want to permanently delete "${task.title}"?`,
            confirmText: 'Delete Task',
            isDanger: true
          });

          if (confirmed) {
            try {
              await API.deleteTask(task.taskId);
              Toast.success('Task deleted successfully');
              this.close();
              onTaskDeleted?.(task.taskId);
            } catch (err) {
              console.error('Delete task error:', err);
              Toast.error(err.message || 'Failed to delete task');
            }
          }
        });
      }
    }

    // ------------------------------------------------------------------------
    // ASSIGNEE ACTIONS: Status Dropdown
    // ------------------------------------------------------------------------
    if (isAssignee) {
      const statusSelect = backdrop.querySelector('#detail-task-status');
      if (statusSelect) {
        statusSelect.addEventListener('change', async () => {
          const newStatus = statusSelect.value;
          try {
            const updated = await API.changeStatus(task.taskId, newStatus);
            task.status = updated.status;
            onTaskUpdated?.(task);
            Toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
          } catch (err) {
            console.error('Status change error:', err);
            Toast.error(err.message || 'Failed to change status');
            statusSelect.value = task.status;
          }
        });
      }
    }

    // ------------------------------------------------------------------------
    // COMMENTS: Initial Fetch & STOMP WebSocket Live Updates
    // ------------------------------------------------------------------------
    await this.loadComments(task.taskId, isOwner, currentUserId);

    // Subscribe to STOMP WebSocket topic for this task
    if (window.WebSocketManager) {
      WebSocketManager.subscribeToTaskComments(task.taskId, {
        onNew: (newComment) => {
          if (!this.comments.some((c) => c.commentId === newComment.commentId)) {
            this.comments.push(newComment);
            this.renderCommentsFeed(task.taskId, isOwner, currentUserId);
            this.scrollToCommentsBottom();
          }
        },
        onUpdate: (updatedComment) => {
          const idx = this.comments.findIndex((c) => c.commentId === updatedComment.commentId);
          if (idx !== -1) {
            this.comments[idx] = updatedComment;
            this.renderCommentsFeed(task.taskId, isOwner, currentUserId);
          }
        },
        onDelete: (deletedCommentId) => {
          this.comments = this.comments.filter((c) => c.commentId !== deletedCommentId);
          this.renderCommentsFeed(task.taskId, isOwner, currentUserId);
        }
      });
    }

    // ------------------------------------------------------------------------
    // ADD COMMENT FORM
    // ------------------------------------------------------------------------
    const commentForm = backdrop.querySelector('#comment-add-form');
    if (commentForm) {
      commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = backdrop.querySelector('#comment-input-text');
        const sendBtn = backdrop.querySelector('#comment-send-btn');
        const content = input.value.trim();
        if (!content) return;

        sendBtn.disabled = true;

        try {
          const createdComment = await API.addComment({
            content,
            taskId: task.taskId
          });

          input.value = '';

          // Add to local state if STOMP broadcast hasn't already added it
          if (!this.comments.some((c) => c.commentId === createdComment.commentId)) {
            this.comments.push(createdComment);
            this.renderCommentsFeed(task.taskId, isOwner, currentUserId);
            this.scrollToCommentsBottom();
          }
        } catch (err) {
          console.error('Post comment error:', err);
          Toast.error(err.message || 'Failed to post comment');
        } finally {
          sendBtn.disabled = false;
        }
      });
    }
  },

  async loadComments(taskId, isOwner, currentUserId) {
    try {
      const res = await API.getComments(taskId);
      this.comments = Array.isArray(res) ? res : [];
      this.renderCommentsFeed(taskId, isOwner, currentUserId);
      this.scrollToCommentsBottom();
    } catch (err) {
      console.error('Failed to load comments:', err);
      const feed = document.getElementById('comments-feed-list');
      if (feed) {
        feed.innerHTML = `
          <div style="font-size: var(--text-xs); color: var(--text-tertiary); text-align: center; padding: var(--space-4);">
            Unable to load comments.
          </div>
        `;
      }
    }
  },

  renderCommentsFeed(taskId, isOwner, currentUserId) {
    const feed = document.getElementById('comments-feed-list');
    const countEl = document.getElementById('comment-feed-count');
    if (!feed) return;

    if (countEl) countEl.textContent = this.comments.length;

    if (this.comments.length === 0) {
      feed.innerHTML = `
        <div style="font-size: var(--text-xs); color: var(--text-tertiary); text-align: center; padding: var(--space-5);">
          No comments yet. Start the conversation!
        </div>
      `;
      return;
    }

    feed.innerHTML = this.comments
      .map((c) => {
        const isAuthor = c.commenterName === Auth.getUser()?.username;
        const canEdit = isAuthor;
        const canDelete = isAuthor || isOwner;

        return `
          <div class="comment-card" id="comment-card-${c.commentId}" data-comment-id="${c.commentId}">
            <div class="comment-card-top">
              <div class="comment-author-info">
                ${Avatar.render(c.commenterName || 'User', 'sm')}
                <span class="comment-author-name">${Utils.escapeHtml(c.commenterName || 'User')}</span>
                <span class="comment-time">${Utils.timeAgo(c.createdAt)}</span>
              </div>
              <div class="comment-card-actions">
                ${canEdit ? `
                  <button type="button" class="btn-icon btn-sm edit-comment-btn" title="Edit comment" data-comment-id="${c.commentId}">
                    ${Icons.edit}
                  </button>
                ` : ''}
                ${canDelete ? `
                  <button type="button" class="btn-icon btn-sm delete-comment-btn" title="Delete comment" data-comment-id="${c.commentId}">
                    ${Icons.trash}
                  </button>
                ` : ''}
              </div>
            </div>
            <div class="comment-content" id="comment-content-${c.commentId}">
              ${Utils.escapeHtml(c.content)}
            </div>
          </div>
        `;
      })
      .join('');

    // Attach Edit Comment listeners
    feed.querySelectorAll('.edit-comment-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const commentId = parseInt(btn.dataset.commentId, 10);
        const comment = this.comments.find((c) => c.commentId === commentId);
        if (!comment) return;

        const contentDiv = feed.querySelector(`#comment-content-${commentId}`);
        if (!contentDiv) return;

        contentDiv.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-1);">
            <textarea class="textarea edit-comment-textarea" rows="2" style="font-size: var(--text-xs);">${Utils.escapeHtml(comment.content)}</textarea>
            <div style="display: flex; justify-content: flex-end; gap: var(--space-2);">
              <button type="button" class="btn btn-ghost btn-sm cancel-edit-btn">Cancel</button>
              <button type="button" class="btn btn-primary btn-sm save-edit-btn">Save</button>
            </div>
          </div>
        `;

        const textarea = contentDiv.querySelector('.edit-comment-textarea');
        const cancelBtn = contentDiv.querySelector('.cancel-edit-btn');
        const saveBtn = contentDiv.querySelector('.save-edit-btn');

        cancelBtn.addEventListener('click', () => {
          contentDiv.textContent = comment.content;
        });

        saveBtn.addEventListener('click', async () => {
          const newText = textarea.value.trim();
          if (!newText || newText === comment.content) {
            contentDiv.textContent = comment.content;
            return;
          }

          saveBtn.disabled = true;
          try {
            const updated = await API.editComment(commentId, {
              content: newText,
              taskId
            });
            comment.content = updated.content;
            contentDiv.textContent = updated.content;
            Toast.success('Comment updated');
          } catch (err) {
            console.error('Edit comment error:', err);
            Toast.error(err.message || 'Failed to update comment');
            saveBtn.disabled = false;
          }
        });
      });
    });

    // Attach Delete Comment listeners
    feed.querySelectorAll('.delete-comment-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const commentId = parseInt(btn.dataset.commentId, 10);
        const confirmed = await ConfirmDialog.show({
          title: 'Delete Comment',
          message: 'Are you sure you want to delete this comment?',
          confirmText: 'Delete',
          isDanger: true
        });

        if (confirmed) {
          try {
            await API.deleteComment(commentId);
            this.comments = this.comments.filter((c) => c.commentId !== commentId);
            this.renderCommentsFeed(taskId, isOwner, currentUserId);
            Toast.success('Comment deleted');
          } catch (err) {
            console.error('Delete comment error:', err);
            Toast.error(err.message || 'Failed to delete comment');
          }
        }
      });
    });
  },

  scrollToCommentsBottom() {
    const feed = document.getElementById('comments-feed-list');
    if (feed) {
      feed.scrollTop = feed.scrollHeight;
    }
  },

  close() {
    if (this.currentTaskId && window.WebSocketManager) {
      WebSocketManager.unsubscribeFromTask(this.currentTaskId);
    }
    this.currentTaskId = null;
    if (this.activeBackdrop) {
      this.activeBackdrop.remove();
      this.activeBackdrop = null;
    }
  }
};
