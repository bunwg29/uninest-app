import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config';
import { HTTP_STATUS_CODES } from '../constants';
import { ApiErrorResponse } from '../types';
import { tokenStorage } from '../storage/token';

export const unwrapApiData = <T>(payload: unknown): T => {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    (payload as { status?: boolean }).status !== undefined
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;
  public readonly data?: unknown;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    errorCode?: string,
    data?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.data = data;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

type CustomAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

interface RefreshTokenPayload {
  accessToken: string;
  refreshToken?: string;
}

const unwrapRefreshPayload = (
  body: RefreshTokenPayload | { data?: RefreshTokenPayload }
): RefreshTokenPayload | undefined => {
  if ('accessToken' in body) {
    return body;
  }

  return body.data;
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    const requestUrl = originalRequest?.url || '';
    const isAuthBypassUrl =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/otp') ||
      requestUrl.includes('/auth/refresh-token') ||
      requestUrl.includes('/auth/forgot-password') ||
      requestUrl.includes('/auth/reset-password');

    if (
      originalRequest &&
      error.response?.status === HTTP_STATUS_CODES.UNAUTHORIZED &&
      !originalRequest._retry &&
      !isAuthBypassUrl
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }

              resolve(apiClient(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();

        if (!refreshToken) {
          throw new Error('Không tìm thấy mã làm mới phiên đăng nhập');
        }

        const refreshResponse = await axios.post<
          RefreshTokenPayload | { data?: RefreshTokenPayload }
        >(`${API_CONFIG.BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const refreshPayload = unwrapRefreshPayload(refreshResponse.data);

        if (!refreshPayload?.accessToken) {
          throw new Error('Phản hồi làm mới phiên đăng nhập không hợp lệ');
        }

        const newAccessToken = refreshPayload.accessToken;
        const newRefreshToken = refreshPayload.refreshToken || refreshToken;

        await tokenStorage.setTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await tokenStorage.clearTokens();

        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const errorData = error.response?.data as
      (ApiErrorResponse & { message?: string | string[] }) | undefined;
    const rawMessages = errorData?.messages ?? errorData?.message;
    const message =
      (Array.isArray(rawMessages)
        ? rawMessages.join(', ')
        : typeof rawMessages === 'string'
          ? rawMessages
          : null) ||
      error.message ||
      'Đã xảy ra lỗi kết nối không mong muốn';

    const statusCode =
      (typeof errorData?.statusCode === 'number' ? errorData.statusCode : null) ||
      error.response?.status ||
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

    const errorType = typeof errorData?.error === 'string' ? errorData.error : undefined;

    return Promise.reject(new AppError(message, statusCode, errorType, errorData));
  }
);
