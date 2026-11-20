import * as SecureStore from "expo-secure-store";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "https://vbs-test.onrender.com/api";
const ACCESS_KEY = "rhema_vbs_access_token";
const REFRESH_KEY = "rhema_vbs_refresh_token";

export async function saveTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
}
export async function clearTokens() {
  await Promise.all([SecureStore.deleteItemAsync(ACCESS_KEY), SecureStore.deleteItemAsync(REFRESH_KEY)]);
}
export async function readTokens() {
  const [accessToken, refreshToken] = await Promise.all([SecureStore.getItemAsync(ACCESS_KEY), SecureStore.getItemAsync(REFRESH_KEY)]);
  return { accessToken, refreshToken };
}
type RequestOptions = { method?: string; body?: unknown; auth?: boolean; retryAuth?: boolean };
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const { refreshToken } = await readTokens();
      if (!refreshToken) return null;
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({refreshToken})
      });
      const payload = await response.json().catch(() => null);
      const nextAccess = payload?.data?.accessToken;
      const nextRefresh = payload?.data?.refreshToken;
      if (!response.ok || !nextAccess || !nextRefresh) return null;
      await saveTokens(nextAccess, nextRefresh);
      return nextAccess as string;
    })().finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, retryAuth = true } = options;
  const { accessToken } = await readTokens();
  const headers: Record<string,string> = {"Content-Type":"application/json"};
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method, headers, ...(body === undefined ? {} : {body:JSON.stringify(body)})
  });
  if (response.status === 401 && auth && retryAuth) {
    const nextAccess = await refreshAccessToken();
    if (nextAccess) return apiRequest<T>(path, {...options, retryAuth:false});
    await clearTokens();
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || `Request failed (${response.status})`);
  return payload as T;
}

export const API_ENDPOINTS = { login:"/auth/login", me:"/auth/me", logout:"/auth/logout", students:"/students", attendanceWindow:"/attendance/window-status", studentAttendance:"/attendance/students" };