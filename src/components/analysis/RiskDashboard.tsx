'use client';

import React from 'react';
import {
  ShieldWarning,
  Warning,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  Scales,
} from '@phosphor-icons/react';
import { Citation, LegalDocument, RiskAnalysisReport } from '@/lib/types';
import { SAMPLE_RISK_REPORT_A } from '@/lib/sample-data';

interface RiskDashboardProps {
  document: LegalDocument;
  onCitationClick: (citation: Citation) => void;
}

export function RiskDashboard({ document, onCitationClick }: RiskDashboardProps) {
  const isDocB = document.id.includes('v2') || document.title.includes('Revised');

  const report: RiskAnalysisReport = isDocB
    ? {
        overallRisk: 'low',
        riskScore: 24,
        executiveVerdict:
          'FAIR & BALANCED STANDARD: This revised agreement incorporates modern reciprocal provisions: a 30-day notice period with employee buyout rights, zero employment bond or liquidated damages, an uncompensated non-compete replaced by a 100% salary paid garden leave, and clear ownership protection for off-hours personal open-source projects.',
        highRiskCount: 0,
        mediumRiskCount: 2,
        lowRiskCount: 8,
        clauses: document.pages.flatMap((p) => p.clauses || []),
        criticalWarnings: [
          'Ensure the 5 named competitors covered under the 6-month non-compete schedule are explicitly listed in an annexure.',
          'Verify that direct third-party certification reimbursement under Section 3.3 is documented with actual receipts.',
        ],
        recommendedNegotiations: [
          'Confirm no separate undertakings or bond letters are presented during HR onboarding.',
          'Ensure health insurance continuation during severance is specified in writing.',
        ],
      }
    : SAMPLE_RISK_REPORT_A;

  const isHighRisk = report.overallRisk === 'high';
  const isMediumRisk = report.overallRisk === 'medium';

  return (
    <div className="p-4 sm:p-5 space-y-6 overflow-y-auto h-full">
      {/* Top Header Card with Risk Score */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isHighRisk
            ? 'bg-red-500/10 border-red-500/30'
            : isMediumRisk
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-emerald-500/10 border-emerald-500/30'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {isHighRisk && <ShieldWarning size={20} className="text-red-600" weight="fill" />}
            {isMediumRisk && <Warning size={20} className="text-amber-600" weight="fill" />}
            {!isHighRisk && !isMediumRisk && <CheckCircle size={20} className="text-emerald-600" weight="fill" />}
            <span className="font-bold text-sm uppercase tracking-wide">
              {report.overallRisk} Risk Contract Rating
            </span>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed max-w-xl">
            {report.executiveVerdict}
          </p>
        </div>

        {/* Risk Meter Dial */}
        <div className="flex flex-col items-center justify-center px-4 py-2 rounded-lg bg-card border border-border shrink-0 self-end sm:self-auto">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
            Risk Index
          </span>
          <span
            className={`text-2xl font-bold font-mono ${
              isHighRisk
                ? 'text-red-600'
                : isMediumRisk
                ? 'text-amber-600'
                : 'text-emerald-600'
            }`}
          >
            {report.riskScore}/100
          </span>
          <span className="text-[9px] text-muted-foreground">
            {isHighRisk ? 'Immediate Review' : 'Manageable'}
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-card border border-red-500/30 text-center">
          <div className="text-lg font-bold text-red-600 font-mono">
            {report.highRiskCount}
          </div>
          <div className="text-[10px] font-medium text-muted-foreground uppercase mt-0.5">
            High Risk Clauses
          </div>
        </div>

        <div className="p-3 rounded-lg bg-card border border-amber-500/30 text-center">
          <div className="text-lg font-bold text-amber-600 font-mono">
            {report.mediumRiskCount}
          </div>
          <div className="text-[10px] font-medium text-muted-foreground uppercase mt-0.5">
            Medium Risk
          </div>
        </div>

        <div className="p-3 rounded-lg bg-card border border-emerald-500/30 text-center">
          <div className="text-lg font-bold text-emerald-600 font-mono">
            {report.lowRiskCount}
          </div>
          <div className="text-[10px] font-medium text-muted-foreground uppercase mt-0.5">
            Standard / Safe
          </div>
        </div>
      </div>

      {/* Critical Warnings */}
      {report.criticalWarnings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
            <ShieldWarning size={15} weight="fill" />
            Critical Red Flags & High-Liability Terms
          </h4>
          <div className="space-y-1.5">
            {report.criticalWarnings.map((warning, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/20 text-xs text-foreground flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                <span className="leading-relaxed">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Negotiation Points */}
      {report.recommendedNegotiations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <Lightbulb size={15} weight="fill" />
            Strategic Negotiation Leverage for Legal Counsel
          </h4>
          <div className="space-y-1.5">
            {report.recommendedNegotiations.map((point, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-foreground flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span className="leading-relaxed">{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Clause Audit List */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Scales size={15} />
          Clause-by-Clause Audit & Visual Grounding
        </h4>

        <div className="space-y-2.5">
          {report.clauses.map((clause) => {
            const isHigh = clause.riskLevel === 'high';
            const isMed = clause.riskLevel === 'medium';

            return (
              <div
                key={clause.id}
                onClick={() =>
                  onCitationClick({
                    clauseId: clause.id,
                    pageNumber: clause.pageNumber,
                    sectionNumber: clause.sectionNumber,
                    clauseTitle: clause.title,
                    quote: clause.content,
                    relevanceExplanation: clause.implication,
                    riskLevel: clause.riskLevel,
                  })
                }
                className={`p-3 rounded-lg border text-xs transition-all duration-150 cursor-pointer ${
                  isHigh
                    ? 'border-red-500/30 bg-card hover:bg-red-500/5'
                    : isMed
                    ? 'border-amber-500/30 bg-card hover:bg-amber-500/5'
                    : 'border-border bg-card hover:bg-secondary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {clause.sectionNumber}
                    </span>
                    <span>·</span>
                    <span className="truncate">{clause.title}</span>
                  </div>

                  <span
                    className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                      isHigh
                        ? 'bg-red-500/15 text-red-700 dark:text-red-300'
                        : isMed
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {clause.riskLevel} Risk
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {clause.implication}
                </p>

                <div className="mt-2 flex items-center justify-between text-[10px] text-primary pt-1.5 border-t border-border/40">
                  <span className="text-muted-foreground font-mono">
                    Page {clause.pageNumber}
                  </span>
                  <span className="flex items-center gap-1 font-medium hover:underline">
                    View in PDF
                    <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
