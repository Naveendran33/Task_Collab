/**
 * TaskCollab — Authentication Page (Login & Register)
 */
const AuthPage = {
  render(mode = 'login') {
    const main = document.getElementById('main-content');
    if (!main) return;

    main.className = 'auth-page';
    main.innerHTML = `
      <div class="auth-left">
        <div class="auth-glow-orb-1"></div>
        <div class="auth-glow-orb-2"></div>
        
        <div class="auth-branding animate-fadeIn">
          <div class="auth-brand-badge">
            ${Icons.sparkle}
            <span>Next-Gen Task Management</span>
          </div>
          <h1 class="auth-logo">TaskCollab</h1>
          <p class="auth-tagline">
            Streamline teamwork, orchestrate workflows, and stay seamlessly aligned with real-time updates.
          </p>

          <div class="auth-features">
            <div class="auth-feature-item">
              <div class="auth-feature-icon">${Icons.folder}</div>
              <span>Role-governed workspaces with granular ownership controls</span>
            </div>
            <div class="auth-feature-item">
              <div class="auth-feature-icon">${Icons.dashboard}</div>
              <span>Interactive Kanban tracking across TODO, In Progress, and Done</span>
            </div>
            <div class="auth-feature-item">
              <div class="auth-feature-icon">${Icons.comment}</div>
              <span>Instant live comment collaboration powered by WebSockets</span>
            </div>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-card card-glass animate-slideUp">
          <div class="auth-card-header">
            <h2>${mode === 'login' ? 'Welcome Back' : 'Create an Account'}</h2>
            <p>${mode === 'login' ? 'Enter your credentials to access your workspaces' : 'Get started with TaskCollab in seconds'}</p>
          </div>

          <form id="auth-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="auth-username">Username</label>
              <div class="input-icon-wrapper">
                <span class="input-icon">${Icons.user}</span>
                <input 
                  type="text" 
                  id="auth-username" 
                  class="input" 
                  placeholder="Enter your username" 
                  required 
                  autocomplete="username"
                  autofocus
                />
              </div>
              <div class="form-error" id="err-username" style="display: none;"></div>
            </div>

            ${mode === 'register' ? `
              <div class="form-group animate-fadeIn">
                <label class="form-label" for="auth-email">Email Address</label>
                <div class="input-icon-wrapper">
                  <span class="input-icon">${Icons.mail}</span>
                  <input 
                    type="email" 
                    id="auth-email" 
                    class="input" 
                    placeholder="name@example.com" 
                    required 
                    autocomplete="email"
                  />
                </div>
                <div class="form-error" id="err-email" style="display: none;"></div>
              </div>
            ` : ''}

            <div class="form-group">
              <label class="form-label" for="auth-password">Password</label>
              <div class="input-icon-wrapper">
                <span class="input-icon">${Icons.lock}</span>
                <input 
                  type="password" 
                  id="auth-password" 
                  class="input" 
                  placeholder="Enter your password" 
                  required 
                  autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}"
                />
                <button type="button" class="btn-icon input-right-btn" id="toggle-password" aria-label="Toggle password visibility">
                  ${Icons.eye}
                </button>
              </div>
              <div class="form-error" id="err-password" style="display: none;"></div>
            </div>

            <button type="submit" class="btn btn-primary btn-full" id="auth-submit-btn" style="margin-top: var(--space-4);">
              <span>${mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>

          <div class="auth-switch">
            ${mode === 'login'
              ? `Don't have an account? <a href="#/register">Create one</a>`
              : `Already have an account? <a href="#/login">Sign in</a>`
            }
          </div>
        </div>
      </div>
    `;

    // Password visibility toggle
    const toggleBtn = document.getElementById('toggle-password');
    const pwdInput = document.getElementById('auth-password');
    if (toggleBtn && pwdInput) {
      toggleBtn.addEventListener('click', () => {
        const isPassword = pwdInput.type === 'password';
        pwdInput.type = isPassword ? 'text' : 'password';
        toggleBtn.innerHTML = isPassword ? Icons.eyeOff : Icons.eye;
      });
    }

    // Form submission handler
    const form = document.getElementById('auth-form');
    const submitBtn = document.getElementById('auth-submit-btn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear previous error messages
      document.querySelectorAll('.form-error').forEach((el) => {
        el.style.display = 'none';
        el.textContent = '';
      });
      document.querySelectorAll('.input').forEach((el) => el.classList.remove('has-error'));

      const username = document.getElementById('auth-username').value.trim();
      const password = document.getElementById('auth-password').value;
      const emailInput = document.getElementById('auth-email');
      const email = emailInput ? emailInput.value.trim() : null;

      let hasClientError = false;

      if (!username) {
        showFieldError('username', 'Username is required');
        hasClientError = true;
      }

      if (mode === 'register') {
        if (!email) {
          showFieldError('email', 'Email is required');
          hasClientError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showFieldError('email', 'Please enter a valid email address');
          hasClientError = true;
        }
      }

      if (!password) {
        showFieldError('password', 'Password is required');
        hasClientError = true;
      }

      if (hasClientError) return;

      // Loading state on button
      submitBtn.disabled = true;
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = `${Loader.spinner('sm')} <span>Processing...</span>`;

      try {
        if (mode === 'register') {
          await API.register({ username, email, password });
          Toast.success('Account created successfully! Signing you in...');
          
          // Auto login after registration
          const loginRes = await API.login({ username, password });
          Auth.login({ ...loginRes, email });
          Router.navigate('/dashboard');
        } else {
          const loginRes = await API.login({ username, password });
          Auth.login(loginRes);

          // Fetch fresh user profile if email is needed
          try {
            const me = await API.getMe();
            if (me && me.email) {
              Auth.setUser({ ...Auth.getUser(), email: me.email });
            }
          } catch {}

          Toast.success(`Welcome back, ${username}!`);
          Router.navigate('/dashboard');
        }
      } catch (err) {
        console.error('Auth error:', err);
        const card = document.querySelector('.auth-card');
        if (card) {
          card.classList.remove('animate-shake');
          void card.offsetWidth; // Trigger reflow
          card.classList.add('animate-shake');
        }

        const msg = err.message || 'Authentication failed. Please check your credentials.';
        if (msg.toLowerCase().includes('username')) {
          showFieldError('username', msg);
        } else if (msg.toLowerCase().includes('password') || err.status === 401 || err.status === 403) {
          showFieldError('password', 'Invalid username or password');
        } else if (msg.toLowerCase().includes('email')) {
          showFieldError('email', msg);
        } else {
          Toast.error(msg);
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });

    function showFieldError(fieldId, errorText) {
      const errEl = document.getElementById(`err-${fieldId}`);
      const inputEl = document.getElementById(`auth-${fieldId}`);
      if (errEl) {
        errEl.textContent = errorText;
        errEl.style.display = 'flex';
      }
      if (inputEl) {
        inputEl.classList.add('has-error');
      }
    }
  }
};
