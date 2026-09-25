'use client';

import React, { useState } from 'react';
import { Info, ShieldCheck, X } from '@phosphor-icons/react';

export function LegalDisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (dismissed) {
    return (
      <div className="bg-secondary/40 border-b border-border/60 px-4 py-1 text-[11px] text-muted-foreground flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Info size={13} className="text-muted-foreground" />
          Assistive legal intelligence · Informational only, not formal legal counsel
        </span>
        <button
          onClick={() => setDismissed(false)}
          className="text-foreground hover:underline cursor-pointer text-[11px] font-medium"
        >
          View Disclaimer
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Legal Assistance Disclaimer"
      className="bg-secondary/35 border-b border-border/60 text-muted-foreground px-4 py-1.5 text-xs transition-all"
    >
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-start md:items-center gap-2">
          <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 md:mt-0" />
          <div className="text-[11.5px] leading-relaxed">
            <span className="font-semibold text-foreground mr-1.5 tracking-tight">
              Responsible AI Advisory:
            </span>
            <span>
              LegalPulse is an AI document assistant designed to enhance legal accessibility. Outputs are strictly informational and do not constitute formal legal counsel.
            </span>
            {expanded && (
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground border-t border-border/50 pt-1.5">
                All identified risks, clauses, and suggested questions are generated from grounded document text. Enforceability of specific terms (e.g. non-compete covenants or training bonds) varies across jurisdictions (e.g., California Labor Code §16600, Section 27 of the Indian Contract Act). Always consult a qualified attorney for critical contractual commitments.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-medium text-foreground hover:underline cursor-pointer"
          >
            {expanded ? 'Less info' : 'Learn more'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-0.5 text-muted-foreground hover:text-foreground rounded cursor-pointer transition-colors"
            aria-label="Dismiss disclaimer"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
