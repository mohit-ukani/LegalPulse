'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  PaperPlaneRight,
  Sparkle,
  WarningCircle,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  BookmarkSimple,
} from '@phosphor-icons/react';
import { ChatMessage, Citation, LegalDocument, ChallengePersona } from '@/lib/types';
import { CitationCard } from './CitationCard';

interface GroundedChatProps {
  document: LegalDocument;
  onCitationClick: (citation: Citation) => void;
  activeCitation?: Citation | null;
  externalPrompt?: { text: string; timestamp: number } | string | null;
  apiKey?: string;
  persona?: ChallengePersona;
}

const STARTER_PROMPTS_PROFESSIONAL = [
  'What is the required notice period for resignation, and can I buyout?',
  'Does this agreement contain an employment bond or liquidated damages clawback?',
  'What non-compete restrictions exist post-employment?',
  'Does the company claim my personal weekend projects or open-source code?',
  'What is the company parental leave and paternity policy? (Test Unknown)',
];

const STARTER_PROMPTS_BUSINESS = [
  'What is the aggregate liability cap and are consequential damages excluded?',
  'What are the payment terms, billing dispute windows, and late interest penalties?',
  'What is the SLA uptime commitment and what credits apply for downtime?',
  'Does the vendor provide IP infringement indemnification with legal defense?',
  'What are the termination for convenience terms and transition assistance requirements?',
];

export function GroundedChat({
  document,
  onCitationClick,
  activeCitation,
  externalPrompt,
  apiKey,
  persona = 'professional',
}: GroundedChatProps) {
  const isBusiness = persona === 'business' || document.id.includes('msa');
  const starterPrompts = isBusiness ? STARTER_PROMPTS_BUSINESS : STARTER_PROMPTS_PROFESSIONAL;

  const makeWelcomeMessage = React.useCallback(
    (docTitle: string): ChatMessage => ({
      id: 'welcome',
      role: 'assistant',
      content: isBusiness
        ? `Welcome to **LegalPulse B2B Intelligence** for **${docTitle}**. Ask any commercial query regarding liability exposure, indemnification, SLA credits, or Net-30 payment remedies. Every answer is grounded with verifiable page and clause citations.`
        : `Welcome to **LegalPulse Grounded Analysis** for **${docTitle}**. Ask any question regarding your obligations, risks, notice periods, or compensation. Every answer will be grounded with clickable page and clause citations directly linked to the PDF on your left.`,
      timestamp: 0,
      suggestedQuestions: isBusiness
        ? [
            'What is the liability cap and are damages uncapped?',
            'What are the payment terms and invoice dispute cure periods?',
            'What service level credits apply for uptime failure?',
          ]
        : [
            'What are the highest risk clauses in this document?',
            'What is the notice period and is there a buyout right?',
            'Does the agreement impose an uncompensated non-compete?',
          ],
    }),
    [isBusiness]
  );

  const [messages, setMessages] = useState<ChatMessage[]>([makeWelcomeMessage(document.title)]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastPromptTimestampRef = useRef<number | null>(null);

  const handleSend = async (queryToSend?: string) => {
    const query = queryToSend || inputQuery;
    if (!query.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryToSend) setInputQuery('');
    setLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          documentId: document.id,
          customDoc: document.id.startsWith('custom-doc-') ? document : undefined,
          apiKey: apiKey && apiKey.trim() ? apiKey.trim() : undefined,
          persona,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          timestamp: Date.now(),
          citations: data.citations || [],
          suggestedQuestions: data.suggestedQuestions || [],
          isMissingInfoNotice: Boolean(data.isMissingInfo),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Auto-highlight first citation in viewer if present
        if (data.citations && data.citations.length > 0) {
          onCitationClick(data.citations[0]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `Unable to complete analysis: ${data.error || 'Server error'}`,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Network error';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Analysis request failed: ${errMsg}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Reset messages when document changes
  useEffect(() => {
    setMessages([makeWelcomeMessage(document.title)]);
    lastPromptTimestampRef.current = null;
  }, [document.id, document.title, makeWelcomeMessage]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle external prompt injection (e.g. from PDF text selection or quick chips)
  useEffect(() => {
    if (!externalPrompt) return;
    if (typeof externalPrompt === 'string') {
      handleSend(externalPrompt);
    } else if (externalPrompt.timestamp !== lastPromptTimestampRef.current) {
      lastPromptTimestampRef.current = externalPrompt.timestamp;
      handleSend(externalPrompt.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalPrompt]);


  const copyForLawyer = (content: string, id: string) => {
    const textToCopy = `[Legal Question for Legal Counsel generated via LegalPulse]\n\n${content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-foreground text-background font-normal rounded-tr-xs shadow-2xs'
                    : 'bg-secondary/40 text-foreground border border-border/80 rounded-tl-xs shadow-2xs'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-border/50 text-[11px] font-medium text-foreground">
                    <span className="flex items-center gap-1.5">
                      <Sparkle size={12} className="text-foreground" />
                      LegalPulse Intelligence
                    </span>
                    <button
                      onClick={() => copyForLawyer(msg.content, msg.id)}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[10px] font-normal cursor-pointer transition-colors"
                      title="Copy text for your lawyer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check size={11} className="text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copy for Lawyer</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Missing Information Notice Banner */}
                {msg.isMissingInfoNotice && (
                  <div className="mb-2.5 p-2.5 rounded-lg bg-secondary/80 border border-border/80 text-foreground text-xs flex items-start gap-2">
                    <WarningCircle size={15} className="text-muted-foreground shrink-0 mt-0.5" />
                    <div className="text-[11.5px] leading-relaxed">
                      <span className="font-semibold text-foreground">Verified Clause Absence:</span> This document contains no mention of this topic. The engine will never hallucinate absent covenants.
                    </div>
                  </div>
                )}

                {/* Main Content Body */}
                <div className="space-y-2 whitespace-pre-wrap">
                  {msg.content}
                </div>

                {/* Citations Grid */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-border/60">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                      <BookmarkSimple size={12} weight="fill" className="text-amber-600" />
                      Grounded Citations ({msg.citations.length} Verified in Source)
                    </div>
                    <div className="space-y-2">
                      {msg.citations.map((c, i) => (
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

                {/* Suggested Legal Questions to Ask */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-border/50">
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5 tracking-wider">
                      Suggested Follow-Up Clarifications
                    </div>
                    <div className="space-y-1">
                      {msg.suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(q)}
                          className="w-full text-left p-2 rounded-lg bg-secondary/40 hover:bg-secondary text-[11px] text-foreground border border-border/60 flex items-center justify-between group cursor-pointer transition-colors"
                        >
                          <span className="truncate pr-2 text-foreground/90">&ldquo;{q}&rdquo;</span>
                          <ArrowRight
                            size={11}
                            className="text-muted-foreground group-hover:text-foreground shrink-0 transition-transform group-hover:translate-x-0.5"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[9.5px] font-mono text-muted-foreground mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/40 border border-border/70 w-fit text-xs text-muted-foreground">
            <Sparkle size={13} className="animate-spin text-foreground" />
            <span>Retrieving text chunks & verifying visual citations with Gemini 3.8 Flash...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts Bar (when few messages) */}
      {messages.length <= 3 && (
        <div className="px-4 py-2 bg-secondary/20 border-t border-border/60">
          <div className="text-[10px] font-medium text-muted-foreground mb-1.5">
            Suggested Inquiries:
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {starterPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-card hover:bg-secondary text-[11px] text-foreground border border-border/70 shrink-0 cursor-pointer transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Query Input Box */}
      <div className="p-3 bg-card border-t border-border/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about notice periods, non-competes, bonds, compensation, or risk..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={loading}
            className="flex-1 h-9 px-3.5 text-xs rounded-xl bg-secondary/60 hover:bg-secondary/80 focus:bg-background border border-border/70 focus:border-foreground/30 focus:outline-none transition-all text-foreground placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="h-9 px-3.5 rounded-xl bg-foreground text-background hover:opacity-90 disabled:opacity-30 flex items-center justify-center transition-all cursor-pointer active:scale-[0.98]"
          >
            <PaperPlaneRight size={13} weight="bold" />
          </button>
        </form>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Every statement is linked to an exact page & clause.</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <ShieldCheck size={11} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
            Zero-Hallucination Grounding
          </span>
        </div>
      </div>
    </div>
  );
}
