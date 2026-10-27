import React, { useState } from 'react';
import { useAuth, SUPER_ADMIN_EMAIL } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { UserRole } from '../types/index.ts';
import {
  ShieldAlert,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  KeyRound,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';

interface LoginPageProps {
  onOpenThemeSettings: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenThemeSettings }) => {
  const { login, setupStatus, verifySuperAdminSetup } = useAuth();
  const { currentThemeDef } = useTheme();

  const [activeRole, setActiveRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Super Admin First-Time Setup State
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupCode, setSetupCode] = useState('');
  const [newMasterPassword, setNewMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [setupSuccess, setSetupSuccess] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setActiveRole(role);
    setError(null);
    if (role === 'super_admin') {
      setEmail(SUPER_ADMIN_EMAIL);
      setPassword('');
    } else if (role === 'admin') {
      setEmail('academic.dean@unicore.edu');
      setPassword('Academic@2026');
    } else if (role === 'professor') {
      setEmail('prof.sharma@unicore.edu');
      setPassword('FacultyPass2026');
    } else {
      setEmail('arun.k@student.unicore.edu');
      setPassword('StudentPass2026');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password, activeRole);
      if (!res.success) {
        if (res.requiresSetup || (email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase() && !setupStatus?.isVerified)) {
          setShowSetupModal(true);
        } else {
          setError(res.error || 'Authentication failed. Please verify credentials.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);

    if (!setupCode.trim()) {
      setSetupError('Please enter your designated one-time verification setup code.');
      return;
    }

    if (newMasterPassword.length < 6) {
      setSetupError('Master password must be at least 6 characters.');
      return;
    }

    if (newMasterPassword !== confirmPassword) {
      setSetupError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await verifySuperAdminSetup(newMasterPassword, setupCode.trim());
    setLoading(false);

    if (result.success) {
      setSetupSuccess(true);
      setTimeout(() => {
        setShowSetupModal(false);
      }, 1200);
    } else {
      setSetupError(result.error || 'Setup verification failed.');
    }
  };

  return (
    <div className="min-h-screen bg-base text-main flex flex-col justify-between transition-colors">
      {/* Top Banner Bar */}
      <div className="w-full border-b border-subtle bg-surface px-4 py-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight text-main">
            Unicore <span className="text-brand font-semibold">CampusConnect</span>
          </span>
          <span className="text-xs text-muted-custom border-l border-subtle pl-2">
            Institutional Access Gateway
          </span>
        </div>
        <button
          onClick={onOpenThemeSettings}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-subtle text-main border border-subtle hover:bg-surface transition-colors cursor-pointer"
        >
          Theme: <span className="text-brand font-bold">{currentThemeDef.name}</span>
        </button>
      </div>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-main">
              Sign In to Your Campus Portal
            </h1>
            <p className="text-sm text-muted-custom max-w-md mx-auto">
              Select your university role below to access your academic timetable, payroll records, or governance console.
            </p>
          </div>

          {/* 3 Role Interface Switcher (+ Super Admin) */}
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-subtle border border-subtle">
            <button
              type="button"
              onClick={() => handleRoleSelect('student')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeRole === 'student'
                  ? 'bg-surface text-brand shadow-xs border border-subtle'
                  : 'text-muted-custom hover:text-main'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('professor')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeRole === 'professor'
                  ? 'bg-surface text-brand shadow-xs border border-subtle'
                  : 'text-muted-custom hover:text-main'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Faculty</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeRole === 'admin' || activeRole === 'super_admin'
                  ? 'bg-surface text-brand shadow-xs border border-subtle'
                  : 'text-muted-custom hover:text-main'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Administration</span>
            </button>
          </div>

          {/* Super Admin Quick Link */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-muted-custom">
              {activeRole === 'student' && 'Viewing Student Access (Timetable, Spot Voting, Grievances)'}
              {activeRole === 'professor' && 'Viewing Faculty Access (Lectures, Daily Tasks, Payslips)'}
              {activeRole === 'admin' && 'Viewing Administrator Console (Exams, Bulletins, Approvals)'}
              {activeRole === 'super_admin' && 'Designated Super Admin Console'}
            </span>
            <button
              type="button"
              onClick={() => handleRoleSelect(activeRole === 'super_admin' ? 'admin' : 'super_admin')}
              className={`text-xs font-semibold cursor-pointer underline hover:opacity-85 ${
                activeRole === 'super_admin' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-brand'
              }`}
            >
              {activeRole === 'super_admin' ? 'Switch to Standard Admin' : 'Super Admin Login'}
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-surface rounded-2xl border border-subtle shadow-md p-6 sm:p-8 space-y-5">
            {activeRole === 'super_admin' && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="font-bold">Designated Super Admin Account</div>
                  <div>
                    Restricted exclusively to <strong className="font-mono">{SUPER_ADMIN_EMAIL}</strong>.
                    {!setupStatus?.isVerified && (
                      <span className="block mt-1 text-amber-700 dark:text-amber-300 font-medium">
                        First-time verification required before access can be granted.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-main flex items-center justify-between">
                  <span>Institutional Email Address</span>
                  {activeRole === 'super_admin' && (
                    <span className="text-[11px] text-amber-600 font-mono">Master Security</span>
                  )}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    readOnly={activeRole === 'super_admin'}
                    placeholder="name@unicore.edu"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-subtle/50 text-main placeholder:text-muted-custom/60 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand ${
                      activeRole === 'super_admin' ? 'border-amber-300 bg-amber-50/20' : 'border-subtle'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-main">
                    Password / Access Key
                  </label>
                  {activeRole === 'super_admin' && !setupStatus?.isVerified && (
                    <button
                      type="button"
                      onClick={() => setShowSetupModal(true)}
                      className="text-xs text-brand font-semibold hover:underline cursor-pointer"
                    >
                      First-Time Verification Setup
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={activeRole === 'super_admin' && setupStatus?.isVerified}
                    placeholder="Enter account password"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-subtle bg-subtle/50 text-main placeholder:text-muted-custom/60 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-bold bg-brand text-brand-contrast hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Enter {activeRole === 'super_admin' ? 'Super Admin Portal' : 'CampusConnect'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Pre-fills */}
            <div className="pt-4 border-t border-subtle">
              <span className="text-[11px] font-semibold text-muted-custom block mb-2">
                Quick Evaluator Access:
              </span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    handleRoleSelect('student');
                  }}
                  className="px-2.5 py-1 rounded-md bg-subtle hover:bg-surface border border-subtle text-muted-custom hover:text-main cursor-pointer"
                >
                  Arun (Student)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleRoleSelect('professor');
                  }}
                  className="px-2.5 py-1 rounded-md bg-subtle hover:bg-surface border border-subtle text-muted-custom hover:text-main cursor-pointer"
                >
                  Dr. Vikram (Faculty)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleRoleSelect('admin');
                  }}
                  className="px-2.5 py-1 rounded-md bg-subtle hover:bg-surface border border-subtle text-muted-custom hover:text-main cursor-pointer"
                >
                  Dr. Ramesh (Admin)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleRoleSelect('super_admin');
                    if (!setupStatus?.isVerified) {
                      setShowSetupModal(true);
                    }
                  }}
                  className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold cursor-pointer"
                >
                  Manasa Devi (Super Admin)
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Super Admin First-Time Setup Verification Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-subtle shadow-2xl p-6 sm:p-8 space-y-5 text-main">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-main">
                    Super Admin First-Time Setup
                  </h3>
                  <p className="text-xs text-muted-custom">
                    Cryptographic identity verification for {SUPER_ADMIN_EMAIL}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="text-xs text-muted-custom hover:text-main cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {setupSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-main">Verification Successful!</h4>
                <p className="text-xs text-muted-custom">
                  Super Admin credentials provisioned and session activated. Loading console...
                </p>
              </div>
            ) : (
              <form onSubmit={handleVerifySetup} className="space-y-4">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                  <div>
                    <span>Designated Setup Security Code: </span>
                    <strong className="font-mono bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded text-blue-800 dark:text-blue-100">
                      UNICORE-4077-SETUP
                    </strong>
                    <span className="block mt-1 text-[11px] text-muted-custom">
                      This one-time server token binds the authenticated session to manasadevi4077@gmail.com.
                    </span>
                  </div>
                </div>

                {setupError && (
                  <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{setupError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-main">
                    Enter Verification Setup Code
                  </label>
                  <input
                    type="text"
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value)}
                    required
                    placeholder="UNICORE-4077-SETUP"
                    className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-subtle bg-subtle/50 text-main focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-main">
                    Create Master Password
                  </label>
                  <input
                    type="password"
                    value={newMasterPassword}
                    onChange={(e) => setNewMasterPassword(e.target.value)}
                    required
                    placeholder="Set master security password (min 6 chars)"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-subtle bg-subtle/50 text-main focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-main">
                    Confirm Master Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter master password"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-subtle bg-subtle/50 text-main focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSetupModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-subtle text-main hover:bg-surface transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-brand text-brand-contrast hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
                  >
                    {loading ? 'Verifying...' : 'Verify & Activate Super Admin'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-subtle bg-surface px-4 py-4 text-center text-xs text-muted-custom">
        <span>© 2026 Unicore CampusConnect · College Management & Governance System</span>
      </footer>
    </div>
  );
};
