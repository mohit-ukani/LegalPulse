'use client';

import React from 'react';
import {
  Clock,
  ShieldWarning,
  CurrencyDollar,
  Coins,
  WarningCircle,
  Lightbulb,
  Scales,
  FileText,
  Lock,
  Sparkle,
  Shield,
  ShieldCheck,
  Briefcase,
  Buildings,
} from '@phosphor-icons/react';
import { QUICK_ACTIONS } from '@/lib/sample-data';
import { ChallengePersona, QuickActionId } from '@/lib/types';

interface QuickActionChipsProps {
  onSelectAction: (actionId: QuickActionId) => void;
  activeActionId?: QuickActionId | null;
  loading?: boolean;
  activePersona?: ChallengePersona;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Clock: <Clock size={16} weight="bold" />,
  ShieldWarning: <ShieldWarning size={16} weight="bold" />,
  CurrencyDollar: <CurrencyDollar size={16} weight="bold" />,
  Coins: <Coins size={16} weight="bold" />,
  WarningCircle: <WarningCircle size={16} weight="bold" />,
  Lightbulb: <Lightbulb size={16} weight="bold" />,
  Scales: <Scales size={16} weight="bold" />,
  FileText: <FileText size={16} weight="bold" />,
  Lock: <Lock size={16} weight="bold" />,
  Shield: <Shield size={16} weight="bold" />,
  ShieldCheck: <ShieldCheck size={16} weight="bold" />,
};

export function QuickActionChips({
  onSelectAction,
  activeActionId,
  loading = false,
  activePersona = 'professional',
}: QuickActionChipsProps) {
  // Sort actions so the active persona's tailored actions appear first
  const sortedActions = React.useMemo(() => {
    return [...QUICK_ACTIONS].sort((a, b) => {
      const aMatches = a.targetPersona === activePersona || a.targetPersona === 'both';
      const bMatches = b.targetPersona === activePersona || b.targetPersona === 'both';
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });
  }, [activePersona]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground tracking-tight">
          <Sparkle size={13} className="text-foreground" />
          <span>One-Click Legal Workflows</span>
        </div>
        <div className="flex items-center gap-1 text-[10.5px] font-medium text-muted-foreground">
          {activePersona === 'business' ? (
            <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-mono bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
              <Buildings size={11} weight="bold" />
              B2B / Commercial
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <Briefcase size={11} weight="bold" />
              Professional / Employee
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {sortedActions.map((action) => {
          const isActive = activeActionId === action.id;
          const isPersonaMatch = action.targetPersona === activePersona || action.targetPersona === 'both';
          const icon = ICON_MAP[action.iconName] || <FileText size={14} />;

          return (
            <button
              key={action.id}
              onClick={() => onSelectAction(action.id)}
              disabled={loading}
              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'border-foreground/30 bg-secondary text-foreground ring-1 ring-foreground/15 shadow-2xs'
                  : isPersonaMatch
                  ? 'border-border/90 bg-card hover:bg-secondary/60 text-foreground shadow-2xs'
                  : 'border-border/50 bg-card/60 opacity-80 hover:opacity-100 hover:bg-secondary/40 text-muted-foreground hover:text-foreground shadow-2xs'
              } disabled:opacity-50`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-foreground text-background'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {icon}
                </span>
                <div className="flex items-center gap-1">
                  {action.targetPersona === 'business' && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                      B2B
                    </span>
                  )}
                  {action.targetPersona === 'professional' && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      Prof
                    </span>
                  )}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium leading-tight line-clamp-1 tracking-tight">
                  {action.label}
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight line-clamp-1 mt-0.5">
                  {action.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
