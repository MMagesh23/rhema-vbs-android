import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiRequest, clearTokens, readTokens, saveTokens } from "@/services/api";
import type { TeacherUser } from "./types";

type AuthContextValue = { user: TeacherUser | null; isLoading: boolean; login: (userID:string,password:string)=>Promise<void>; logout:()=>Promise<void>; refreshUser:()=>Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);
type Envelope<T> = { success:boolean; data:T };
type LoginData = { accessToken:string; refreshToken:string; user:TeacherUser };

export function AuthProvider({children}:{children:ReactNode}) {
  const [user,setUser] = useState<TeacherUser|null>(null);
  const [isLoading,setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const response = await apiRequest<Envelope<TeacherUser>>("/auth/me");
    if (response.data.role !== "teacher") {
      await clearTokens(); setUser(null);
      throw new Error("This app is available to teacher accounts only.");
    }
    setUser(response.data);
  },[]);

  const login = useCallback(async (userID:string,password:string) => {
    const response = await apiRequest<Envelope<LoginData>>("/auth/login",{method:"POST",auth:false,body:{userID,password}});
    if (!response.success || response.data.user.role !== "teacher") {
      throw new Error("This app is available to teacher accounts only.");
    }
    await saveTokens(response.data.accessToken,response.data.refreshToken);
    setUser(response.data.user);
  },[]);

  const logout = useCallback(async () => {
    const {refreshToken} = await readTokens();
    try { await apiRequest("/auth/logout",{method:"POST",body:{refreshToken},retryAuth:false}); }
    finally { await clearTokens(); setUser(null); }
  },[]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const tokens = await readTokens();
        if (tokens.accessToken || tokens.refreshToken) await refreshUser();
      } catch { await clearTokens(); if (active) setUser(null); }
      finally { if (active) setIsLoading(false); }
    })();
    return () => { active = false; };
  },[refreshUser]);

  const value = useMemo(()=>({user,isLoading,login,logout,refreshUser}),[user,isLoading,login,logout,refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}