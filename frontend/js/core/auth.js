/**
 * TaskCollab — Authentication State Management
 */
const Auth = {
  TOKEN_KEY: 'taskcollab_token',
  USER_KEY: 'taskcollab_user',

  login(response) {
    if (!response || !response.token) {
      throw new Error('Invalid login response');
    }
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(
      this.USER_KEY,
      JSON.stringify({
        userId: response.userId,
        username: response.username,
        email: response.email || ''
      })
    );
  },

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    if (window.WebSocketManager) {
      WebSocketManager.disconnect();
    }
    if (window.Router) {
      Router.navigate('/login');
    } else {
      window.location.hash = '#/login';
    }
  },

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  getUser() {
    try {
      const data = localStorage.getItem(this.USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUser(userData) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
  },

  isLoggedIn() {
    return !!this.getToken();
  }
};
