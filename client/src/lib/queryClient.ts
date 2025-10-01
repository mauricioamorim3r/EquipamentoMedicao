import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
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
    console.log('QueryFn: Making request to', queryKey.join("/"));
    
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      signal: AbortSignal.timeout(30000), // 30 segundos de timeout
    });

    console.log('QueryFn: Response received', res.status, res.statusText);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    console.log('QueryFn: Data parsed successfully');
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 5 * 60 * 1000, // 5 minutos em vez de Infinity
      retry: 3, // Tentar 3 vezes em caso de erro
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Delay exponencial
      networkMode: 'always',
    },
    mutations: {
      retry: false,
    },
  },
});
