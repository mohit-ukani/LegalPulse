'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  UploadSimple,
  FileText,
  Sparkle,
  CheckCircle,
  WarningCircle,
  FilePdf,
  TrashSimple,
} from '@phosphor-icons/react';
import { LegalDocument } from '@/lib/types';
import { SAMPLE_DOC_A, SAMPLE_DOC_B } from '@/lib/sample-data';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentLoaded: (doc: LegalDocument) => void;
  uploadedDocs?: LegalDocument[];
  onDeleteDocument?: (doc: LegalDocument) => void;
  onSelectDocument?: (docId: string) => void;
}

export function UploadModal({
  isOpen,
  onClose,
  onDocumentLoaded,
  uploadedDocs,
  onDeleteDocument,
  onSelectDocument,
}: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) onClose();
  }, [onClose, loading]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF document.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('File size exceeds the 25MB limit.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.document) {
        onDocumentLoaded(data.document);
        onClose();
      } else {
        setError(data.error || 'Failed to parse the PDF document.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(`Upload failed: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in" role="dialog" aria-modal="true" aria-labelledby="upload-modal-title">
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <UploadSimple size={18} weight="bold" />
            </div>
            <div>
              <h3 id="upload-modal-title" className="font-bold text-sm text-foreground">
                Upload Legal Document (PDF)
              </h3>
              <p className="text-xs text-muted-foreground">
                Automatic clause segmentation, page indexing & RAG embedding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drag and drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-secondary/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleChange}
            className="hidden"
          />

          <div className="p-3 rounded-full bg-secondary text-primary">
            <FilePdf size={28} />
          </div>

          <div>
            <div className="text-xs font-semibold text-foreground">
              {loading ? 'Analyzing and chunking PDF...' : 'Click to upload or drag & drop PDF'}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Employment contracts, NDAs, Master Service Agreements, T&Cs (up to 25MB)
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-xs text-primary font-medium mt-1">
              <Sparkle size={14} className="animate-spin" />
              <span>Building grounded vector index...</span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <WarningCircle size={15} weight="fill" className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Uploaded Contracts Management Section */}
        {uploadedDocs && uploadedDocs.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Your Uploaded Documents ({uploadedDocs.length})</span>
              <span className="text-[10px] font-normal normal-case text-muted-foreground">Click to load or delete</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {uploadedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/80 text-xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectDocument) {
                        onSelectDocument(doc.id);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-2 min-w-0 text-left cursor-pointer flex-1 mr-2"
                  >
                    <FileText size={14} className="text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1 truncate">
                      <div className="font-medium text-foreground truncate">{doc.title}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {doc.numPages} {doc.numPages === 1 ? 'Page' : 'Pages'} · {doc.documentType.toUpperCase()}
                      </div>
                    </div>
                  </button>
                  {onDeleteDocument && (
                    <button
                      type="button"
                      onClick={() => onDeleteDocument(doc)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                      title={`Delete "${doc.title}"`}
                      aria-label={`Delete ${doc.title}`}
                    >
                      <TrashSimple size={14} weight="bold" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Sample Contracts Section */}
        <div className="space-y-2 pt-1 border-t border-border">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Or test instantly with pre-loaded contracts:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => {
                onDocumentLoaded(SAMPLE_DOC_A);
                onClose();
              }}
              className="p-2.5 rounded-lg border border-border bg-card hover:bg-secondary text-left text-xs transition-colors cursor-pointer"
            >
              <div className="font-semibold text-foreground truncate">
                Apex Agreement (Original)
              </div>
              <div className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                4 Pages · High Risk Clauses Included
              </div>
            </button>

            <button
              onClick={() => {
                onDocumentLoaded(SAMPLE_DOC_B);
                onClose();
              }}
              className="p-2.5 rounded-lg border border-border bg-card hover:bg-secondary text-left text-xs transition-colors cursor-pointer"
            >
              <div className="font-semibold text-foreground truncate">
                Negotiated Agreement (v2)
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                4 Pages · Balanced & Fair Standard
              </div>
            </button>
          </div>
        </div>

        {/* Security & Privacy Notice */}
        <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1">
          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
            <CheckCircle size={12} weight="fill" />
            In-Memory Ephemeral Storage
          </span>
          <span>Zero Persistent Data Leakage</span>
        </div>
      </div>
    </div>
  );
}
