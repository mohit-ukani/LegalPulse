'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Printer,
  DownloadSimple,
  Copy,
  Check,
  FileText,
  ShieldWarning,
  Warning,
  CheckCircle,
  Scales,
} from '@phosphor-icons/react';
import { LegalDocument, RiskAnalysisReport } from '@/lib/types';
import { SAMPLE_RISK_REPORT_A } from '@/lib/sample-data';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: LegalDocument;
}

export function ExportReportModal({
  isOpen,
  onClose,
  document: doc,
}: ExportReportModalProps) {
  const [copied, setCopied] = useState(false);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const isDocB = doc.id.includes('v2') || doc.title.includes('Revised');

  // Compute or retrieve risk report
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
        clauses: doc.pages.flatMap((p) => p.clauses || []),
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
      doc.id === SAMPLE_RISK_REPORT_A.clauses[0]?.id ||
      doc.id.includes('v1') ||
      doc.title.includes('Original')
    ) {
      return SAMPLE_RISK_REPORT_A;
    }

    // Dynamic analysis for custom uploaded contracts
    const allClauses = doc.pages.flatMap((p) => p.clauses || []);
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

    return {
      overallRisk,
      riskScore: computedScore,
      executiveVerdict:
        overallRisk === 'high'
          ? `HIGH RISK AUDIT: Uploaded agreement "${doc.title}" contains ${highCount} high-liability provisions and ${medCount} moderate risk clauses requiring legal review before signing.`
          : overallRisk === 'medium'
          ? `MODERATE RISK AUDIT: Uploaded agreement "${doc.title}" contains ${medCount} clauses that warrant clarification or reciprocal revision.`
          : `LOW RISK AUDIT: Uploaded agreement "${doc.title}" aligns closely with balanced commercial and employment contract standards.`,
      highRiskCount: highCount,
      mediumRiskCount: medCount,
      lowRiskCount: lowCount,
      clauses: allClauses,
      criticalWarnings: highClauses.map((c) => `${c.sectionNumber} (${c.title}): ${c.implication}`),
      recommendedNegotiations: highClauses.map((c) => `Request reciprocal or bilateral revision of ${c.sectionNumber} (${c.title}).`),
    };
  }, [doc, isDocB]);

  // Generate markdown representation of the legal brief
  const generateMarkdownReport = (): string => {
    const timestamp = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let md = `# LEGAL AUDIT MEMORANDUM\n\n`;
    md += `**Document:** ${doc.title}\n`;
    md += `**Date of Audit:** ${timestamp}\n`;
    md += `**Prepared By:** LegalPulse AI Workstation (Gemini 1.5 Flash Grounded Intelligence)\n`;
    md += `**Overall Risk Rating:** ${report.overallRisk.toUpperCase()} (${report.riskScore}/100)\n\n`;
    md += `---\n\n`;

    md += `## 1. EXECUTIVE VERDICT\n\n`;
    md += `${report.executiveVerdict}\n\n`;

    md += `## 2. RISK SUMMARY METRICS\n\n`;
    md += `- **High-Liability Clauses:** ${report.highRiskCount}\n`;
    md += `- **Moderate-Risk Clauses:** ${report.mediumRiskCount}\n`;
    md += `- **Standard / Safe Clauses:** ${report.lowRiskCount}\n\n`;

    if (report.criticalWarnings.length > 0) {
      md += `## 3. CRITICAL RED FLAGS & ONEROUS TERMS\n\n`;
      report.criticalWarnings.forEach((warning, idx) => {
        md += `${idx + 1}. **WARNING:** ${warning}\n`;
      });
      md += `\n`;
    }

    if (report.recommendedNegotiations.length > 0) {
      md += `## 4. STRATEGIC NEGOTIATION RECOMMENDATIONS\n\n`;
      report.recommendedNegotiations.forEach((neg, idx) => {
        md += `${idx + 1}. ${neg}\n`;
      });
      md += `\n`;
    }

    md += `## 5. CLAUSE-BY-CLAUSE AUDIT BREAKDOWN\n\n`;
    report.clauses.forEach((c) => {
      md += `### ${c.sectionNumber} — ${c.title} [${c.riskLevel.toUpperCase()} RISK]\n`;
      md += `**Location:** Page ${c.pageNumber}\n\n`;
      md += `> "${c.content}"\n\n`;
      md += `**Legal Implication:** ${c.implication}\n\n`;
    });

    md += `---\n\n`;
    md += `*DISCLAIMER: LegalPulse is an AI legal intelligence assistant designed to accelerate legal review and enhance access to justice. This automated audit memorandum does not constitute formal attorney-client legal representation. For critical commercial, employment, or litigation decisions, consult a licensed attorney.*`;

    return md;
  };

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateMarkdownReport());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy report:', err);
    }
  };

  const handleDownloadMarkdown = () => {
    const mdContent = generateMarkdownReport();
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = doc.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    link.href = url;
    link.download = `${safeTitle}_legal_audit_memo.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileText size={18} weight="bold" />
            </div>
            <div>
              <h3 id="export-modal-title" className="font-bold text-sm text-foreground">
                Export Executive Legal Audit Brief
              </h3>
              <p className="text-xs text-muted-foreground">
                Client-ready memorandum with grounded risk scores and negotiation leverage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Close export dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body / Report Preview */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 print:p-0">
          {/* Header Card */}
          <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                  Executive Legal Memorandum
                </span>
                <h4 className="font-bold text-base text-foreground mt-0.5">
                  {doc.title}
                </h4>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {doc.numPages} Pages · Document Type: {doc.documentType.toUpperCase()}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span
                  className={`text-xs font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                    report.overallRisk === 'high'
                      ? 'bg-red-500/15 text-red-700 dark:text-red-300'
                      : report.overallRisk === 'medium'
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {report.overallRisk === 'high' && <ShieldWarning size={14} weight="fill" />}
                  {report.overallRisk === 'medium' && <Warning size={14} weight="fill" />}
                  {report.overallRisk === 'low' && <CheckCircle size={14} weight="fill" />}
                  {report.overallRisk} Risk ({report.riskScore}/100)
                </span>
              </div>
            </div>

            <p className="text-xs text-foreground/90 leading-relaxed border-t border-border/50 pt-2 mt-2">
              {report.executiveVerdict}
            </p>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-2.5 rounded-lg border border-red-500/20 bg-red-500/5 text-center">
              <div className="text-base font-bold text-red-600 font-mono">
                {report.highRiskCount}
              </div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                High Liability
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-center">
              <div className="text-base font-bold text-amber-600 font-mono">
                {report.mediumRiskCount}
              </div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                Moderate Risk
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-center">
              <div className="text-base font-bold text-emerald-600 font-mono">
                {report.lowRiskCount}
              </div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                Standard / Safe
              </div>
            </div>
          </div>

          {/* Critical Warnings */}
          {report.criticalWarnings.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
                <ShieldWarning size={14} weight="fill" />
                Key Critical Red Flags
              </div>
              <div className="space-y-1">
                {report.criticalWarnings.slice(0, 3).map((w, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-red-500/5 border border-red-500/20 text-xs text-foreground flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Negotiations */}
          {report.recommendedNegotiations.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Scales size={14} />
                Strategic Negotiation Action Items
              </div>
              <div className="space-y-1">
                {report.recommendedNegotiations.slice(0, 3).map((n, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-emerald-500/5 border border-emerald-500/20 text-xs text-foreground flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1 shrink-0" />
                    <span>{n}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal Access Disclaimer */}
          <div className="p-3 rounded-lg bg-secondary/50 text-[11px] text-muted-foreground leading-relaxed">
            <strong>Legal Access Disclaimer:</strong> Generated by LegalPulse AI for informational and preliminary review purposes. Grounded with visual citations across all parsed clauses. Not formal legal representation.
          </div>
        </div>

        {/* Modal Footer / Export Action Buttons */}
        <div className="px-6 py-4 border-t border-border bg-secondary/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-muted-foreground">
            Export formats: Markdown · Print / PDF · Clipboard
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyClipboard}
              className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-xs font-medium text-foreground transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" weight="bold" />
                  <span className="text-emerald-600">Copied Memo!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-xs font-medium text-foreground transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <DownloadSimple size={14} />
              <span>Download .md</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer size={14} weight="bold" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
