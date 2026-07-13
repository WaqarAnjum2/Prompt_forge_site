import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

const JWT_EXPIRY_BUFFER_SECONDS = 60;

interface JwtClaims {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  email: string;
  phone: string | null;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  role: string;
  aal: string | null;
  amr: { method: string; timestamp: number }[] | null;
  session_id: string | null;
  is_anonymous: boolean;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  accessToken: string | null;
  jwtClaims: JwtClaims | null;
  tokenExpired: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  refreshSession: () => Promise<void>;
  getValidToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwt(token: string): JwtClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded as JwtClaims;
  } catch {
    return null;
  }
}

function isTokenExpired(claims: JwtClaims | null): boolean {
  if (!claims?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return now >= claims.exp - JWT_EXPIRY_BUFFER_SECONDS;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [jwtClaims, setJwtClaims] = useState<JwtClaims | null>(null);
  const [tokenExpired, setTokenExpired] = useState(false);

  const updateState = useCallback(
    async (session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      const token = session?.access_token ?? null;
      setAccessToken(token);
      const claims = token ? decodeJwt(token) : null;
      setJwtClaims(claims);
      setTokenExpired(isTokenExpired(claims));
      await checkAdmin(session?.user ?? null);
    },
    []
  );

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await updateState(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        updateState(session);
      }
    );

    const interval = setInterval(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const claims = decodeJwt(data.session.access_token);
        if (isTokenExpired(claims)) {
          const { data: refreshed } = await supabase.auth.refreshSession();
          updateState(refreshed.session);
        }
      }
    }, 30_000);

    return () => {
      listener?.subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [updateState]);

  const checkAdmin = useCallback(async (user: User | null) => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    const { data } = await supabase
      .from('admins')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
    setIsAdmin(!!data);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: error.message };

      const { data: { user } } = await supabase.auth.getUser();
      const { data: adminData } = await supabase
        .from('admins')
        .select('id')
        .eq('id', user?.id)
        .maybeSingle();
      if (!adminData) {
        await supabase.auth.signOut();
        updateState(null);
        return { error: 'Access denied. Admin privileges required.' };
      }
      setIsAdmin(true);
      updateState(data.session);
      return { error: null };
    },
    [updateState]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAccessToken(null);
    setJwtClaims(null);
    setTokenExpired(false);
    setIsAdmin(false);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    return { error: error?.message ?? null };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  }, []);

  const refreshSession = useCallback(async () => {
    const { data } = await supabase.auth.refreshSession();
    updateState(data.session);
  }, [updateState]);

  const getValidToken = useCallback(async () => {
    if (!accessToken) return null;
    if (!tokenExpired) return accessToken;
    await refreshSession();
    return session?.access_token ?? null;
  }, [accessToken, tokenExpired, refreshSession, session]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        accessToken,
        jwtClaims,
        tokenExpired,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        refreshSession,
        getValidToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
