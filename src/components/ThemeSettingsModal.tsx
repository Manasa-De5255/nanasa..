import React from 'react';
import { useTheme, THEME_LIST } from '../context/ThemeContext.tsx';
import { PortalTheme } from '../types/index.ts';
import { X, Check, Moon, Sun, Palette, Sparkles, Sliders } from 'lucide-react';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, mode, setMode } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl rounded-2xl bg-surface border border-subtle shadow-2xl p-6 sm:p-8 space-y-6 text-main"
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand/10 text-brand">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 id="theme-modal-title" className="text-lg font-bold text-main">
                Appearance & Theme Studio
              </h2>
              <p className="text-xs text-muted-custom">
                Select your preferred institutional palette and appearance mode. Saved permanently to your account profile.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-custom hover:text-main hover:bg-subtle transition-colors cursor-pointer"
            aria-label="Close theme settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Light / Dark Mode Segmented Control */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-custom">
            Color Scheme Mode
          </label>
          <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-subtle border border-subtle">
            <button
              onClick={() => setMode('light')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'light'
                  ? 'bg-surface text-main shadow-xs border border-subtle'
                  : 'text-muted-custom hover:text-main'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              Light Appearance
            </button>
            <button
              onClick={() => setMode('dark')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'dark'
                  ? 'bg-surface text-main shadow-xs border border-subtle'
                  : 'text-muted-custom hover:text-main'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              Dark Appearance
            </button>
          </div>
        </div>

        {/* 5 Distinct Themes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-custom">
              Select Curated Theme Palette
            </label>
            <span className="text-xs text-muted-custom font-mono">5 Palettes Available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
            {THEME_LIST.map((t) => {
              const isSelected = theme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`group relative p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand bg-brand/5 shadow-xs ring-1 ring-brand'
                      : 'border-subtle bg-surface hover:border-brand/40 hover:bg-subtle/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-main">{t.name}</span>
                        {t.id === 'academic-blue' && (
                          <span className="text-[10px] font-semibold text-brand px-1.5 py-0.5 rounded bg-brand/10 border border-brand/20">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-custom line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="p-1 rounded-full bg-brand text-brand-contrast shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Visual Swatch Strip */}
                  <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-subtle">
                    <span className="text-[10px] text-muted-custom font-mono mr-1">Preview:</span>
                    <span
                      className="w-5 h-5 rounded-md border border-black/10 shadow-2xs"
                      style={{ backgroundColor: t.previewColors.primary }}
                      title="Primary brand"
                    />
                    <span
                      className="w-5 h-5 rounded-md border border-black/10 shadow-2xs"
                      style={{ backgroundColor: t.previewColors.secondary }}
                      title="Secondary shade"
                    />
                    <span
                      className="w-5 h-5 rounded-md border border-black/10 shadow-2xs"
                      style={{ backgroundColor: t.previewColors.surface }}
                      title="Surface background"
                    />
                    <span
                      className="w-5 h-5 rounded-md border border-black/10 shadow-2xs"
                      style={{ backgroundColor: t.previewColors.accent }}
                      title="Accent"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Semantic Status Colors Reference */}
        <div className="pt-2 border-t border-subtle">
          <div className="text-[11px] text-muted-custom flex flex-wrap items-center gap-3">
            <span className="font-semibold">Workflow Status Indicators:</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium status-pending">Pending</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium status-approved">Approved</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium status-forwarded">Forwarded</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium status-resolved">Resolved</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium status-closed">Closed</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-brand text-brand-contrast hover:opacity-90 transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
