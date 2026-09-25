'use client';

import React, { useState, useRef } from 'react';
import {
  FileText,
  UploadSimple,
  ArrowCounterClockwise,
  ShieldCheck,
  Sparkle,
  LockKey,
} from '@phosphor-icons/react';

interface EmptyWorkspaceProps {
  onOpenUpload: () => void;
  onRestoreSamples: () => void;
  onFileUpload?: (file: File) => void;
}

export function EmptyWorkspace({
  onOpenUpload,
  onRestoreSamples,
  onFileUpload,
}: EmptyWorkspaceProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0] && onFileUpload) {
      onFileUpload(e.dataTransfer.files[0]);
    } else if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onOpenUpload();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onFileUpload) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`h-full w-full flex items-center justify-center p-6 bg-background/50 overflow-y-auto transition-colors ${
        dragActive ? 'bg-primary/5 ring-2 ring-primary/40 ring-inset' : ''
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileInput}
        className="hidden"
      />

      <div className="max-w-xl w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Visual Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center text-muted-foreground shadow-xs">
          <FileText size={32} weight="duotone" className="text-foreground/80" />
        </div>

        {/* Text Heading & Rationale */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            No Documents Open in Active Session
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
            All documents have been removed from your workspace. Upload a legal contract (PDF) to begin grounded clause analysis, or restore the benchmark sample agreements.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onOpenUpload}
            className="w-full sm:w-auto h-9 px-4 rounded-xl bg-foreground text-background hover:opacity-90 font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.98]"
          >
            <UploadSimple size={15} weight="bold" />
            <span>Upload Contract (PDF)</span>
          </button>

          <button
            type="button"
            onClick={onRestoreSamples}
            className="w-full sm:w-auto h-9 px-4 rounded-xl border border-border hover:bg-secondary text-foreground font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowCounterClockwise size={15} />
            <span>Restore Benchmark Agreements</span>
          </button>
        </div>

        {/* Drag and Drop Zone Hint */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`p-4 rounded-xl border border-dashed transition-all cursor-pointer ${
            dragActive
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border/80 hover:border-foreground/30 bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground'
          }`}
        >
          <p className="text-xs font-medium">
            Or drag and drop your PDF agreement directly here
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
            Employment Contracts · NDAs · Vendor MSAs · Terms of Service (up to 25MB)
          </p>
        </div>

        {/* Value Proposition Micro-Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-left">
          <div className="p-3 rounded-xl bg-card border border-border/70 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <Sparkle size={13} className="text-primary" />
              <span>Grounded Citations</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Every AI finding links directly to the exact page and clause with yellow vellum highlighting.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>Risk Auditing</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Identifies restrictive non-competes, aggressive indemnity, clawbacks, and IP forfeiture.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <LockKey size={13} className="text-amber-500" />
              <span>Session Privacy</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              In-memory ephemeral parsing. Your contracts remain confidential in your browser session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
