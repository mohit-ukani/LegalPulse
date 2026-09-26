'use client';

import React, { useState } from 'react';
import { Info, ShieldCheck, X, Briefcase, Buildings } from '@phosphor-icons/react';
import { ChallengePersona } from '@/lib/types';

interface LegalDisclaimerBannerProps {
  activePersona?: ChallengePersona;
}

export function LegalDisclaimerBanner({ activePersona = 'professional' }: LegalDisclaimerBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isBusiness = activePersona === 'business';

  if (dismissed) {
    return (
      <div className="bg-secondary/40 border-b border-border/60 px-4 py-1 text-[11px] text-muted-foreground flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Info size={13} className="text-muted-foreground" />
          <span>Legal Assistance for all professionals and businesses · Informational only, not formal legal counsel</span>
        </span>
        <button
          onClick={() => setDismissed(false)}
          className="text-foreground hover:underline cursor-pointer text-[11px] font-medium"
        >
          View Advisory
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
          <div className="text-[11.5px] leading-relaxed flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-foreground/10 text-foreground font-semibold border border-foreground/20">
              Vertical: Legal Assistance for All Professionals & Businesses
            </span>

            {isBusiness ? (
              <span className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-300 font-medium">
                <Buildings size={12} weight="bold" />
                <span>Enterprise B2B Context (Balancing 12-mo fee liability caps, mutual indemnity, Net-30 payment remedies & SLA credits)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium">
                <Briefcase size={12} weight="bold" />
                <span>Professional Context (Safeguarding employee labor rights, non-competes [Cal. Lab. Code §16600], off-hours IP carve-outs & fair notice)</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-medium text-foreground hover:underline cursor-pointer"
          >
            {expanded ? 'Less info' : 'View Framework'}
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

      {expanded && (
        <div className="max-w-[1600px] mx-auto mt-1.5 text-[11px] leading-relaxed text-muted-foreground border-t border-border/50 pt-1.5 space-y-1">
          <p>
            <strong>Dual-Persona Decision Architecture:</strong> LegalPulse dynamically switches risk tolerances, clause prioritization, and statutory benchmarking based on user context. For professionals, it prioritizes California Labor Code §16600 / Indian Contract Act §27 employee protections. For enterprise businesses, it evaluates UCC commercial standards, bilateral limitation of liability caps, and AAA arbitration procedures.
          </p>
          <p className="text-[10px] text-muted-foreground/80">
            Responsible AI Notice: All outputs are generated from grounded contract citations. Always consult qualified legal counsel before executing binding legal agreements.
          </p>
        </div>
      )}
    </aside>
  );
}
