export type AuthState = {
  isAuthenticated: boolean;
  identity?: any;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

export { useAuthContext as useAuth } from '../providers/AuthProvider';
