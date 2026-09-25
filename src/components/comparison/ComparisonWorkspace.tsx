'use client';

import React, { useState } from 'react';
import {
  GitDiff,
  ShieldCheck,
  CheckCircle,
  Sparkle,
  PlusCircle,
  MinusCircle,
  BookmarkSimple,
} from '@phosphor-icons/react';
import { ContractComparisonResult } from '@/lib/types';
import { SAMPLE_COMPARISON, SAMPLE_DOC_A, SAMPLE_DOC_B } from '@/lib/sample-data';

interface ComparisonWorkspaceProps {
  onBackToWorkstation: () => void;
  onSelectDoc?: (docId: string) => void;
  apiKey?: string;
}

export function ComparisonWorkspace({
  onBackToWorkstation,
  onSelectDoc,
  apiKey,
}: ComparisonWorkspaceProps) {
  const [comparison, setComparison] = useState<ContractComparisonResult>(SAMPLE_COMPARISON);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loadingComparison, setLoadingComparison] = useState(false);

  // Call /api/compare endpoint to verify bilateral comparison
  React.useEffect(() => {
    let isMounted = true;
    async function fetchComparison() {
      try {
        setLoadingComparison(true);
        const res = await fetch('/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            docAId: SAMPLE_DOC_A.id,
            docBId: SAMPLE_DOC_B.id,
            apiKey: apiKey && apiKey.trim() ? apiKey.trim() : undefined,
          }),
        });
        const data = await res.json();
        if (isMounted && data.success && data.comparison) {
          setComparison(data.comparison);
        }
      } catch (err) {
        console.warn('Using baseline comparison matrix:', err);
      } finally {
        if (isMounted) setLoadingComparison(false);
      }
    }
    fetchComparison();
    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  const categories = ['all', ...new Set(comparison.differences.map((d) => d.category))];

  const filteredDifferences =
    activeCategory === 'all'
      ? comparison.differences
      : comparison.differences.filter((d) => d.category === activeCategory);

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      {/* Top Banner Header */}
      <div className="bg-card border-b border-border/80 px-4 sm:px-6 py-3.5 sticky top-0 z-10 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center text-foreground">
                <GitDiff size={15} weight="bold" />
              </div>
              <h2 className="text-sm sm:text-base font-semibold tracking-tight text-foreground">
                Bilateral Contract Comparison & Risk Delta
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-3xl leading-relaxed">
              {comparison.summary}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onSelectDoc && (
              <>
                <button
                  onClick={() => onSelectDoc(comparison.docAId)}
                  className="px-2.5 py-1.5 rounded-lg border border-border/80 bg-card hover:bg-secondary text-xs font-medium text-foreground transition-all cursor-pointer shadow-2xs"
                >
                  View V1 in Workstation
                </button>
                <button
                  onClick={() => onSelectDoc(comparison.docBId)}
                  className="px-2.5 py-1.5 rounded-lg border border-border/80 bg-card hover:bg-secondary text-xs font-medium text-foreground transition-all cursor-pointer shadow-2xs"
                >
                  View V2 in Workstation
                </button>
              </>
            )}
            <button
              onClick={onBackToWorkstation}
              className="px-3 py-1.5 rounded-lg border border-border/80 bg-secondary/70 hover:bg-secondary text-xs font-medium text-foreground transition-all cursor-pointer shadow-2xs"
            >
              Back to Split Workstation
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-5 w-full">
        {/* Loading State */}
        {loadingComparison && (
          <div className="p-8 rounded-2xl border border-border/80 bg-card flex flex-col items-center justify-center space-y-2.5 text-center shadow-2xs">
            <Sparkle size={18} className="animate-spin text-foreground" />
            <div className="text-xs font-medium text-foreground">Analyzing bilateral contract provisions...</div>
            <div className="text-[11px] text-muted-foreground max-w-sm">
              Comparing clause-by-clause differences, risk shifts, and strategic implications across both agreements.
            </div>
          </div>
        )}

        {/* Strategic Takeaways Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-secondary/40 border border-border/80 text-xs space-y-2.5 shadow-2xs">
          <div className="font-semibold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <ShieldCheck size={15} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
            Strategic Upgrades in Revised Agreement (Version 2)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-foreground/90 text-[12px]">
            {comparison.strategicAdvice.map((advice, i) => (
              <div key={i} className="flex items-start gap-2 leading-relaxed">
                <CheckCircle size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" weight="fill" />
                <span>{advice}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Added vs Removed Clauses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Removed High-Risk Clauses */}
          <div className="p-4 sm:p-5 rounded-2xl border border-risk-high-border/70 bg-card space-y-2.5 shadow-2xs">
            <div className="text-xs font-semibold uppercase tracking-wider text-risk-high-text flex items-center gap-1.5">
              <MinusCircle size={15} weight="fill" />
              Stripped Onerous Clauses ({comparison.removedClauses.length})
            </div>
            <div className="space-y-1.5">
              {comparison.removedClauses.map((clause, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-risk-high-bg/50 border border-risk-high-border/60 text-xs text-foreground flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                  <span className="leading-relaxed text-[12px]">{clause}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Added Employee Protections */}
          <div className="p-4 sm:p-5 rounded-2xl border border-risk-low-border/70 bg-card space-y-2.5 shadow-2xs">
            <div className="text-xs font-semibold uppercase tracking-wider text-risk-low-text flex items-center gap-1.5">
              <PlusCircle size={15} weight="fill" />
              Added Protective Terms ({comparison.addedClauses.length})
            </div>
            <div className="space-y-1.5">
              {comparison.addedClauses.map((clause, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-risk-low-bg/50 border border-risk-low-border/60 text-xs text-foreground flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span className="leading-relaxed text-[12px]">{clause}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="space-y-1.5">
          <label className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            Filter by Domain
          </label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-secondary text-foreground border-foreground/30 ring-1 ring-foreground/15 shadow-2xs'
                    : 'bg-card text-muted-foreground hover:text-foreground border-border/80 hover:bg-secondary/40'
                }`}
              >
                {cat === 'all' ? 'All Terms' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-Side Clause Diffs */}
        <div className="space-y-3 pt-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Side-by-Side Provision Comparison & Grounding
          </h3>

          <div className="space-y-3">
            {filteredDifferences.map((diff, index) => (
              <div
                key={index}
                className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-mono uppercase px-2 py-0.5 rounded-full bg-secondary border border-border/70 text-foreground font-medium">
                      {diff.category}
                    </span>
                    <span className="font-semibold text-xs sm:text-sm text-foreground tracking-tight">
                      {diff.term}
                    </span>
                  </div>

                  <span className="text-[10px] font-medium tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-risk-low-bg text-risk-low-text border border-risk-low-border">
                    Risk Shift: {diff.riskDelta}
                  </span>
                </div>

                {/* 2-Column Split View */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Document A (Original) */}
                  <div className="p-3 rounded-xl bg-risk-high-bg/50 border border-risk-high-border/60 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-risk-high-text">
                      <span>Original Agreement (v1)</span>
                      <span className="text-[9.5px] font-mono uppercase tracking-wider">High Liability</span>
                    </div>
                    <p className="text-foreground/90 leading-relaxed text-[12px]">
                      {diff.inDocA}
                    </p>
                    {diff.citationA && (
                      <div className="text-[10px] text-muted-foreground font-mono pt-1.5 border-t border-risk-high-border/40 flex items-center gap-1">
                        <BookmarkSimple size={11} weight="fill" className="text-red-500" />
                        Page {diff.citationA.pageNumber} · {diff.citationA.sectionNumber}
                      </div>
                    )}
                  </div>

                  {/* Document B (Revised Fair) */}
                  <div className="p-3 rounded-xl bg-risk-low-bg/50 border border-risk-low-border/60 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-risk-low-text">
                      <span>Revised Fair Agreement (v2)</span>
                      <span className="text-[9.5px] font-mono uppercase tracking-wider">Balanced</span>
                    </div>
                    <p className="text-foreground/90 leading-relaxed text-[12px]">
                      {diff.inDocB}
                    </p>
                    {diff.citationB && (
                      <div className="text-[10px] text-muted-foreground font-mono pt-1.5 border-t border-risk-low-border/40 flex items-center gap-1">
                        <BookmarkSimple size={11} weight="fill" className="text-emerald-500" />
                        Page {diff.citationB.pageNumber} · {diff.citationB.sectionNumber}
                      </div>
                    )}
                  </div>
                </div>

                {/* Analysis Synthesis */}
                <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 text-xs text-foreground/90 flex items-start gap-2">
                  <Sparkle size={13} className="text-foreground shrink-0 mt-0.5" />
                  <div className="leading-relaxed text-[12px]">
                    <span className="font-semibold text-foreground">Strategic Impact:</span>{' '}
                    {diff.analysis}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
