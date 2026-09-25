'use client';

import React, { useState, useEffect } from 'react';
import {
  Scales,
  UploadSimple,
  GitDiff,
  Sun,
  Moon,
  CheckCircle,
  Sparkle,
  CaretDown,
  FileText,
  DownloadSimple,
  TrashSimple,
  SidebarSimple,
} from '@phosphor-icons/react';
import { LegalDocument } from '@/lib/types';

interface NavbarProps {
  currentDoc?: LegalDocument | null;
  onSelectDoc: (docId: string) => void;
  availableDocs: LegalDocument[];
  activeMode: 'workstation' | 'comparison';
  onSelectMode: (mode: 'workstation' | 'comparison') => void;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  onOpenExport?: () => void;
  onRequestDeleteDoc?: (doc: LegalDocument) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
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
  onRequestDeleteDoc,
  onToggleSidebar,
  isSidebarOpen,
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
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/80 transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-13 flex items-center justify-between gap-4">
        {/* Brand & Logo + Sidebar Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg border border-border/80 bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0"
              title={isSidebarOpen ? 'Collapse documents sidebar' : 'Open documents sidebar'}
              aria-label={isSidebarOpen ? 'Collapse documents sidebar' : 'Open documents sidebar'}
            >
              <SidebarSimple size={15} />
            </button>
          )}

          <div className="w-7 h-7 rounded-md bg-foreground text-background flex items-center justify-center shadow-xs">
            <Scales size={15} weight="bold" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-foreground">
              LegalPulse
            </span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border/70 font-medium hidden sm:inline-block">
              Studio
            </span>
          </div>
        </div>

        {/* Middle: Document Selector & Mode Switch */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-1 min-w-0 max-w-md lg:max-w-xl">
          {/* Document Switcher Dropdown */}
          <div className="relative flex-1 min-w-0 max-w-[220px] lg:max-w-xs">
            <button
              onClick={() => setDocDropdownOpen(!docDropdownOpen)}
              aria-haspopup="listbox"
              aria-expanded={docDropdownOpen}
              className="w-full h-8 px-2.5 rounded-lg bg-secondary/70 hover:bg-secondary text-foreground border border-border/70 flex items-center justify-between text-xs font-medium transition-all cursor-pointer min-w-0"
              title={currentDoc ? currentDoc.title : 'No active document'}
            >
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <FileText size={14} className="text-muted-foreground shrink-0" />
                <span className="truncate text-xs">
                  {currentDoc ? currentDoc.title : 'No documents in session'}
                </span>
              </div>
              <CaretDown size={11} className="text-muted-foreground shrink-0 ml-1" />
            </button>

            {docDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDocDropdownOpen(false)}
                />
                <div className="absolute left-0 top-9.5 z-50 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl py-1.5 text-xs w-[340px] max-w-[90vw] ring-1 ring-black/5 dark:ring-white/10" role="listbox" aria-label="Available documents">
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase text-muted-foreground tracking-wider border-b border-border/50 mb-1">
                    Select Document
                  </div>
                  {availableDocs.length === 0 ? (
                    <div className="px-3 py-3 text-center text-xs text-muted-foreground">
                      No documents in active session.
                    </div>
                  ) : (
                    availableDocs.map((doc) => {
                      const isUploaded = doc.id !== 'doc-apex-emp-v1' && doc.id !== 'doc-apex-emp-v2';
                      const isSelected = Boolean(currentDoc && doc.id === currentDoc.id);
                      return (
                        <div
                          key={doc.id}
                          onClick={() => {
                            onSelectDoc(doc.id);
                            setDocDropdownOpen(false);
                          }}
                          className={`group w-full px-3 py-2 text-left flex items-start gap-2 hover:bg-secondary/80 transition-colors cursor-pointer ${
                            isSelected ? 'bg-secondary font-medium text-foreground' : ''
                          }`}
                        >
                          <FileText size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                          <div className="truncate min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="truncate">{doc.title}</span>
                              {isUploaded ? (
                                <span className="shrink-0 text-[9px] font-mono px-1 py-0.2 rounded bg-foreground/5 text-foreground/80 border border-border/80 font-medium">
                                  Uploaded
                                </span>
                              ) : (
                                <span className="shrink-0 text-[9px] font-mono px-1 py-0.2 rounded bg-secondary text-muted-foreground border border-border/60">
                                  Sample
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                              {doc.numPages} {doc.numPages === 1 ? 'Page' : 'Pages'} · {doc.documentType.toUpperCase()}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            {isSelected && (
                              <CheckCircle size={14} className="text-foreground shrink-0" weight="fill" />
                            )}
                          {isUploaded && onRequestDeleteDoc && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDocDropdownOpen(false);
                                onRequestDeleteDoc(doc);
                              }}
                              className="p-1 rounded-md text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 opacity-70 group-hover:opacity-100 transition-all cursor-pointer"
                              title={`Delete uploaded contract "${doc.title}"`}
                              aria-label={`Delete ${doc.title}`}
                            >
                              <TrashSimple size={13} weight="bold" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }))}

                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={() => {
                        setDocDropdownOpen(false);
                        onOpenUpload();
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-secondary/80 text-foreground font-medium cursor-pointer"
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
          <div className="flex bg-secondary/80 p-0.5 rounded-lg border border-border/70 shrink-0">
            <button
              onClick={() => onSelectMode('workstation')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeMode === 'workstation'
                  ? 'bg-card text-foreground shadow-2xs font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Workstation
            </button>
            <button
              onClick={() => onSelectMode('comparison')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                activeMode === 'comparison'
                  ? 'bg-card text-foreground shadow-2xs font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <GitDiff size={13} />
              <span>Compare</span>
              <span className="hidden xl:inline">Versions</span>
            </button>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="h-8 px-2.5 sm:px-3 rounded-lg border border-border/80 bg-secondary/60 hover:bg-secondary text-foreground text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Export Executive Legal Audit Brief"
            >
              <DownloadSimple size={14} />
              <span className="hidden lg:inline">Export Brief</span>
              <span className="inline lg:hidden">Export</span>
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className="h-8 px-2.5 sm:px-3 rounded-lg bg-foreground text-background hover:opacity-90 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
          >
            <UploadSimple size={14} weight="bold" />
            <span className="hidden sm:inline">Upload PDF</span>
          </button>

          <button
            onClick={onOpenSettings}
            className={`h-8 px-2 sm:px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              apiKeySet
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'border-border/80 bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground'
            }`}
            title="Configure Gemini API Settings"
          >
            <Sparkle size={13} className={apiKeySet ? 'text-emerald-500' : 'text-muted-foreground'} />
            <span className="hidden sm:inline">{apiKeySet ? 'Gemini 3.8' : 'AI Engine'}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="h-8 w-8 rounded-lg border border-border/80 bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer shrink-0"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </header>
  );
}
