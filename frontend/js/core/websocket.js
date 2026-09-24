/**
 * TaskCollab — WebSocket & STOMP Manager
 */
const WebSocketManager = {
  stompClient: null,
  socket: null,
  connected: false,
  reconnectTimeout: null,
  taskSubscriptions: new Map(), // taskId -> array of STOMP subscription objects

  connect() {
    if (this.stompClient && this.connected) return;

    // Prevent duplicate reconnect attempts
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    try {
      this.socket = new SockJS('http://localhost:1717/ws');
      this.stompClient = Stomp.over(this.socket);
      
      // Disable debug logs in console to keep terminal clean
      this.stompClient.debug = () => {};

      this.stompClient.connect(
        {},
        () => {
          this.connected = true;
          this.updateStatusIndicator(true);

          // Re-subscribe if any active task listeners exist
          this.taskSubscriptions.forEach((subs, taskId) => {
            if (subs.callbacks) {
              this.subscribeToTaskComments(taskId, subs.callbacks, true);
            }
          });
        },
        (error) => {
          this.connected = false;
          this.updateStatusIndicator(false);

          // Attempt reconnection after 5 seconds if still logged in
          if (Auth.isLoggedIn()) {
            this.reconnectTimeout = setTimeout(() => {
              this.connect();
            }, 5000);
          }
        }
      );
    } catch (err) {
      this.connected = false;
      this.updateStatusIndicator(false);
    }
  },

  updateStatusIndicator(isConnected) {
    const dot = document.querySelector('.status-dot');
    const label = document.querySelector('.status-indicator');
    if (dot) {
      if (isConnected) {
        dot.classList.remove('disconnected');
      } else {
        dot.classList.add('disconnected');
      }
    }
    if (label) {
      label.title = isConnected ? 'Connected to Real-time Broker' : 'Disconnected from Broker';
    }
  },

  subscribeToTaskComments(taskId, callbacks, isResubscribe = false) {
    if (!this.stompClient || !this.connected) {
      // Store callbacks so we can subscribe once connected
      this.taskSubscriptions.set(taskId, { subs: [], callbacks });
      if (!this.connected) this.connect();
      return;
    }

    // If already subscribed and not a resubscribe, remove previous subscriptions first
    if (!isResubscribe && this.taskSubscriptions.has(taskId)) {
      this.unsubscribeFromTask(taskId);
    }

    const subs = [];

    try {
      // 1. New comment topic
      const subNew = this.stompClient.subscribe(
        `/live/task/${taskId}/comments`,
        (message) => {
          try {
            const comment = JSON.parse(message.body);
            callbacks.onNew?.(comment);
          } catch (e) {
            console.error('Failed to parse comment payload', e);
          }
        }
      );
      subs.push(subNew);

      // 2. Updated comment topic
      const subUpdate = this.stompClient.subscribe(
        `/live/task/${taskId}/comments/update`,
        (message) => {
          try {
            const comment = JSON.parse(message.body);
            callbacks.onUpdate?.(comment);
          } catch (e) {
            console.error('Failed to parse comment update payload', e);
          }
        }
      );
      subs.push(subUpdate);

      // 3. Deleted comment topic
      const subDelete = this.stompClient.subscribe(
        `/live/task/${taskId}/comments/delete`,
        (message) => {
          try {
            const commentId = parseInt(message.body, 10);
            callbacks.onDelete?.(commentId);
          } catch (e) {
            console.error('Failed to parse comment delete payload', e);
          }
        }
      );
      subs.push(subDelete);

      this.taskSubscriptions.set(taskId, { subs, callbacks });
    } catch (e) {
      console.warn('Failed to subscribe to task comments', e);
    }
  },

  unsubscribeFromTask(taskId) {
    const entry = this.taskSubscriptions.get(taskId);
    if (entry && entry.subs) {
      entry.subs.forEach((sub) => {
        try {
          sub.unsubscribe();
        } catch {}
      });
    }
    this.taskSubscriptions.delete(taskId);
  },

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Unsubscribe all
    this.taskSubscriptions.forEach((entry, taskId) => {
      if (entry && entry.subs) {
        entry.subs.forEach((sub) => {
          try {
            sub.unsubscribe();
          } catch {}
        });
      }
    });
    this.taskSubscriptions.clear();

    if (this.stompClient) {
      try {
        this.stompClient.disconnect();
      } catch {}
      this.stompClient = null;
    }
    this.connected = false;
    this.updateStatusIndicator(false);
  }
};
