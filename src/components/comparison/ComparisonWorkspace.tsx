'use client';

import React, { useState } from 'react';
import {
  GitDiff,
  ShieldCheck,
  CheckCircle,
  WarningCircle,
  ArrowRight,
  Sparkle,
  PlusCircle,
  MinusCircle,
  BookmarkSimple,
} from '@phosphor-icons/react';
import { ContractComparisonResult, ContractDifference } from '@/lib/types';
import { SAMPLE_COMPARISON, SAMPLE_DOC_A, SAMPLE_DOC_B } from '@/lib/sample-data';

interface ComparisonWorkspaceProps {
  onBackToWorkstation: () => void;
  onSelectDoc: (docId: string) => void;
}

export function ComparisonWorkspace({
  onBackToWorkstation,
  onSelectDoc,
}: ComparisonWorkspaceProps) {
  const comparison: ContractComparisonResult = SAMPLE_COMPARISON;
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', ...new Set(comparison.differences.map((d) => d.category))];

  const filteredDifferences =
    activeCategory === 'all'
      ? comparison.differences
      : comparison.differences.filter((d) => d.category === activeCategory);

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      {/* Top Banner Header */}
      <div className="bg-card border-b border-border p-4 sm:p-6 sticky top-0 z-10 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600">
                <GitDiff size={20} weight="bold" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Bilateral Contract Comparison & Risk Delta
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-3xl">
              {comparison.summary}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onBackToWorkstation}
              className="px-3.5 py-1.5 rounded-lg border border-border bg-secondary hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer"
            >
              Back to Split Workstation
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 w-full">
        {/* Strategic Takeaways Box */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
          <div className="font-bold text-xs uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
            <ShieldCheck size={16} weight="fill" className="text-emerald-600" />
            Key Strategic Upgrades in Negotiated Agreement (Version 2)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-emerald-950 dark:text-emerald-100">
            {comparison.strategicAdvice.map((advice, i) => (
              <div key={i} className="flex items-start gap-1.5 leading-relaxed">
                <CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5" weight="fill" />
                <span>{advice}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Added vs Removed Clauses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Removed High-Risk Clauses */}
          <div className="p-4 rounded-xl border border-red-500/30 bg-card space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
              <MinusCircle size={16} weight="fill" />
              Stripped Onerous Clauses ({comparison.removedClauses.length})
            </div>
            <div className="space-y-1.5">
              {comparison.removedClauses.map((clause, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-red-500/5 border border-red-500/15 text-xs text-foreground flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                  <span className="leading-snug">{clause}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Added Employee Protections */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-card space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <PlusCircle size={16} weight="fill" />
              Added Protective Terms ({comparison.addedClauses.length})
            </div>
            <div className="space-y-1.5">
              {comparison.addedClauses.map((clause, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-emerald-500/5 border border-emerald-500/15 text-xs text-foreground flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span className="leading-snug">{clause}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Filter by Legal Domain:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-foreground border-border hover:bg-secondary'
                }`}
              >
                {cat === 'all' ? 'All Terms' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-Side Clause Diffs */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Side-by-Side Provision Diff & Grounded Analysis
          </h3>

          <div className="space-y-3">
            {filteredDifferences.map((diff, index) => (
              <div
                key={index}
                className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-secondary text-primary font-semibold">
                      {diff.category}
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-foreground">
                      {diff.term}
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    Risk Shift: {diff.riskDelta}
                  </span>
                </div>

                {/* 2-Column Split View */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Document A (Original) */}
                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-red-800 dark:text-red-300">
                      <span>Original Agreement (v1)</span>
                      <span className="text-[10px] font-mono">HIGH RISK</span>
                    </div>
                    <p className="text-foreground leading-relaxed">
                      {diff.inDocA}
                    </p>
                    {diff.citationA && (
                      <div className="text-[10px] text-muted-foreground font-mono pt-1 border-t border-red-500/10 flex items-center gap-1">
                        <BookmarkSimple size={12} weight="fill" className="text-red-600" />
                        Page {diff.citationA.pageNumber} · {diff.citationA.sectionNumber}
                      </div>
                    )}
                  </div>

                  {/* Document B (Revised Fair) */}
                  <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                      <span>Revised Fair Agreement (v2)</span>
                      <span className="text-[10px] font-mono">BALANCED</span>
                    </div>
                    <p className="text-foreground leading-relaxed">
                      {diff.inDocB}
                    </p>
                    {diff.citationB && (
                      <div className="text-[10px] text-muted-foreground font-mono pt-1 border-t border-emerald-500/10 flex items-center gap-1">
                        <BookmarkSimple size={12} weight="fill" className="text-emerald-600" />
                        Page {diff.citationB.pageNumber} · {diff.citationB.sectionNumber}
                      </div>
                    )}
                  </div>
                </div>

                {/* Analysis Synthesis */}
                <div className="p-2.5 rounded-lg bg-secondary/50 text-xs text-foreground/90 flex items-start gap-2">
                  <Sparkle size={14} className="text-primary shrink-0 mt-0.5" />
                  <div className="leading-normal">
                    <span className="font-semibold text-primary">Strategic Impact:</span>{' '}
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
