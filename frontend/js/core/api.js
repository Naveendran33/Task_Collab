/**
 * TaskCollab — Centralized API Client
 */
const API = {
  BASE_URL: 'http://localhost:1717',

  async request(method, path, body = null) {
    const headers = {
      'Accept': 'application/json'
    };

    if (body !== null) {
      headers['Content-Type'] = 'application/json';
    }

    const token = Auth.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
      credentials: 'include'
    };

    if (body !== null) {
      options.body = JSON.stringify(body);
    }

    let response;
    try {
      response = await fetch(`${this.BASE_URL}${path}`, options);
    } catch (networkError) {
      throw {
        status: 0,
        message: 'Unable to connect to the server. Please ensure the backend is running.'
      };
    }

    // Handle Session Expired
    if (response.status === 401) {
      Auth.logout();
      if (window.Toast) {
        Toast.error('Session expired. Please log in again.');
      }
      throw { status: 401, message: 'Session expired' };
    }

    // Handle errors (4xx, 5xx)
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: (await response.text()) || response.statusText };
      }
      throw {
        status: response.status,
        message: errorData.message || errorData.error || `Request failed (${response.status})`,
        errors: errorData.errors || null
      };
    }

    // Handle empty / text responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  },

  // --------------------------------------------------------------------------
  // User Endpoints
  // --------------------------------------------------------------------------
  register(userData) {
    return this.request('POST', '/users/create', userData);
  },

  login(credentials) {
    return this.request('POST', '/users/login', credentials);
  },

  getMe() {
    return this.request('GET', '/users/me');
  },

  searchUsers(query) {
    return this.request('GET', `/users/search?query=${encodeURIComponent(query)}`);
  },

  // --------------------------------------------------------------------------
  // Workspace Endpoints
  // --------------------------------------------------------------------------
  createWorkspace(data) {
    return this.request('POST', '/workspace/create', data);
  },

  getOwnedWorkspaces() {
    return this.request('GET', '/workspace/owned');
  },

  getMemberWorkspaces() {
    return this.request('GET', '/workspace/member/myWorkspaces');
  },

  deleteWorkspace(workspaceId) {
    return this.request('DELETE', `/workspace/delete?workspaceId=${workspaceId}`);
  },

  addMember(data) {
    return this.request('POST', '/workspace/member/add', data);
  },

  getMembers(workspaceId) {
    return this.request('GET', `/workspace/member/all?workspaceId=${workspaceId}`);
  },

  deleteMember(memberId) {
    return this.request('DELETE', `/workspace/member/delete?memberId=${memberId}`);
  },

  updateRole(memberId, role) {
    return this.request('PUT', `/workspace/member/update-role?memberId=${memberId}&role=${role}`);
  },

  // --------------------------------------------------------------------------
  // Task Endpoints
  // --------------------------------------------------------------------------
  getTasks(workspaceId) {
    return this.request('GET', `/task/all/${workspaceId}`);
  },

  createTask(data) {
    return this.request('POST', '/task/create', data);
  },

  getMyTasks(memberId) {
    return this.request('GET', `/task/all?memberId=${memberId}`);
  },

  assignTask(taskId, assigneeId) {
    return this.request('PUT', `/task/assign?taskId=${taskId}&assigneeId=${assigneeId}`);
  },

  setDueDate(taskId, formattedDate) {
    return this.request('PUT', `/task/set-due-date?taskId=${taskId}&date=${encodeURIComponent(formattedDate)}`);
  },

  changeStatus(taskId, status) {
    return this.request('PUT', `/task/status?taskId=${taskId}&status=${encodeURIComponent(status)}`);
  },

  updateTask(taskId, updateData) {
    return this.request('PATCH', `/task/update?taskId=${taskId}`, updateData);
  },

  deleteTask(taskId) {
    return this.request('DELETE', `/task/delete?taskId=${taskId}`);
  },

  // --------------------------------------------------------------------------
  // Comment Endpoints
  // --------------------------------------------------------------------------
  getComments(taskId) {
    return this.request('GET', `/comments/task/${taskId}`);
  },

  addComment(data) {
    return this.request('POST', '/comments/add', data);
  },

  editComment(commentId, data) {
    return this.request('PATCH', `/comments/edit/${commentId}`, data);
  },

  deleteComment(commentId) {
    return this.request('DELETE', `/comments/delete/${commentId}`);
  }
};
