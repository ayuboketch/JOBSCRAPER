// Updated queryClient.ts
import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Remove trailing slash to prevent double slashes
const API_BASE_URL = (import.meta.env.VITE_API_URL || "https://jobscraper-8et5.onrender.com").replace(/\/$/, '');

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<Response> {
  const token = localStorage.getItem("supabase_token");
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log('Making request to:', `${API_BASE_URL}${url}`);
  console.log('With headers:', headers);

  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    mode: 'cors' // Explicitly set CORS mode
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem("supabase_token");
    const headers: Record<string, string> = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log('Query request to:', `${API_BASE_URL}/${queryKey.join("/")}`);
    console.log('Query headers:', headers);

    const res = await fetch(`${API_BASE_URL}/${queryKey.join("/")}`, {
      headers,
      credentials: "include",
      mode: 'cors'
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: 30000,
      refetchOnWindowFocus: false,
      staleTime: 25000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});