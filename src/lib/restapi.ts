import { ref } from "vue";
import { readFrontCookie } from './cookies.ts'


type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

const globalHeaders : Record<string, string|number|boolean> = {}

const setHeader = (k: string, v: string|number|boolean) => {
  globalHeaders[k] = v
}

const delHeader = (k: string) => {
  delete globalHeaders[k]
}

export function useRestApi(baseURL: string = API_BASE_URL) {
  const loading = ref(false);

  async function request<T>(
    endpoint: string,
    method: HttpMethod = "GET",
    body?: unknown
  ): Promise<ApiResponse<T>> {
    loading.value = true;
    const isFormdata = body && body instanceof FormData;

    const headers: Record<string, string> = {
      ...globalHeaders,
      Authorization: `Bearer ${readFrontCookie("auth_token")}`,
    };
    if (!isFormdata) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method,
        headers,
        body: body
          ? isFormdata
            ? (body as globalThis.BodyInit)
            : JSON.stringify(body)
          : undefined,
      })

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return { data: data as T, error: null, loading: false };

    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error"

      return {
        data: null,
        error,
        loading: false,
      };
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    request,
    setHeader,
    delHeader,
    get: <T>(endpoint: string) => request<T>(endpoint),
    post: <T>(endpoint: string, body: unknown) => request<T>(endpoint, "POST", body),
    put: <T>(endpoint: string, body: unknown) => request<T>(endpoint, "PUT", body),
    patch: <T>(endpoint: string, body: unknown) => request<T>(endpoint, "PATCH", body),
    del: <T>(endpoint: string) => request<T>(endpoint, "DELETE"),
  };
}
