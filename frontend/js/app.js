/**
 * TaskCollab — Application Bootstrap & Route Definitions
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Register Application Routes
  Router.register('/login', () => AuthPage.render('login'));
  Router.register('/register', () => AuthPage.render('register'));
  Router.register('/dashboard', () => DashboardPage.render());
  Router.register('/workspace/:id', (params) => WorkspacePage.render(params));
  Router.register('/workspace/:id/members', (params) => WorkspacePage.render(params));

  // 2. Connect WebSocket early if user is already authenticated
  if (Auth.isLoggedIn()) {
    WebSocketManager.connect();
  }

  // 3. Initialize Hash Router
  Router.init();
});
