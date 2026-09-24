'use client';

import React, { useState, useEffect } from 'react';
import {
  Scales,
  UploadSimple,
  GitDiff,
  Gear,
  Sun,
  Moon,
  CheckCircle,
  Sparkle,
  CaretDown,
  FileText,
  DownloadSimple,
} from '@phosphor-icons/react';
import { LegalDocument } from '@/lib/types';

interface NavbarProps {
  currentDoc: LegalDocument;
  onSelectDoc: (docId: string) => void;
  availableDocs: LegalDocument[];
  activeMode: 'workstation' | 'comparison';
  onSelectMode: (mode: 'workstation' | 'comparison') => void;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  onOpenExport?: () => void;
  apiKeySet: boolean;
}

export function Navbar({
  currentDoc,
  onSelectDoc,
  availableDocs,
  activeMode,
  onSelectMode,
  onOpenUpload,
  onOpenSettings,
  onOpenExport,
  apiKeySet,
}: NavbarProps) {
  const [docDropdownOpen, setDocDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark mode from localStorage or system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('legalpulse_theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
        setIsDark(true);
      } else {
        document.documentElement.classList.remove('dark');
        setIsDark(false);
      }
    }
  }, []);

  const toggleTheme = () => {
    if (typeof document !== 'undefined') {
      const nextDark = !isDark;
      if (nextDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('legalpulse_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('legalpulse_theme', 'light');
      }
      setIsDark(nextDark);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border shadow-xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <Scales size={18} weight="bold" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base tracking-tight text-foreground">
              LegalPulse
            </span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-accent/15 text-emerald-700 dark:text-emerald-300 font-semibold">
              AI Workstation
            </span>
          </div>
        </div>

        {/* Middle: Document Selector & Mode Switch */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-xl">
          {/* Document Switcher Dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => setDocDropdownOpen(!docDropdownOpen)}
              aria-haspopup="listbox"
              aria-expanded={docDropdownOpen}
              className="w-full h-8.5 px-3 rounded-md bg-secondary hover:bg-muted text-foreground border border-border flex items-center justify-between text-xs font-medium transition-colors cursor-pointer"
              title={currentDoc.title}
            >
              <div className="flex items-center gap-2 truncate">
                <FileText size={15} className="text-muted-foreground shrink-0" />
                <span className="truncate">{currentDoc.title}</span>
              </div>
              <CaretDown size={12} className="text-muted-foreground shrink-0 ml-1.5" />
            </button>

            {docDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDocDropdownOpen(false)}
                />
                <div className="absolute left-0 right-0 top-10 z-50 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg py-1.5 text-xs" role="listbox" aria-label="Available documents">
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
                    Select Document
                  </div>
                  {availableDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        onSelectDoc(doc.id);
                        setDocDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-start gap-2 hover:bg-secondary transition-colors cursor-pointer ${
                        doc.id === currentDoc.id ? 'bg-accent/10 font-semibold text-emerald-800 dark:text-emerald-300' : ''
                      }`}
                    >
                      <FileText size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                      <div className="truncate">
                        <div className="truncate">{doc.title}</div>
                        <div className="text-[10px] text-muted-foreground font-normal">
                          {doc.numPages} Pages · {doc.documentType.toUpperCase()}
                        </div>
                      </div>
                      {doc.id === currentDoc.id && (
                        <CheckCircle size={14} className="ml-auto mt-0.5 text-emerald-600 shrink-0" weight="fill" />
                      )}
                    </button>
                  ))}

                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={() => {
                        setDocDropdownOpen(false);
                        onOpenUpload();
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-secondary text-primary font-medium cursor-pointer"
                    >
                      <UploadSimple size={14} />
                      Upload Custom Contract (PDF)...
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mode Tabs: Workstation vs Comparison */}
          <div className="flex bg-secondary p-0.5 rounded-md border border-border shrink-0">
            <button
              onClick={() => onSelectMode('workstation')}
              className={`px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                activeMode === 'workstation'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Workstation
            </button>
            <button
              onClick={() => onSelectMode('comparison')}
              className={`px-3 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'comparison'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <GitDiff size={13} />
              Compare Versions
            </button>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="h-8.5 px-3 rounded-md border border-border bg-secondary hover:bg-muted text-foreground text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Export Executive Legal Audit Brief"
            >
              <DownloadSimple size={14} />
              <span className="hidden sm:inline">Export Brief</span>
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className="h-8.5 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <UploadSimple size={14} weight="bold" />
            <span className="hidden sm:inline">Upload PDF</span>
          </button>

          <button
            onClick={onOpenSettings}
            className={`h-8.5 px-2.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              apiKeySet
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-border bg-secondary hover:bg-muted text-foreground'
            }`}
            title="Configure Gemini API Settings"
          >
            <Sparkle size={14} className={apiKeySet ? 'text-emerald-500' : 'text-muted-foreground'} />
            <span className="hidden sm:inline">{apiKeySet ? 'Gemini Active' : 'AI Engine'}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="h-8.5 w-8.5 rounded-md border border-border bg-secondary hover:bg-muted text-foreground flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
}
