'use client';

import React, { useState } from 'react';
import {
  ShieldWarning,
  Warning,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  Scales,
  DownloadSimple,
  Copy,
  Check,
} from '@phosphor-icons/react';
import { Citation, LegalDocument, RiskAnalysisReport, DocumentClause } from '@/lib/types';
import { SAMPLE_RISK_REPORT_A } from '@/lib/sample-data';

interface RiskDashboardProps {
  document: LegalDocument;
  onCitationClick: (citation: Citation) => void;
  onOpenExport?: () => void;
}

// Recommended balanced counter-clauses for common contractual red flags
const COUNTER_CLAUSE_TEMPLATES: Record<string, string> = {
  'notice_period': 'Either party may terminate employment by giving thirty (30) calendar days prior written notice. Employee may elect to terminate immediately by paying basic salary in lieu of notice.',
  'service_bond': 'There shall be no mandatory service lock-in, training bond, or liquidated damages clawback. Any third-party direct certification expenses exceeding $2,500 shall be amortized on a pro-rata 6-month schedule.',
  'non_compete': 'For a period of six (6) months post-separation, Employee agrees not to accept employment with direct primary competitors explicitly listed in Annexure A. During this period, Company shall pay 100% of Employee\'s base salary as garden leave compensation.',
  'ip_assignment': 'Company ownership applies solely to inventions created during regular working hours using Company equipment that directly relate to Company\'s business. All personal off-hours coding and pre-existing open-source contributions remain the exclusive property of Employee.',
  'governing_law': 'This Agreement shall be governed by local labor laws of Employee\'s jurisdiction of residence. The parties agree to confidential mediation prior to initiating binding arbitration.',
};

function getCounterClauseFor(clause: DocumentClause): string {
  const text = (clause.title + ' ' + clause.content + ' ' + clause.sectionNumber).toLowerCase();
  if (text.includes('notice') || text.includes('resignation')) return COUNTER_CLAUSE_TEMPLATES.notice_period;
  if (text.includes('bond') || text.includes('liquidated') || text.includes('retention')) return COUNTER_CLAUSE_TEMPLATES.service_bond;
  if (text.includes('non-compete') || text.includes('compete') || text.includes('garden')) return COUNTER_CLAUSE_TEMPLATES.non_compete;
  if (text.includes('intellectual') || text.includes('invention') || text.includes('copyright') || text.includes('proprietary')) return COUNTER_CLAUSE_TEMPLATES.ip_assignment;
  if (text.includes('arbitration') || text.includes('governing') || text.includes('jurisdiction')) return COUNTER_CLAUSE_TEMPLATES.governing_law;
  return `Request reciprocal bilateral terms for ${clause.sectionNumber}: rights and obligations must apply equally to both Employer and Employee.`;
}

export function RiskDashboard({ document, onCitationClick, onOpenExport }: RiskDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);

  const isDocB = document.id.includes('v2') || document.title.includes('Revised');

  const report: RiskAnalysisReport = React.useMemo(() => {
    if (isDocB) {
      return {
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
      };
    }

    if (
      document.id === SAMPLE_RISK_REPORT_A.clauses[0]?.id ||
      document.id.includes('v1') ||
      document.title.includes('Original')
    ) {
      return SAMPLE_RISK_REPORT_A;
    }

    // Dynamic analysis for custom uploaded contracts
    const allClauses = document.pages.flatMap((p) => p.clauses || []);
    const highClauses = allClauses.filter((c) => c.riskLevel === 'high');
    const medClauses = allClauses.filter((c) => c.riskLevel === 'medium');
    const lowClauses = allClauses.filter((c) => c.riskLevel === 'low');

    const highCount = highClauses.length;
    const medCount = medClauses.length;
    const lowCount = lowClauses.length;

    const computedScore =
      allClauses.length > 0
        ? Math.min(
            95,
            Math.max(
              20,
              Math.round(
                ((highCount * 30 + medCount * 15 + lowCount * 4) /
                  Math.max(1, highCount * 30 + medCount * 15 + lowCount * 4 + 25)) *
                  100
              )
            )
          )
        : 45;

    const overallRisk: 'high' | 'medium' | 'low' =
      computedScore >= 65 || highCount >= 2
        ? 'high'
        : computedScore >= 40 || medCount >= 2
        ? 'medium'
        : 'low';

    const warnings = highClauses.map(
      (c) => `${c.sectionNumber}: ${c.implication}`
    );
    if (warnings.length === 0 && medClauses.length > 0) {
      warnings.push(
        ...medClauses.slice(0, 3).map((c) => `${c.sectionNumber}: ${c.implication}`)
      );
    }
    if (warnings.length === 0) {
      warnings.push(
        'No critical high-liability red flags automatically identified. Review all definitions with licensed counsel.'
      );
    }

    const negotiations = [
      ...highClauses.map((c) => `Negotiate or narrow scope of ${c.sectionNumber} (${c.title}) to mutual standards.`),
      ...medClauses.map((c) => `Request bilateral terms for ${c.sectionNumber}.`),
    ];
    if (negotiations.length === 0) {
      negotiations.push(
        'Ensure all informal promises and email offer terms are reflected in the final agreement.'
      );
    }

    return {
      overallRisk,
      riskScore: computedScore,
      executiveVerdict:
        overallRisk === 'high'
          ? `HIGH RISK AUDIT: Uploaded agreement "${document.title}" contains ${highCount} high-liability provisions and ${medCount} moderate risk clauses requiring legal review before signing.`
          : overallRisk === 'medium'
          ? `MODERATE RISK AUDIT: Uploaded agreement "${document.title}" contains ${medCount} clauses that warrant clarification or reciprocal revision.`
          : `LOW RISK AUDIT: Uploaded agreement "${document.title}" aligns closely with balanced commercial and employment contract standards.`,
      highRiskCount: highCount,
      mediumRiskCount: medCount,
      lowRiskCount: lowCount,
      clauses: allClauses,
      criticalWarnings: warnings.slice(0, 5),
      recommendedNegotiations: negotiations.slice(0, 5),
    };
  }, [document, isDocB]);

  const isHighRisk = report.overallRisk === 'high';
  const isMediumRisk = report.overallRisk === 'medium';

  const filteredClauses = React.useMemo(() => {
    if (filter === 'all') return report.clauses;
    return report.clauses.filter((c) => c.riskLevel === filter);
  }, [report.clauses, filter]);

  const handleCopyCounter = async (clause: DocumentClause, e: React.MouseEvent) => {
    e.stopPropagation();
    const counterText = getCounterClauseFor(clause);
    try {
      await navigator.clipboard.writeText(counterText);
      setCopiedClauseId(clause.id);
      setTimeout(() => setCopiedClauseId(null), 2000);
    } catch (err) {
      console.error('Failed to copy counter-clause:', err);
    }
  };

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
          {onOpenExport && (
            <div className="pt-1.5">
              <button
                onClick={onOpenExport}
                className="px-3 py-1 rounded-md bg-card border border-border hover:bg-secondary text-foreground text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <DownloadSimple size={13} />
                Export Full Audit Memo
              </button>
            </div>
          )}
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
        <button
          onClick={() => setFilter(filter === 'high' ? 'all' : 'high')}
          className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
            filter === 'high' ? 'ring-2 ring-red-500 bg-red-500/10' : 'bg-card border-red-500/30 hover:bg-red-500/5'
          }`}
        >
          <div className="text-lg font-bold text-red-600 font-mono">
            {report.highRiskCount}
          </div>
          <div className="text-[10px] font-medium text-muted-foreground uppercase mt-0.5">
            High Risk Clauses
          </div>
        </button>

        <button
          onClick={() => setFilter(filter === 'medium' ? 'all' : 'medium')}
          className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
            filter === 'medium' ? 'ring-2 ring-amber-500 bg-amber-500/10' : 'bg-card border-amber-500/30 hover:bg-amber-500/5'
          }`}
        >
          <div className="text-lg font-bold text-amber-600 font-mono">
            {report.mediumRiskCount}
          </div>
          <div className="text-[10px] font-medium text-muted-foreground uppercase mt-0.5">
            Medium Risk
          </div>
        </button>

        <button
          onClick={() => setFilter(filter === 'low' ? 'all' : 'low')}
          className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
            filter === 'low' ? 'ring-2 ring-emerald-500 bg-emerald-500/10' : 'bg-card border-emerald-500/30 hover:bg-emerald-500/5'
          }`}
        >
          <div className="text-lg font-bold text-emerald-600 font-mono">
            {report.lowRiskCount}
          </div>
          <div className="text-[10px] font-medium text-muted-foreground uppercase mt-0.5">
            Standard / Safe
          </div>
        </button>
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
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Scales size={15} />
            Clause-by-Clause Audit & Visual Grounding
          </h4>

          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
            >
              Reset filter ({filteredClauses.length} shown)
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {filteredClauses.map((clause) => {
            const isHigh = clause.riskLevel === 'high';
            const isMed = clause.riskLevel === 'medium';
            const isCopied = copiedClauseId === clause.id;

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

                  <div className="flex items-center gap-3">
                    {(isHigh || isMed) && (
                      <button
                        onClick={(e) => handleCopyCounter(clause, e)}
                        className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                        title="Copy balanced reciprocal counter-clause to clipboard"
                      >
                        {isCopied ? (
                          <>
                            <Check size={11} className="text-emerald-600" weight="bold" />
                            <span>Copied Counter-Clause!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy Counter-Clause</span>
                          </>
                        )}
                      </button>
                    )}

                    <span className="flex items-center gap-1 font-medium hover:underline">
                      View in PDF
                      <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
