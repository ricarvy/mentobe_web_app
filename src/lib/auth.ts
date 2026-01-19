export interface User {
  id: string;
  username: string;
  email: string;
}

// 简单的session管理，实际生产中应该使用JWT或cookies
export class SessionManager {
  private static instance: SessionManager;
  private currentUser: User | null = null;

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setUser(user: User): void {
    this.currentUser = user;
  }

  logout(): void {
    this.currentUser = null;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }
}

export const sessionManager = SessionManager.getInstance();
