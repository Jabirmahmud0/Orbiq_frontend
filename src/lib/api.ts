import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "@/constants/routes";
import { authStore } from "@/store/authStore";
import { ApiError } from "@/types/api.types";

const API_BASE_URL = API_URL;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Flag to prevent multiple refresh requests
let _isRefreshing = false;
let _refreshSubscribers: ((token: string) => void)[] = [];

// Subscribe to token refresh
function onTokenRefreshed(token: string) {
  _refreshSubscribers.forEach((callback) => callback(token));
  _refreshSubscribers = [];
}

// Add request to queue
function addRefreshSubscriber(callback: (token: string) => void) {
  _refreshSubscribers.push(callback);
}

// Request interceptor - attach access token and check pre-expiry
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let accessToken = authStore.getState().accessToken;

    // Check for pre-expiry (within 60s)
    if (accessToken) {
      try {
        const decoded: any = jwtDecode(accessToken);
        const now = Math.floor(Date.now() / 1000);
        
        if (decoded.exp && decoded.exp - now < 60) {
          if (_isRefreshing) {
            // Wait for existing refresh to finish
            return new Promise((resolve) => {
              addRefreshSubscriber((token: string) => {
                config.headers.Authorization = `Bearer ${token}`;
                resolve(config);
              });
            });
          }

          _isRefreshing = true;
          try {
            const response = await axios.post(
              `${API_BASE_URL}/auth/refresh`,
              {},
              { withCredentials: true },
            );
            const newAccessToken = response.data.accessToken;
            authStore.getState().setAccessToken(newAccessToken);
            document.cookie = `obliq_access=${newAccessToken}; path=/; max-age=900; SameSite=Strict`;
            accessToken = newAccessToken;
            onTokenRefreshed(newAccessToken);
          } catch (err) {
            authStore.getState().clearAuth();
            document.cookie = "obliq_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            if (typeof window !== "undefined") window.location.href = "/login";
            return Promise.reject(err);
          } finally {
            _isRefreshing = false;
          }
        }
      } catch (err) {
        // ignore JWT decode errors
      }

      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (_isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const { accessToken } = response.data;

        // Update tokens in store
        authStore.getState().setAccessToken(accessToken);

        // Set cookie for middleware
        document.cookie = `obliq_access=${accessToken}; path=/; max-age=900; SameSite=Strict`;

        _isRefreshing = false;
        onTokenRefreshed(accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect to login
        _isRefreshing = false;
        authStore.getState().clearAuth();
        document.cookie =
          "obliq_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
