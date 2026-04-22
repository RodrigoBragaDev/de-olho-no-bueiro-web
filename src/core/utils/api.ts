export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://backend-q7yq.onrender.com/api';

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  return fetch(`${API_URL}${endpoint}`, { ...options, headers });
}
