import axios, { AxiosError } from 'axios';
import { API_CONFIG } from '../config';
import { HTTP_STATUS_CODES } from '../constants';
import { ApiErrorResponse } from '../types';

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

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const errorData = error.response?.data;
    const rawMessages = errorData?.messages;
    const message =
      (Array.isArray(rawMessages) ? rawMessages.join(', ') : rawMessages) ||
      error.message ||
      'An unexpected network error occurred';

    const statusCode =
      errorData?.statusCode || error.response?.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

    return Promise.reject(
      new AppError(message, statusCode, errorData?.error ?? undefined, errorData)
    );
  }
);
