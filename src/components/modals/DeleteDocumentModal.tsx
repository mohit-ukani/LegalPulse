'use client';

import React, { useEffect, useCallback } from 'react';
import { X, TrashSimple, WarningCircle, FileText } from '@phosphor-icons/react';
import { LegalDocument } from '@/lib/types';

interface DeleteDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: LegalDocument | null;
  onConfirmDelete: (docId: string) => void;
}

export function DeleteDocumentModal({
  isOpen,
  onClose,
  document,
  onConfirmDelete,
}: DeleteDocumentModalProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !document) return null;

  const handleDelete = () => {
    onConfirmDelete(document.id);
    onClose();
  };

  const uploadFormatted = document.uploadedAt
    ? new Date(document.uploadedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Session Upload';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-doc-modal-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
              <TrashSimple size={18} weight="bold" />
            </div>
            <div>
              <h3 id="delete-doc-modal-title" className="font-bold text-sm text-foreground">
                Delete Uploaded Document
              </h3>
              <p className="text-xs text-muted-foreground">
                Permanent session removal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Document Card Preview */}
        <div className="p-3 rounded-xl bg-secondary/60 border border-border/80 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-background border border-border/60 text-muted-foreground mt-0.5 shrink-0">
            <FileText size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-foreground line-clamp-1">
              {document.title}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 font-mono">
              {document.filename}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-background border border-border/60 font-mono">
                {document.numPages} {document.numPages === 1 ? 'Page' : 'Pages'}
              </span>
              <span>·</span>
              <span>{uploadFormatted}</span>
            </div>
          </div>
        </div>

        {/* Warning Note */}
        <div className="p-3 rounded-xl bg-risk-high-bg border border-risk-high-border text-risk-high-text flex items-start gap-2.5 text-xs">
          <WarningCircle size={16} weight="fill" className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
          <div className="leading-relaxed text-[11px]">
            Are you sure you want to delete this document? This will remove all parsed clauses, risk citations, and active analysis from your workspace session.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-border hover:bg-secondary text-foreground transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <TrashSimple size={14} weight="bold" />
            Delete Document
          </button>
        </div>
      </div>
    </div>
  );
}
