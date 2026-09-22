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
      className={`p-3 rounded-lg border text-xs transition-all duration-200 cursor-pointer ${
        isActive
          ? 'bg-amber-500/10 border-amber-500 shadow-xs'
          : 'bg-secondary/50 hover:bg-secondary border-border'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-foreground">
          <BookmarkSimple
            size={14}
            weight={isActive ? 'fill' : 'bold'}
            className={isActive ? 'text-amber-600' : 'text-primary'}
          />
          <span>{citation.sectionNumber}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">Page {citation.pageNumber}</span>
        </div>

        {citation.riskLevel && (
          <span
            className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded flex items-center gap-1 ${
              isHighRisk
                ? 'bg-red-500/15 text-red-700 dark:text-red-300'
                : isMediumRisk
                ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            {isHighRisk && <ShieldWarning size={11} weight="fill" />}
            {isMediumRisk && <Warning size={11} weight="fill" />}
            {!isHighRisk && !isMediumRisk && <CheckCircle size={11} weight="fill" />}
            {citation.riskLevel} Risk
          </span>
        )}
      </div>

      <blockquote className="border-l-2 border-primary/30 pl-2.5 my-1.5 italic text-foreground/80 font-serif leading-relaxed line-clamp-3">
        &ldquo;{citation.quote}&rdquo;
      </blockquote>

      {citation.relevanceExplanation && (
        <p className="text-[11px] text-muted-foreground mt-1 leading-normal">
          {citation.relevanceExplanation}
        </p>
      )}

      <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-primary font-medium">
        <span className="flex items-center gap-1 hover:underline">
          Verify in PDF Viewer
          <ArrowRight size={11} />
        </span>
        <span className="text-muted-foreground font-mono">
          Click to Ground
        </span>
      </div>
    </div>
  );
}
