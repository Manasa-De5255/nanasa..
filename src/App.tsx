/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { ThemeSettingsModal } from './components/ThemeSettingsModal.tsx';
import { DashboardOverview } from './components/DashboardOverview.tsx';
import { TimetableModule } from './components/TimetableModule.tsx';
import { PayslipsModule } from './components/PayslipsModule.tsx';
import { RequestsModule } from './components/RequestsModule.tsx';
import { CampusSpotsModule } from './components/CampusSpotsModule.tsx';
import { ExamsModule } from './components/ExamsModule.tsx';
import { DirectoryModule } from './components/DirectoryModule.tsx';
import { SuperAdminConsole } from './components/SuperAdminConsole.tsx';
import { VoiceAssistantModal } from './components/VoiceAssistantModal.tsx';
import { Sparkles, ShieldCheck } from 'lucide-react';

function MainApp() {
  const { user } = useAuth();
  const { currentThemeDef } = useTheme();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);

  // If user is not authenticated, display login interface
  if (!user) {
    return (
      <>
        <LoginPage onOpenThemeSettings={() => setShowThemeModal(true)} />
        <ThemeSettingsModal
          isOpen={showThemeModal}
          onClose={() => setShowThemeModal(false)}
        />
      </>
    );
  }

  const isSuperAdmin = user.role === 'super_admin';
  const isAdmin = user.role === 'admin' || isSuperAdmin;

  return (
    <div className="min-h-screen bg-base text-main flex flex-col justify-between transition-colors selection:bg-brand selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setShowThemeModal(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenVoiceAI={() => setShowVoiceModal(true)}
          />
        )}

        {activeTab === 'timetable' && <TimetableModule />}

        {activeTab === 'payslips' && <PayslipsModule />}

        {activeTab === 'requests' && <RequestsModule />}

        {activeTab === 'exams' && <ExamsModule />}

        {activeTab === 'spots' && <CampusSpotsModule />}

        {activeTab === 'directory' && <DirectoryModule />}

        {activeTab === 'security' && <SuperAdminConsole />}
      </main>

      {/* Floating Multilingual Voice AI Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setShowVoiceModal(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-brand text-brand-contrast shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="Open Unicore Mitra Voice Assistant (Tamil, English, Hindi, Telugu, Malayalam)"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-bold tracking-wide hidden sm:inline">
            Voice Mitra AI
          </span>
        </button>
      </div>

      {/* Theme Studio Settings Modal */}
      <ThemeSettingsModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
      />

      {/* Footer */}
      <footer className="w-full border-t border-subtle bg-surface/80 py-5 text-xs text-muted-custom transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-main">Unicore CampusConnect</span>
            <span>·</span>
            <span>Institutional Governance & Learning Management Portal</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Theme: {currentThemeDef.name}</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Zero Trust Authorized
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
