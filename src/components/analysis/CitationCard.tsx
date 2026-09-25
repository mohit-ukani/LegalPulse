'use client';

import React from 'react';
import { BookmarkSimple, ArrowRight, ShieldWarning, CheckCircle, Warning } from '@phosphor-icons/react';
import { Citation } from '@/lib/types';

interface CitationCardProps {
  citation: Citation;
  onJumpToPdf: (citation: Citation) => void;
  isActive?: boolean;
}

export function CitationCard({ citation, onJumpToPdf, isActive }: CitationCardProps) {
  const isHighRisk = citation.riskLevel === 'high';
  const isMediumRisk = citation.riskLevel === 'medium';

  return (
    <div
      onClick={() => onJumpToPdf(citation)}
      className={`p-3 rounded-xl border text-xs transition-all duration-150 cursor-pointer ${
        isActive
          ? 'bg-amber-400/10 dark:bg-amber-400/5 border-amber-500/60 ring-1 ring-amber-500/30 shadow-2xs'
          : 'bg-card hover:bg-secondary/50 border-border/80 shadow-2xs hover:border-foreground/20'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-foreground">
          <BookmarkSimple
            size={13}
            weight={isActive ? 'fill' : 'bold'}
            className={isActive ? 'text-amber-500' : 'text-muted-foreground'}
          />
          <span>{citation.sectionNumber}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">Page {citation.pageNumber}</span>
        </div>

        {citation.riskLevel && (
          <span
            className={`text-[9.5px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              isHighRisk
                ? 'bg-risk-high-bg text-risk-high-text border-risk-high-border'
                : isMediumRisk
                ? 'bg-risk-medium-bg text-risk-medium-text border-risk-medium-border'
                : 'bg-risk-low-bg text-risk-low-text border-risk-low-border'
            }`}
          >
            {isHighRisk && <ShieldWarning size={10} weight="fill" />}
            {isMediumRisk && <Warning size={10} weight="fill" />}
            {!isHighRisk && !isMediumRisk && <CheckCircle size={10} weight="fill" />}
            {citation.riskLevel} Risk
          </span>
        )}
      </div>

      <blockquote className="border-l-2 border-border pl-2.5 my-1.5 italic text-foreground/80 font-serif text-[12px] leading-relaxed line-clamp-3">
        &ldquo;{citation.quote}&rdquo;
      </blockquote>

      {citation.relevanceExplanation && (
        <p className="text-[11px] text-muted-foreground mt-1 leading-normal">
          {citation.relevanceExplanation}
        </p>
      )}

      <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-foreground font-medium">
        <span className="flex items-center gap-1 hover:underline">
          Verify in PDF Viewer
          <ArrowRight size={10} />
        </span>
        <span className="text-muted-foreground font-mono">
          Click to Ground
        </span>
      </div>
    </div>
  );
}
