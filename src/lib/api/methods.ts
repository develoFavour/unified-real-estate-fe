import { apiClient } from './axios';

// Standard response structure from our Go backend
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

export const api = {
  get: <T>(url: string, params?: object) => 
    apiClient.get<ApiResponse<T>>(url, { params }).then((res) => res.data.data),
    
  post: <T>(url: string, data: object) => 
    apiClient.post<ApiResponse<T>>(url, data).then((res) => res.data.data),
    
  put: <T>(url: string, data: object) => 
    apiClient.put<ApiResponse<T>>(url, data).then((res) => res.data.data),
    
  patch: <T>(url: string, data: object) => 
    apiClient.patch<ApiResponse<T>>(url, data).then((res) => res.data.data),
    
  delete: <T>(url: string) => 
    apiClient.delete<ApiResponse<T>>(url).then((res) => res.data.data),
};
