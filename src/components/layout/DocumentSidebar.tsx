'use client';

import React, { useEffect, useCallback } from 'react';
import {
  SidebarSimple,
  Plus,
  FileText,
  TrashSimple,
  CheckCircle,
  Sparkle,
  Gear,
  UploadSimple,
  ShieldWarning,
  X,
} from '@phosphor-icons/react';
import { LegalDocument } from '@/lib/types';
import { SAMPLE_DOC_A, SAMPLE_DOC_B } from '@/lib/sample-data';

interface DocumentSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  documents: LegalDocument[];
  currentDocId: string;
  onSelectDoc: (docId: string) => void;
  onRequestDeleteDoc: (doc: LegalDocument) => void;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  apiKeySet: boolean;
}

export function DocumentSidebar({
  isOpen,
  onToggle,
  documents,
  currentDocId,
  onSelectDoc,
  onRequestDeleteDoc,
  onOpenUpload,
  onOpenSettings,
  apiKeySet,
}: DocumentSidebarProps) {
  // Close on Escape when open on mobile
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    },
    [isOpen, onToggle]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const customDocs = documents.filter(
    (d) => d.id !== SAMPLE_DOC_A.id && d.id !== SAMPLE_DOC_B.id
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        aria-label="Document Navigation Sidebar"
        className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto flex flex-col bg-card/95 md:bg-card border-r border-border h-full transition-all duration-300 ease-in-out shrink-0 select-none ${
          isOpen
            ? 'w-72 translate-x-0 opacity-100 shadow-2xl md:shadow-none'
            : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden md:border-r-0 pointer-events-none'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-12 border-b border-border/80 px-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs tracking-tight text-foreground">
              Document Workspace
            </span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-secondary text-muted-foreground border border-border/60">
              {documents.length}
            </span>
          </div>

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <SidebarSimple size={16} />
          </button>
        </div>

        {/* Top Action: New Contract / Upload (ChatGPT style "+ New chat") */}
        <div className="p-3 border-b border-border/60 shrink-0">
          <button
            type="button"
            onClick={() => {
              onOpenUpload();
              // On mobile, close sidebar after clicking upload
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                onToggle();
              }
            }}
            className="w-full h-9 px-3 rounded-xl bg-foreground text-background hover:opacity-90 flex items-center justify-between text-xs font-medium shadow-xs transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <Plus size={14} weight="bold" />
              <span>Upload Contract</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background/20 font-normal">
              PDF
            </span>
          </button>
        </div>

        {/* Scrollable Document List (ChatGPT & Gemini chats style) */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {/* Section 1: Uploaded Documents */}
          <div>
            <div className="px-2 pb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Your Uploads</span>
              <span>{customDocs.length}</span>
            </div>

            {customDocs.length === 0 ? (
              <div className="p-3 mx-1 rounded-xl bg-secondary/40 border border-dashed border-border/80 text-center">
                <UploadSimple size={16} className="mx-auto text-muted-foreground/60 mb-1" />
                <p className="text-[11px] text-muted-foreground leading-snug">
                  No uploaded contracts yet.
                </p>
                <button
                  type="button"
                  onClick={onOpenUpload}
                  className="mt-2 text-[10px] font-medium text-foreground underline underline-offset-2 hover:opacity-80 cursor-pointer"
                >
                  Upload your first PDF
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {customDocs.map((doc) => {
                  const isActive = doc.id === currentDocId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => {
                        onSelectDoc(doc.id);
                        if (typeof window !== 'undefined' && window.innerWidth < 768) {
                          onToggle();
                        }
                      }}
                      className={`group relative flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-secondary text-foreground font-medium shadow-2xs border border-border/80'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                        <FileText
                          size={15}
                          className={`shrink-0 ${
                            isActive ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-medium text-foreground">
                            {doc.title}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            {doc.numPages} {doc.numPages === 1 ? 'Page' : 'Pages'}
                          </div>
                        </div>
                      </div>

                      {/* Right Actions: Delete icon on hover (like ChatGPT chat deletion) */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 group-hover:hidden" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRequestDeleteDoc(doc);
                          }}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg text-muted-foreground transition-all cursor-pointer"
                          title={`Delete "${doc.title}"`}
                          aria-label={`Delete ${doc.title}`}
                        >
                          <TrashSimple size={14} weight="bold" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Benchmark Agreements */}
          <div>
            <div className="px-2 pb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Benchmark Samples</span>
              <span>2</span>
            </div>

            <div className="space-y-1">
              {[SAMPLE_DOC_A, SAMPLE_DOC_B].map((doc) => {
                const isActive = doc.id === currentDocId;
                const isHighRisk = doc.id === SAMPLE_DOC_A.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      onSelectDoc(doc.id);
                      if (typeof window !== 'undefined' && window.innerWidth < 768) {
                        onToggle();
                      }
                    }}
                    className={`group relative flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-secondary text-foreground font-medium shadow-2xs border border-border/80'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileText
                        size={15}
                        className={`shrink-0 ${
                          isActive ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium text-foreground">
                          {doc.title.split('—')[0].trim()}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                          <span>{doc.numPages} Pages</span>
                          <span>·</span>
                          <span
                            className={
                              isHighRisk
                                ? 'text-red-600 dark:text-red-400 font-medium'
                                : 'text-emerald-600 dark:text-emerald-400 font-medium'
                            }
                          >
                            {isHighRisk ? 'High Risk' : 'Negotiated'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 ml-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer: AI Engine Status & Configuration */}
        <div className="p-3 border-t border-border/80 bg-secondary/30 shrink-0">
          <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/80 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  apiKeySet ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'
                }`}
              />
              <div className="truncate">
                <div className="text-[11px] font-semibold text-foreground truncate">
                  Gemini 3.8 Flash
                </div>
                <div className="text-[9px] text-muted-foreground truncate">
                  {apiKeySet ? 'Cloud API Active' : 'Offline RAG Mode'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
              title="Configure API Engine"
              aria-label="Configure API Engine"
            >
              <Gear size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
