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
import { Citation, LegalDocument, RiskAnalysisReport, DocumentClause, ChallengePersona } from '@/lib/types';
import { SAMPLE_RISK_REPORT_A, SAMPLE_RISK_REPORT_C } from '@/lib/sample-data';

interface RiskDashboardProps {
  document: LegalDocument;
  onCitationClick: (citation: Citation) => void;
  onOpenExport?: () => void;
  persona?: ChallengePersona;
}

// Recommended balanced counter-clauses for common contractual red flags (Professional & Business)
const COUNTER_CLAUSE_TEMPLATES: Record<string, string> = {
  'notice_period': 'Either party may terminate employment by giving thirty (30) calendar days prior written notice. Employee may elect to terminate immediately by paying basic salary in lieu of notice.',
  'service_bond': 'There shall be no mandatory service lock-in, training bond, or liquidated damages clawback. Any third-party direct certification expenses exceeding $2,500 shall be amortized on a pro-rata 6-month schedule.',
  'non_compete': 'For a period of six (6) months post-separation, Employee agrees not to accept employment with direct primary competitors explicitly listed in Annexure A. During this period, Company shall pay 100% of Employee\'s base salary as garden leave compensation.',
  'ip_assignment': 'Company ownership applies solely to inventions created during regular working hours using Company equipment that directly relate to Company\'s business. All personal off-hours coding and pre-existing open-source contributions remain the exclusive property of Employee.',
  'governing_law': 'This Agreement shall be governed by local labor laws of Employee\'s jurisdiction of residence. The parties agree to confidential mediation prior to initiating binding arbitration.',
  'liability_cap': 'In no event shall either party\'s total aggregate liability under this Agreement exceed the total fees paid or payable by Customer in the twelve (12) months preceding the claim. Neither party shall be liable for indirect, incidental, or consequential damages.',
  'payment_terms': 'Customer shall pay undisputed invoices within Net-30 days of invoice receipt. In the event of a good-faith billing dispute, Customer shall provide written notice within fifteen (15) days, and undisputed amounts shall be paid timely without interest penalties.',
  'service_level': 'Vendor warrants 99.9% monthly uptime. If uptime falls below 99.9%, Vendor shall issue pro-rata service fee credits against the subsequent monthly invoice as Customer\'s sole and exclusive remedy, without unilateral customer termination for minor service interruptions.',
  'ip_warranty': 'Vendor warrants that the Deliverables and Services do not infringe any valid patent, copyright, trademark, or trade secret of any third party. Vendor shall indemnify and defend Customer against third-party infringement claims, subject to prompt written notification.',
};

function getCounterClauseFor(clause: DocumentClause): string {
  const text = (clause.title + ' ' + clause.content + ' ' + clause.sectionNumber).toLowerCase();
  if (text.includes('notice') || text.includes('resignation')) return COUNTER_CLAUSE_TEMPLATES.notice_period;
  if (text.includes('bond') || text.includes('liquidated') || text.includes('retention')) return COUNTER_CLAUSE_TEMPLATES.service_bond;
  if (text.includes('non-compete') || text.includes('compete') || text.includes('garden')) return COUNTER_CLAUSE_TEMPLATES.non_compete;
  if (text.includes('intellectual') || text.includes('invention') || text.includes('copyright') || text.includes('proprietary')) return COUNTER_CLAUSE_TEMPLATES.ip_assignment;
  if (text.includes('arbitration') || text.includes('governing') || text.includes('jurisdiction')) return COUNTER_CLAUSE_TEMPLATES.governing_law;
  if (text.includes('liability') || text.includes('aggregate') || text.includes('consequential') || text.includes('cap')) return COUNTER_CLAUSE_TEMPLATES.liability_cap;
  if (text.includes('payment') || text.includes('invoice') || text.includes('net-') || text.includes('dispute') || text.includes('late fee')) return COUNTER_CLAUSE_TEMPLATES.payment_terms;
  if (text.includes('service level') || text.includes('sla') || text.includes('uptime') || text.includes('credit')) return COUNTER_CLAUSE_TEMPLATES.service_level;
  if (text.includes('warranty') || text.includes('infringement') || text.includes('indemnif')) return COUNTER_CLAUSE_TEMPLATES.ip_warranty;
  return `Request reciprocal bilateral terms for ${clause.sectionNumber}: rights and obligations must apply equally to both parties.`;
}

export function RiskDashboard({ document, onCitationClick, onOpenExport, persona }: RiskDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);

  const isDocB = document.id === 'doc-apex-emp-v2' || document.title.includes('Revised');
  const isDocC = document.id === 'doc-enterprise-msa-v1' || document.title.includes('Enterprise Master Services Agreement (Onerous');
  const isDocD = document.id === 'doc-enterprise-msa-v2' || document.title.includes('Enterprise Master Services Agreement (B2B Fair');

  const report: RiskAnalysisReport = React.useMemo(() => {
    if (isDocC) {
      return SAMPLE_RISK_REPORT_C;
    }

    if (isDocD) {
      return {
        overallRisk: 'low',
        riskScore: 28,
        executiveVerdict:
          'FAIR & BALANCED B2B STANDARD: This revised Enterprise MSA establishes commercially reasonable bilateral standards: a mutual liability cap equal to 12 months fees paid ($250,000 max), Net-30 payment terms with 15-day good-faith dispute cure periods, service fee SLA credits for uptime below 99.9%, and comprehensive IP non-infringement warranties with vendor indemnification defense.',
        highRiskCount: 0,
        mediumRiskCount: 3,
        lowRiskCount: 7,
        clauses: document.pages.flatMap((p) => p.clauses || []),
        criticalWarnings: [
          'Verify that monthly uptime monitoring reports are audited by an independent third-party status dashboard.',
          'Ensure the 15-day dispute cure notification timeframe aligns with accounts payable operational schedules.',
        ],
        recommendedNegotiations: [
          'Include a reciprocal cyber-insurance requirement of $5,000,000 for SOC2 compliance verification.',
          'Confirm that SLA credit calculations apply automatically without requiring burdensome manual claims.',
        ],
        persona: 'business',
      };
    }

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
        persona: 'professional',
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
      persona: persona || (isDocC || isDocD ? 'business' : 'professional'),
    };
  }, [document, isDocB, isDocC, isDocD, persona]);

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
    <div className="p-4 sm:p-5 space-y-5 overflow-y-auto h-full">
      {/* Top Header Card with Risk Score */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs ${
          isHighRisk
            ? 'bg-risk-high-bg border-risk-high-border'
            : isMediumRisk
            ? 'bg-risk-medium-bg border-risk-medium-border'
            : 'bg-risk-low-bg border-risk-low-border'
        }`}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            {isHighRisk && <ShieldWarning size={18} className="text-risk-high-text" weight="fill" />}
            {isMediumRisk && <Warning size={18} className="text-risk-medium-text" weight="fill" />}
            {!isHighRisk && !isMediumRisk && <CheckCircle size={18} className="text-risk-low-text" weight="fill" />}
            <span className="font-semibold text-sm uppercase tracking-tight text-foreground">
              {report.overallRisk} Risk Rating
            </span>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed max-w-xl">
            {report.executiveVerdict}
          </p>
          {onOpenExport && (
            <div className="pt-1">
              <button
                onClick={onOpenExport}
                className="px-3 py-1 rounded-lg bg-card border border-border/80 hover:bg-secondary text-foreground text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <DownloadSimple size={12} />
                Export Full Audit Memo
              </button>
            </div>
          )}
        </div>

        {/* Risk Meter Dial */}
        <div className="flex flex-col items-center justify-center px-4 py-2.5 rounded-xl bg-card border border-border/80 shadow-2xs shrink-0 self-end sm:self-auto">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Risk Index
          </span>
          <span
            className={`text-2xl font-bold font-mono ${
              isHighRisk
                ? 'text-risk-high-text'
                : isMediumRisk
                ? 'text-risk-medium-text'
                : 'text-risk-low-text'
            }`}
          >
            {report.riskScore}/100
          </span>
          <span className="text-[9.5px] text-muted-foreground">
            {isHighRisk ? 'Immediate Review' : 'Balanced Terms'}
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => setFilter(filter === 'high' ? 'all' : 'high')}
          className={`p-3 rounded-xl border text-center transition-all cursor-pointer shadow-2xs ${
            filter === 'high'
              ? 'ring-1 ring-foreground/20 border-foreground/30 bg-secondary'
              : 'bg-card border-border/80 hover:bg-secondary/40 hover:border-foreground/20'
          }`}
        >
          <div className="text-lg font-bold text-risk-high-text font-mono">
            {report.highRiskCount}
          </div>
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
            High Risk
          </div>
        </button>

        <button
          onClick={() => setFilter(filter === 'medium' ? 'all' : 'medium')}
          className={`p-3 rounded-xl border text-center transition-all cursor-pointer shadow-2xs ${
            filter === 'medium'
              ? 'ring-1 ring-foreground/20 border-foreground/30 bg-secondary'
              : 'bg-card border-border/80 hover:bg-secondary/40 hover:border-foreground/20'
          }`}
        >
          <div className="text-lg font-bold text-risk-medium-text font-mono">
            {report.mediumRiskCount}
          </div>
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
            Medium Risk
          </div>
        </button>

        <button
          onClick={() => setFilter(filter === 'low' ? 'all' : 'low')}
          className={`p-3 rounded-xl border text-center transition-all cursor-pointer shadow-2xs ${
            filter === 'low'
              ? 'ring-1 ring-foreground/20 border-foreground/30 bg-secondary'
              : 'bg-card border-border/80 hover:bg-secondary/40 hover:border-foreground/20'
          }`}
        >
          <div className="text-lg font-bold text-risk-low-text font-mono">
            {report.lowRiskCount}
          </div>
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
            Standard / Safe
          </div>
        </button>
      </div>

      {/* Critical Warnings */}
      {report.criticalWarnings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-risk-high-text flex items-center gap-1.5">
            <ShieldWarning size={14} weight="fill" />
            Critical Red Flags & High-Liability Terms
          </h4>
          <div className="space-y-1.5">
            {report.criticalWarnings.map((warning, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-risk-high-bg/50 border border-risk-high-border/70 text-xs text-foreground flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                <span className="leading-relaxed text-[12px]">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Negotiation Points */}
      {report.recommendedNegotiations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-risk-low-text flex items-center gap-1.5">
            <Lightbulb size={14} weight="fill" />
            Strategic Negotiation Leverage for Legal Counsel
          </h4>
          <div className="space-y-1.5">
            {report.recommendedNegotiations.map((point, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-risk-low-bg/50 border border-risk-low-border/70 text-xs text-foreground flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span className="leading-relaxed text-[12px]">{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Clause Audit List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Scales size={14} />
            Clause-by-Clause Audit & Grounding
          </h4>

          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="text-[11px] text-foreground hover:underline font-medium cursor-pointer"
            >
              Reset filter ({filteredClauses.length} shown)
            </button>
          )}
        </div>

        <div className="space-y-2">
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
                className="p-3.5 rounded-xl border border-border/80 bg-card hover:bg-secondary/40 hover:border-foreground/20 text-xs transition-all duration-150 cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-medium text-foreground flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {clause.sectionNumber}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="truncate">{clause.title}</span>
                  </div>

                  <span
                    className={`text-[9.5px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full border ${
                      isHigh
                        ? 'bg-risk-high-bg text-risk-high-text border-risk-high-border'
                        : isMed
                        ? 'bg-risk-medium-bg text-risk-medium-text border-risk-medium-border'
                        : 'bg-risk-low-bg text-risk-low-text border-risk-low-border'
                    }`}
                  >
                    {clause.riskLevel} Risk
                  </span>
                </div>

                <p className="text-[11.5px] text-muted-foreground leading-relaxed line-clamp-2">
                  {clause.implication}
                </p>

                <div className="mt-2.5 flex items-center justify-between text-[10.5px] text-foreground pt-2 border-t border-border/50">
                  <span className="text-muted-foreground font-mono">
                    Page {clause.pageNumber}
                  </span>

                  <div className="flex items-center gap-3">
                    {(isHigh || isMed) && (
                      <button
                        onClick={(e) => handleCopyCounter(clause, e)}
                        className="flex items-center gap-1 text-[10.5px] font-medium text-foreground hover:underline cursor-pointer transition-colors"
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
                      <ArrowRight size={10} />
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
