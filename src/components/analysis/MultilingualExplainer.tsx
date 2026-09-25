'use client';

import React, { useState } from 'react';
import { Translate, Sparkle, Copy, Check, Info, WarningCircle, ArrowClockwise } from '@phosphor-icons/react';
import { LegalDocument } from '@/lib/types';

interface MultilingualExplainerProps {
  document: LegalDocument;
  apiKey?: string;
}

const SUPPORTED_LANGUAGES = [
  { id: 'Hindi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { id: 'Spanish', label: 'Español (Spanish)', flag: '🇪🇸' },
  { id: 'French', label: 'Français (French)', flag: '🇫🇷' },
  { id: 'German', label: 'Deutsch (German)', flag: '🇩🇪' },
  { id: 'Plain English', label: 'Plain English (Zero Jargon)', flag: '🇬🇧' },
];

export function MultilingualExplainer({ document, apiKey }: MultilingualExplainerProps) {
  const isDocB = document.id.includes('v2') || document.title.includes('Revised');

  // Derive preset clauses dynamically from the active document
  const presetClauses = React.useMemo(() => {
    if (isDocB) {
      return [
        {
          title: 'Section 3.2: Explicit Waiver of Service Bonds',
          text: 'There shall be no mandatory service lock-in, bond, or liquidated damages clawback of any kind. All ordinary onboarding, technology enablement, and internal skills training shall be treated as ordinary business operational expenses.',
        },
        {
          title: 'Section 5.1: 30-Day Reciprocal Notice with Buyout',
          text: 'Either party may terminate employment by giving thirty (30) calendar days prior written notice. Employee may elect to terminate immediately by paying basic salary in lieu of notice.',
        },
        {
          title: 'Section 6.1: 6-Month Paid Garden Leave Non-Compete',
          text: 'Restricted for a reasonable period of six (6) months limited to five named direct competitors. During said period, Company shall pay Employee one hundred percent (100%) of monthly Base Salary as continuing non-compete compensation.',
        },
        {
          title: 'Section 4.2: Protection of Personal Off-Hours Inventions',
          text: 'Company explicitly waives claim over any intellectual property developed by Employee entirely on Employee own time without using Company equipment or confidential trade secrets.',
        },
      ];
    }

    if (document.id.includes('v1') || document.id.includes('Standard') || document.title.includes('Original')) {
      return [
        {
          title: 'Section 3: Service Bond & $50,000 Clawback',
          text: 'In consideration of onboarding training, the Employee agrees to remain in service for twenty-four (24) consecutive months. If the Employee resigns prior to 24 months, Employee shall immediately pay the sum of $50,000 / INR 6,00,000 as liquidated damages within 7 days, and authorizes Company to deduct all earned salary toward satisfaction thereof.',
        },
        {
          title: 'Section 5.1: 90-Day Asymmetric Notice with No Buyout',
          text: 'The Employee may terminate this Agreement only by providing ninety (90) calendar days prior written notice to Company Management. The Employee shall not have any unilateral right to pay salary in lieu of serving the full ninety (90) day notice period.',
        },
        {
          title: 'Section 6.1: 24-Month Worldwide Non-Compete',
          text: 'For a period of twenty-four (24) consecutive months following termination for any reason, Employee shall not directly or indirectly join or consult with any business worldwide developing cloud infrastructure or developer tools, with zero post-termination garden leave pay.',
        },
        {
          title: 'Section 4.2: Personal Off-Hours Inventions Claim',
          text: 'This assignment applies comprehensively to all creations made during the term of employment, whether or not conceived during regular business hours, whether or not using Company computers or hardware, and whether or not directly related to Company products.',
        },
      ];
    }

    // Dynamic preset clauses for uploaded custom documents
    const docClauses = document.pages.flatMap((p) => p.clauses || []);
    if (docClauses.length > 0) {
      return docClauses.slice(0, 4).map((c) => ({
        title: `${c.sectionNumber}: ${c.title}`,
        text: c.content,
      }));
    }

    return [
      {
        title: 'Document Section 1',
        text: document.pages[0]?.text.slice(0, 300) || 'Legal clause text...',
      },
    ];
  }, [document, isDocB]);

  const [selectedLanguage, setSelectedLanguage] = useState('Hindi');
  const [clauseTitle, setClauseTitle] = useState(presetClauses[0]?.title || 'Legal Clause');
  const [clauseText, setClauseText] = useState(presetClauses[0]?.text || '');
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Update clause text and reset explanation when document switches
  React.useEffect(() => {
    if (presetClauses.length > 0) {
      setClauseTitle(presetClauses[0].title);
      setClauseText(presetClauses[0].text);
      setExplanation(null);
    }
  }, [document.id, presetClauses]);

  const handleTranslate = async (targetLang?: string, textToTranslate?: string) => {
    const lang = targetLang || selectedLanguage;
    const txt = textToTranslate || clauseText;
    setLoading(true);
    setTranslationError(null);

    try {
      const response = await fetch('/api/multilingual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: txt,
          targetLanguage: lang,
          clauseTitle,
          apiKey: apiKey && apiKey.trim() ? apiKey.trim() : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setExplanation(data.explanation);
        setTranslationError(null);
      } else {
        setTranslationError(data.error || 'Translation failed. The fallback engine will be used on retry.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Network error';
      setTranslationError(`Translation request failed: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (explanation) {
      navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 sm:p-5 space-y-5 overflow-y-auto h-full">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
          <Translate size={16} className="text-foreground" />
          <span>Multilingual Legal Accessibility</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Translate and break down restrictive contractual covenants into plain, natural language for non-native speakers.
        </p>
      </div>

      {/* Language Selector Tabs */}
      <div className="space-y-1.5">
        <label className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          Select Explanatory Language
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => {
                setSelectedLanguage(lang.id);
                handleTranslate(lang.id, clauseText);
              }}
              className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedLanguage === lang.id
                  ? 'bg-secondary text-foreground border-foreground/30 ring-1 ring-foreground/15 shadow-2xs'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border/80 hover:bg-secondary/40'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preset Clauses Buttons */}
      <div className="space-y-1.5">
        <label className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          Select Key Clause from Document
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {presetClauses.map((preset, i) => (
            <button
              key={i}
              onClick={() => {
                setClauseTitle(preset.title);
                setClauseText(preset.text);
                handleTranslate(selectedLanguage, preset.text);
              }}
              className="p-2.5 rounded-xl border border-border/80 bg-card hover:bg-secondary/40 text-left text-xs font-medium text-foreground transition-all cursor-pointer truncate shadow-2xs"
            >
              <div className="truncate font-medium text-foreground tracking-tight">{preset.title}</div>
              <div className="text-[10px] text-muted-foreground truncate mt-0.5 font-normal">
                {preset.text}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editable Legal Text Input */}
      <div className="space-y-1.5">
        <label className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          Legal Clause Text
        </label>
        <textarea
          rows={3}
          value={clauseText}
          onChange={(e) => setClauseText(e.target.value)}
          className="w-full p-3 text-xs rounded-xl bg-secondary/50 border border-border/80 focus:bg-background focus:border-foreground/30 focus:outline-none transition-all text-foreground font-serif leading-relaxed"
          placeholder="Paste or edit any contractual clause text..."
        />
        <div className="flex justify-end">
          <button
            onClick={() => handleTranslate()}
            disabled={loading || !clauseText.trim()}
            className="px-3.5 py-1.5 rounded-xl bg-foreground text-background hover:opacity-90 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 active:scale-[0.98]"
          >
            <Sparkle size={13} />
            <span>{loading ? 'Translating & Simplifying...' : 'Explain in Selected Language'}</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {translationError && (
        <div className="p-3 rounded-xl bg-risk-high-bg border border-risk-high-border text-xs text-risk-high-text flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <WarningCircle size={15} weight="fill" className="shrink-0" />
            <span>{translationError}</span>
          </div>
          <button
            onClick={() => handleTranslate()}
            className="shrink-0 px-2 py-1 rounded bg-secondary hover:bg-muted text-foreground font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ArrowClockwise size={12} />
            Retry
          </button>
        </div>
      )}

      {/* Result Display Box */}
      {explanation && (
        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-2xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Translate size={14} className="text-foreground" />
              {selectedLanguage} Legal Breakdown
            </span>
            <button
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy Translation</span>
                </>
              )}
            </button>
          </div>

          <div className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {explanation}
          </div>

          <div className="p-2.5 rounded-lg bg-secondary/50 text-[11px] text-muted-foreground flex items-center gap-2">
            <Info size={13} className="shrink-0 text-muted-foreground" />
            <span>
              Simplified explanation generated for accessibility. Translated legal terms should be cross-verified in official jurisdictional documents.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
