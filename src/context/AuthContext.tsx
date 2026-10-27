import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile, AdminAccount, AuditLog } from '../types/index.ts';

interface SetupStatus {
  superAdminEmail: string;
  isVerified: boolean;
  setupCodeHint: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  setupStatus: SetupStatus | null;
  loading: boolean;
  checkSetupStatus: () => Promise<void>;
  verifySuperAdminSetup: (password: string, code: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string; requiresSetup?: boolean }>;
  logout: () => void;
  // Super Admin Management Actions
  adminsList: AdminAccount[];
  auditLogs: AuditLog[];
  fetchAdmins: () => Promise<void>;
  createAdmin: (data: { email: string; name: string; password: string; department?: string; permissions?: string[] }) => Promise<{ success: boolean; error?: string }>;
  updateAdminCredentials: (data: { id: string; name?: string; newPassword?: string; department?: string; permissions?: string[]; status?: 'active' | 'suspended' | 'revoked' }) => Promise<{ success: boolean; error?: string }>;
  revokeAdmin: (id: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  fetchAuditLogs: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SUPER_ADMIN_EMAIL = 'manasadevi4077@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('unicore_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('unicore_token');
  });

  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [adminsList, setAdminsList] = useState<AdminAccount[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const checkSetupStatus = async () => {
    try {
      const res = await fetch('/api/auth/setup-status');
      if (res.ok) {
        const data = await res.json();
        setSetupStatus(data);
      }
    } catch (e) {
      console.error('Error fetching setup status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const verifySuperAdminSetup = async (password: string, code: string) => {
    try {
      const res = await fetch('/api/auth/setup-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: SUPER_ADMIN_EMAIL,
          code,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Verification failed.' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('unicore_user', JSON.stringify(data.user));
      localStorage.setItem('unicore_token', data.token);

      await checkSetupStatus();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during verification.' };
    }
  };

  const login = async (email: string, password: string = '', role: UserRole = 'student') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Login failed.',
          requiresSetup: data.requiresSetup,
        };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('unicore_user', JSON.stringify(data.user));
      localStorage.setItem('unicore_token', data.token);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login connection error.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('unicore_user');
    localStorage.removeItem('unicore_token');
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/list');
      if (res.ok) {
        const data = await res.json();
        setAdminsList(data.admins || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin list', err);
    }
  };

  const createAdmin = async (data: { email: string; name: string; password: string; department?: string; permissions?: string[] }) => {
    try {
      const res = await fetch('/api/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-actor-email': user?.email || '',
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to create administrator.' };
      }

      await fetchAdmins();
      await fetchAuditLogs();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error adding admin.' };
    }
  };

  const updateAdminCredentials = async (data: { id: string; name?: string; newPassword?: string; department?: string; permissions?: string[]; status?: 'active' | 'suspended' | 'revoked' }) => {
    try {
      const res = await fetch('/api/admin/update-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-actor-email': user?.email || '',
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to update credentials.' };
      }

      await fetchAdmins();
      await fetchAuditLogs();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error updating credentials.' };
    }
  };

  const revokeAdmin = async (id: string, reason?: string) => {
    try {
      const res = await fetch('/api/admin/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-actor-email': user?.email || '',
        },
        body: JSON.stringify({ id, reason }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to revoke administrator.' };
      }

      await fetchAdmins();
      await fetchAuditLogs();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error revoking admin.' };
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-actor-email': user?.email || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setupStatus,
        loading,
        checkSetupStatus,
        verifySuperAdminSetup,
        login,
        logout,
        adminsList,
        auditLogs,
        fetchAdmins,
        createAdmin,
        updateAdminCredentials,
        revokeAdmin,
        fetchAuditLogs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
