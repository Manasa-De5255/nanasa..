import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { ShieldCheck, Moon, Sun, LogOut, Sparkles, User, Settings as SettingsIcon } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenSettings }) => {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useTheme();

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdminOrSuper = user?.role === 'admin' || isSuperAdmin;
  const isProfessor = user?.role === 'professor';

  const navLinks = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'timetable', label: 'Timetable' },
    ...(isProfessor ? [{ id: 'payslips', label: 'Payslips' }] : []),
    { id: 'requests', label: 'Request Box' },
    { id: 'exams', label: 'Exams' },
    { id: 'spots', label: 'Campus Spots' },
    ...(isAdminOrSuper ? [{ id: 'security', label: isSuperAdmin ? 'Super Admin' : 'Admin Hub' }] : []),
    { id: 'directory', label: 'Directory' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-subtle bg-surface/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark (Single Text Element) */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="text-left group flex items-center gap-2 cursor-pointer focus-visible:outline-none"
        >
          <span className="text-xl font-extrabold tracking-tight text-main whitespace-nowrap shrink-0 group-hover:opacity-85 transition-opacity">
            Unicore <span className="text-brand font-semibold">CampusConnect</span>
          </span>
          {isSuperAdmin && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
            </span>
          )}
        </button>

        {/* Zone 2: Navigation Links (single line, no pills) */}
        <nav className="hidden md:flex items-center gap-6 overflow-x-auto py-2 text-sm font-medium">
          {navLinks.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                  isActive
                    ? 'text-brand font-semibold'
                    : 'text-muted-custom hover:text-main'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Theme toggle, Settings, User Role & Logout) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={toggleMode}
            title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} appearance`}
            className="p-2 rounded-lg text-muted-custom hover:text-main hover:bg-subtle transition-colors cursor-pointer"
            aria-label="Toggle light/dark appearance"
          >
            {mode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenSettings}
            title="Theme & Portal Settings"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-subtle text-main border border-subtle hover:bg-surface transition-colors cursor-pointer"
          >
            <SettingsIcon className="w-3.5 h-3.5 text-muted-custom" />
            <span className="hidden sm:inline">Theme</span>
          </button>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-subtle">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-semibold text-main truncate max-w-[130px] leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-muted-custom capitalize leading-tight">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={logout}
                title="Sign out of CampusConnect"
                className="p-2 rounded-lg text-muted-custom hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="md:hidden flex items-center gap-4 overflow-x-auto px-4 py-2 border-t border-subtle text-xs font-medium no-scrollbar">
        {navLinks.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`whitespace-nowrap shrink-0 py-1 cursor-pointer ${
              activeTab === item.id ? 'text-brand font-bold border-b-2 border-brand' : 'text-muted-custom'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
