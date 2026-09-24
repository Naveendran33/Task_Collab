/**
 * TaskCollab — Single Page Application Hash Router
 */
const Router = {
  routes: {},
  currentCleanup: null,

  register(path, handler) {
    this.routes[path] = handler;
  },

  navigate(path) {
    const formatted = path.startsWith('#') ? path : `#${path.startsWith('/') ? path : '/' + path}`;
    if (window.location.hash === formatted) {
      this.resolve();
    } else {
      window.location.hash = formatted;
    }
  },

  async resolve() {
    // 1. Run any teardown logic from previous page
    if (typeof this.currentCleanup === 'function') {
      try {
        this.currentCleanup();
      } catch (err) {
        console.error('Error in route cleanup:', err);
      }
      this.currentCleanup = null;
    }

    // 2. Parse current route hash
    const rawHash = window.location.hash.slice(1).trim() || '/dashboard';
    const [pathPart, ...queryStringParts] = rawHash.split('?');
    const segments = pathPart.split('/').filter(Boolean);

    const isAuthRoute = segments[0] === 'login' || segments[0] === 'register';
    const loggedIn = Auth.isLoggedIn();

    // 3. Auth Guard
    if (!loggedIn && !isAuthRoute) {
      return this.navigate('/login');
    }
    if (loggedIn && isAuthRoute) {
      return this.navigate('/dashboard');
    }

    // 4. Update Shell (Sidebar & Header visibility)
    const sidebar = document.getElementById('sidebar');
    const header = document.getElementById('app-header');
    const main = document.getElementById('main-content');
    const footer = document.getElementById('app-footer');

    if (isAuthRoute) {
      if (sidebar) sidebar.style.display = 'none';
      if (header) header.style.display = 'none';
      if (footer) footer.style.display = 'none';
      if (main) main.className = 'auth-page';
    } else {
      if (sidebar) sidebar.style.display = '';
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
      if (main) main.className = '';
      if (window.Sidebar && sidebar) {
        Sidebar.render();
      }
      if (window.WebSocketManager && !WebSocketManager.connected) {
        WebSocketManager.connect();
      }
    }

    // 5. Match route handler
    // Supported routes:
    // /login -> handler
    // /register -> handler
    // /dashboard -> handler
    // /workspace/:id -> handler
    // /workspace/:id/members -> handler
    let handler = null;
    let params = {};

    if (segments.length === 0 || segments[0] === 'dashboard') {
      handler = this.routes['/dashboard'];
    } else if (segments[0] === 'login') {
      handler = this.routes['/login'];
    } else if (segments[0] === 'register') {
      handler = this.routes['/register'];
    } else if (segments[0] === 'workspace') {
      params.workspaceId = parseInt(segments[1], 10);
      if (segments[2] === 'members') {
        handler = this.routes['/workspace/:id/members'] || this.routes['/workspace'];
        params.tab = 'members';
      } else {
        handler = this.routes['/workspace/:id'] || this.routes['/workspace'];
        params.tab = 'tasks';
      }
    }

    if (!handler) {
      // Fallback
      return this.navigate(loggedIn ? '/dashboard' : '/login');
    }

    try {
      const cleanup = await handler(params);
      if (typeof cleanup === 'function') {
        this.currentCleanup = cleanup;
      }
    } catch (err) {
      console.error('Route handler error:', err);
      if (window.Toast) {
        Toast.error(err.message || 'Error loading page');
      }
    }
  },

  init() {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  }
};
