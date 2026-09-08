import { useAuthStore } from '../store';

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const error = useAuthStore((state) => state.error);
  const initialize = useAuthStore((state) => state.initialize);
  const selectRole = useAuthStore((state) => state.selectRole);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const logout = useAuthStore((state) => state.logout);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    user,
    role,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    initialize,
    selectRole,
    login,
    register,
    verifyOtp,
    logout,
    clearError,
  };
};
