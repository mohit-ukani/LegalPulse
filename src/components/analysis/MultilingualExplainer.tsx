'use client';

import React, { useState } from 'react';
import { Translate, Sparkle, Copy, Check, Info } from '@phosphor-icons/react';
import { LegalDocument } from '@/lib/types';

interface MultilingualExplainerProps {
  document: LegalDocument;
}

const SUPPORTED_LANGUAGES = [
  { id: 'Hindi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { id: 'Spanish', label: 'Español (Spanish)', flag: '🇪🇸' },
  { id: 'French', label: 'Français (French)', flag: '🇫🇷' },
  { id: 'German', label: 'Deutsch (German)', flag: '🇩🇪' },
  { id: 'Plain English', label: 'Plain English (Zero Jargon)', flag: '🇬🇧' },
];

export function MultilingualExplainer({ document }: MultilingualExplainerProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('Hindi');
  const [clauseTitle, setClauseTitle] = useState('Section 3: Service Bond & Clawback');
  const [clauseText, setClauseText] = useState(
    'In consideration of onboarding training, the Employee agrees to remain in service for twenty-four (24) consecutive months. If the Employee resigns prior to 24 months, Employee shall immediately pay the sum of $50,000 / INR 6,00,000 as liquidated damages within 7 days, and authorizes Company to deduct all earned salary toward satisfaction thereof.'
  );
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Quick preset clauses from the document
  const presetClauses = [
    {
      title: 'Section 3: Service Bond & Clawback',
      text: 'In consideration of onboarding training, the Employee agrees to remain in service for twenty-four (24) consecutive months. If the Employee resigns prior to 24 months, Employee shall immediately pay the sum of $50,000 / INR 6,00,000 as liquidated damages within 7 days, and authorizes Company to deduct all earned salary toward satisfaction thereof.',
    },
    {
      title: 'Section 5.1: 90-Day Asymmetric Notice',
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

  const handleTranslate = async (targetLang?: string, textToTranslate?: string) => {
    const lang = targetLang || selectedLanguage;
    const txt = textToTranslate || clauseText;
    setLoading(true);

    try {
      const response = await fetch('/api/multilingual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: txt,
          targetLanguage: lang,
          clauseTitle,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setExplanation(data.explanation);
      }
    } catch (err) {
      console.error('Translation error:', err);
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
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Translate size={18} className="text-primary" />
          <span>Multilingual Legal Accessibility Engine</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Legal terminology often disenfranchises non-native speakers. Translate and break down complex contractual restrictions into natural, plain language.
        </p>
      </div>

      {/* Language Selector Tabs */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Select Explanatory Language:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => {
                setSelectedLanguage(lang.id);
                handleTranslate(lang.id, clauseText);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedLanguage === lang.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card text-card-foreground border-border hover:bg-secondary'
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
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Select Key Clause from Document:
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
              className="p-2 rounded-lg border border-border bg-card hover:bg-secondary text-left text-xs font-medium text-foreground transition-colors cursor-pointer truncate"
            >
              <div className="truncate font-semibold text-primary">{preset.title}</div>
              <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                {preset.text}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editable Legal Text Input */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Legal Clause Text:
        </label>
        <textarea
          rows={3}
          value={clauseText}
          onChange={(e) => setClauseText(e.target.value)}
          className="w-full p-2.5 text-xs rounded-lg bg-secondary/70 border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-serif leading-relaxed"
          placeholder="Paste or edit any contractual clause text..."
        />
        <div className="flex justify-end">
          <button
            onClick={() => handleTranslate()}
            disabled={loading || !clauseText.trim()}
            className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkle size={13} />
            <span>{loading ? 'Translating & Simplifying...' : 'Explain in Selected Language'}</span>
          </button>
        </div>
      </div>

      {/* Result Display Box */}
      {explanation && (
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Translate size={15} className="text-emerald-600" />
              {selectedLanguage} Legal Breakdown
            </span>
            <button
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Translation</span>
                </>
              )}
            </button>
          </div>

          <div className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">
            {explanation}
          </div>

          <div className="p-2.5 rounded-lg bg-secondary/60 text-[11px] text-muted-foreground flex items-center gap-2">
            <Info size={14} className="shrink-0 text-primary" />
            <span>
              Simplified explanation generated for accessibility. Translated legal terms should be cross-verified in official jurisdictional documents.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
