'use client';

import React, { useState } from 'react';
import { Info, ShieldCheck, X } from '@phosphor-icons/react';

export function LegalDisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (dismissed) {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Info size={14} className="text-amber-600 dark:text-amber-400" />
          Assistive AI tool · Not formal legal advice
        </span>
        <button
          onClick={() => setDismissed(false)}
          className="underline hover:text-amber-900 dark:hover:text-amber-200 cursor-pointer text-[11px]"
        >
          View Disclaimer
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Legal Assistance Disclaimer"
      className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-start md:items-center gap-2">
          <ShieldCheck size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 md:mt-0" />
          <div>
            <span className="font-semibold text-amber-950 dark:text-amber-100 mr-1.5">
              LEGAL ASSISTANCE & RESPONSIBLE AI NOTICE:
            </span>
            <span>
              LegalPulse is an AI document assistant designed to enhance legal accessibility. Outputs are strictly informational and do not constitute formal legal advice or an attorney-client relationship.
            </span>
            {expanded && (
              <p className="mt-2 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                All identified risks, clauses, and suggested questions are generated from document text grounding. Enforceability of specific terms (e.g. non-compete covenants or training bonds) varies across jurisdictions (e.g., California Labor Code §16600, Section 27 of the Indian Contract Act). Always consult a qualified attorney for critical contractual commitments.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-medium underline hover:text-amber-950 dark:hover:text-amber-100 cursor-pointer"
          >
            {expanded ? 'Less info' : 'Learn more'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-amber-700 hover:text-amber-950 dark:text-amber-400 dark:hover:text-amber-100 rounded cursor-pointer"
            aria-label="Dismiss disclaimer"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
