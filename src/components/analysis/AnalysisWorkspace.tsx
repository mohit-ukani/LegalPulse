'use client';

import React, { useState } from 'react';
import {
  Sparkle,
  ChatText,
  ShieldWarning,
  Translate,
  BookmarkSimple,
  WarningCircle,
  ArrowRight,
  Scales,
  CheckCircle,
  Copy,
  Check,
} from '@phosphor-icons/react';
import { Citation, LegalDocument, QuickActionId, QuickActionResult } from '@/lib/types';
import { QuickActionChips } from './QuickActionChips';
import { CitationCard } from './CitationCard';
import { GroundedChat } from './GroundedChat';
import { RiskDashboard } from './RiskDashboard';
import { MultilingualExplainer } from './MultilingualExplainer';

interface AnalysisWorkspaceProps {
  document: LegalDocument;
  onCitationClick: (citation: Citation) => void;
  activeCitation?: Citation | null;
  onSwitchToComparison: () => void;
  apiKey?: string;
  externalPrompt?: { text: string; timestamp: number } | null;
  onOpenExport?: () => void;
}

export function AnalysisWorkspace({
  document,
  onCitationClick,
  activeCitation,
  onSwitchToComparison,
  apiKey,
  externalPrompt,
  onOpenExport,
}: AnalysisWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'quick_actions' | 'chat' | 'risk' | 'multilingual'>('quick_actions');
  const [activeActionId, setActiveActionId] = useState<QuickActionId | null>('notice_period');
  const [actionResult, setActionResult] = useState<QuickActionResult | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [chatPromptToInject, setChatPromptToInject] = useState<{ text: string; timestamp: number } | null>(null);
  const [copiedActionPlan, setCopiedActionPlan] = useState(false);

  // When external prompt is received from PDF passage selection, switch to chat and submit
  React.useEffect(() => {
    if (externalPrompt) {
      setChatPromptToInject(externalPrompt);
      setActiveTab('chat');
    }
  }, [externalPrompt]);

  const handleSelectQuickAction = React.useCallback(async (actionId: QuickActionId) => {
    setActiveActionId(actionId);
    setActionLoading(true);

    try {
      const res = await fetch('/api/quick-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId,
          documentId: document.id,
          customDoc: document.id.startsWith('custom-doc-') ? document : undefined,
          apiKey: apiKey && apiKey.trim() ? apiKey.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionResult(data.result);
        // Automatically highlight the first citation in the PDF viewer
        if (data.result.citations && data.result.citations.length > 0) {
          onCitationClick(data.result.citations[0]);
        }
      }
    } catch (err) {
      console.error('Quick action error:', err);
    } finally {
      setActionLoading(false);
    }
  }, [document, onCitationClick, apiKey]);

  // Auto-run initial quick action on doc load
  React.useEffect(() => {
    handleSelectQuickAction('notice_period');
  }, [document.id, handleSelectQuickAction]);

  const handleAskInChat = (questionText: string) => {
    setChatPromptToInject({ text: questionText, timestamp: Date.now() });
    setActiveTab('chat');
  };

  const handleCopyActionPlan = async () => {
    if (!actionResult) return;
    const plan = `LEGAL STRATEGY & COUNTER-STEPS: ${actionResult.title}\n\n` +
      `Summary: ${actionResult.plainEnglishSummary}\n\n` +
      `Legal Implication: ${actionResult.legalImplications}\n\n` +
      `Action Steps:\n` + actionResult.actionableNextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n');
    try {
      await navigator.clipboard.writeText(plan);
      setCopiedActionPlan(true);
      setTimeout(() => setCopiedActionPlan(false), 2000);
    } catch (err) {
      console.error('Failed to copy action plan:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      {/* Workspace Tabs Header */}
      <div className="h-12 border-b border-border px-3 bg-secondary/50 flex items-center justify-between gap-1 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1" role="tablist" aria-label="Analysis tools">
          <button
            onClick={() => setActiveTab('quick_actions')}
            role="tab"
            aria-selected={activeTab === 'quick_actions'}
            aria-controls="panel-quick-actions"
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'quick_actions'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkle size={14} className={activeTab === 'quick_actions' ? 'text-emerald-600' : ''} />
            <span>Guided Actions</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            role="tab"
            aria-selected={activeTab === 'chat'}
            aria-controls="panel-chat"
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ChatText size={14} />
            <span>Grounded Q&A</span>
          </button>

          <button
            onClick={() => setActiveTab('risk')}
            role="tab"
            aria-selected={activeTab === 'risk'}
            aria-controls="panel-risk"
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'risk'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldWarning size={14} />
            <span>Risk Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('multilingual')}
            role="tab"
            aria-selected={activeTab === 'multilingual'}
            aria-controls="panel-multilingual"
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'multilingual'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Translate size={14} />
            <span>Multilingual</span>
          </button>
        </div>

        {/* Contract diff quick shortcut */}
        <button
          onClick={onSwitchToComparison}
          className="hidden lg:flex items-center gap-1 text-[11px] text-primary hover:underline font-medium shrink-0 cursor-pointer"
        >
          <span>Compare vs Revised v2</span>
          <ArrowRight size={11} />
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-hidden">
        {/* Tab 1: Quick Actions Panel */}
        {activeTab === 'quick_actions' && (
          <div id="panel-quick-actions" role="tabpanel" className="p-4 sm:p-5 h-full overflow-y-auto space-y-5">
            {/* Quick Actions Grid */}
            <QuickActionChips
              onSelectAction={handleSelectQuickAction}
              activeActionId={activeActionId}
              loading={actionLoading}
            />

            {/* Quick Action Result Details Card */}
            {actionLoading ? (
              <div className="p-6 rounded-xl border border-border bg-card flex flex-col items-center justify-center space-y-2 text-center text-xs text-muted-foreground">
                <Sparkle size={20} className="animate-spin text-emerald-600" />
                <div>Analyzing clauses with Gemini 1.5 Flash...</div>
                <div className="text-[10px]">Retrieving fine-grained citations and verifying text layout.</div>
              </div>
            ) : actionResult ? (
              <div className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-xs space-y-4 animate-in fade-in">
                {/* Result Title & Risk Badge */}
                <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">
                      {actionResult.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Verified from {document.title}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded flex items-center gap-1 shrink-0 ${
                      actionResult.riskRating === 'high'
                        ? 'bg-red-500/15 text-red-700 dark:text-red-300'
                        : actionResult.riskRating === 'medium'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {actionResult.riskRating === 'high' && <ShieldWarning size={12} weight="fill" />}
                    {actionResult.riskRating === 'medium' && <WarningCircle size={12} weight="fill" />}
                    {actionResult.riskRating === 'low' && <CheckCircle size={12} weight="fill" />}
                    {actionResult.riskRating} Risk Level
                  </span>
                </div>

                {/* Plain English Summary */}
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Plain English Breakdown:
                  </div>
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                    {actionResult.plainEnglishSummary}
                  </p>
                </div>

                {/* Legal Implications */}
                <div className="space-y-1 p-3 rounded-lg bg-secondary/60 text-xs">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1">
                    <Scales size={13} />
                    Legal Implications & Exposure:
                  </div>
                  <p className="text-foreground/90 leading-relaxed">
                    {actionResult.legalImplications}
                  </p>
                </div>

                {/* Grounded Visual Citations */}
                {actionResult.citations.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <BookmarkSimple size={13} weight="fill" className="text-amber-600" />
                      Visual Citations (Click to Highlight in Left PDF Viewer):
                    </div>
                    <div className="space-y-2">
                      {actionResult.citations.map((c, i) => (
                        <CitationCard
                          key={i}
                          citation={c}
                          onJumpToPdf={onCitationClick}
                          isActive={
                            activeCitation?.pageNumber === c.pageNumber &&
                            activeCitation?.sectionNumber === c.sectionNumber
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Questions for Legal Counsel */}
                {actionResult.suggestedLegalQuestions.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Specific Questions to Clarify with a Legal Professional:
                    </div>
                    <div className="space-y-1.5">
                      {actionResult.suggestedLegalQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-secondary/40 border border-border/50 flex items-center justify-between text-xs text-foreground group"
                        >
                          <span className="leading-snug pr-2">&ldquo;{q}&rdquo;</span>
                          <button
                            onClick={() => handleAskInChat(q)}
                            className="text-[10px] font-medium text-primary hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                          >
                            Ask in Chat
                            <ArrowRight size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actionable Next Steps */}
                {actionResult.actionableNextSteps.length > 0 && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-[11px] uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        Actionable Next Steps & Strategy:
                      </div>
                      <button
                        onClick={handleCopyActionPlan}
                        className="text-[10px] font-medium text-emerald-800 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedActionPlan ? (
                          <>
                            <Check size={11} className="text-emerald-600" weight="bold" />
                            <span>Copied Strategy!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy Action Plan</span>
                          </>
                        )}
                      </button>
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {actionResult.actionableNextSteps.map((step, sidx) => (
                        <li key={sidx} className="leading-normal">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Tab 2: Grounded Q&A Chat Panel */}
        {activeTab === 'chat' && (
          <GroundedChat
            document={document}
            onCitationClick={onCitationClick}
            activeCitation={activeCitation}
            externalPrompt={chatPromptToInject}
            apiKey={apiKey}
          />
        )}

        {/* Tab 3: Risk Dashboard Panel */}
        {activeTab === 'risk' && (
          <RiskDashboard
            document={document}
            onCitationClick={onCitationClick}
            onOpenExport={onOpenExport}
          />
        )}

        {/* Tab 4: Multilingual Accessibility Panel */}
        {activeTab === 'multilingual' && (
          <MultilingualExplainer document={document} apiKey={apiKey} />
        )}
      </div>
    </div>
  );
}
