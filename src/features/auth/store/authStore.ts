import { create } from 'zustand';
import { setOnUnauthorizedCallback, tokenStorage } from '@core';
import type { AuthUser, LoginPayload, RegisterPayload, UserRole, VerifyOtpPayload } from '../types';
import { authService } from '../services';

interface AuthState {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  hasOnboarded: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
  selectRole: (role: UserRole) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  verifyOtp: (payload: VerifyOtpPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  setOnUnauthorizedCallback(() => {
    get().logout();
  });

  return {
    user: null,
    role: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    hasOnboarded: false,
    error: null,

    async initialize() {
      set({ isLoading: true });

      try {
        const hasOnboarded = await tokenStorage.getOnboardingCompleted();
        const token = await tokenStorage.getAccessToken();
        const savedRole = (await tokenStorage.getRole()) as UserRole | null;
        const savedUser = await tokenStorage.getUser<AuthUser>();

        if (token && savedUser) {
          set({
            user: savedUser,
            role: savedUser.role || savedRole,
            isAuthenticated: true,
            isInitialized: true,
            isLoading: false,
            hasOnboarded,
          });

          return;
        }

        set({
          user: null,
          role: savedRole,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
          hasOnboarded,
        });
      } catch {
        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
          hasOnboarded: false,
        });
      }
    },

    async setOnboardingCompleted(completed: boolean) {
      await tokenStorage.setOnboardingCompleted(completed);
      set({ hasOnboarded: completed });
    },

    async selectRole(role: UserRole) {
      await tokenStorage.setRole(role);
      set({ role });
    },

    async login(payload: LoginPayload) {
      set({ isLoading: true, error: null });

      try {
        const response = await authService.login(payload);

        await tokenStorage.setTokens(response.tokens);
        await tokenStorage.setUser(response.user);
        await tokenStorage.setRole(response.user.role);

        set({
          user: response.user,
          role: response.user.role,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Đăng nhập thất bại';

        set({
          isLoading: false,
          error: message,
        });

        throw err;
      }
    },

    async register(payload: RegisterPayload) {
      set({ isLoading: true, error: null });

      try {
        await authService.register(payload);

        if (payload.role) {
          await tokenStorage.setRole(payload.role);
          set({ role: payload.role });
        }

        set({ isLoading: false, error: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Đăng ký thất bại';

        set({
          isLoading: false,
          error: message,
        });

        throw err;
      }
    },

    async verifyOtp(payload: VerifyOtpPayload) {
      set({ isLoading: true, error: null });

      try {
        const response = await authService.verifyOtp(payload);

        await tokenStorage.setTokens(response.tokens);
        await tokenStorage.setUser(response.user);
        await tokenStorage.setRole(response.user.role);

        set({
          user: response.user,
          role: response.user.role,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Xác thực OTP thất bại';

        set({
          isLoading: false,
          error: message,
        });

        throw err;
      }
    },

    async logout() {
      try {
        await authService.logout();
      } catch {
      } finally {
        await tokenStorage.clearTokens();

        set({
          user: null,
          role: null,
          isAuthenticated: false,
          error: null,
        });
      }
    },

    clearError() {
      set({ error: null });
    },
  };
});
