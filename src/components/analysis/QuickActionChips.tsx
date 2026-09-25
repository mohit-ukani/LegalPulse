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
} from '@phosphor-icons/react';
import { QUICK_ACTIONS } from '@/lib/sample-data';
import { QuickActionId } from '@/lib/types';

interface QuickActionChipsProps {
  onSelectAction: (actionId: QuickActionId) => void;
  activeActionId?: QuickActionId | null;
  loading?: boolean;
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
};

export function QuickActionChips({
  onSelectAction,
  activeActionId,
  loading = false,
}: QuickActionChipsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground tracking-tight">
          <Sparkle size={13} className="text-foreground" />
          <span>One-Click Legal Workflows</span>
        </div>
        <span className="text-[10.5px] text-muted-foreground font-mono">
          Interactive Audit
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {QUICK_ACTIONS.map((action) => {
          const isActive = activeActionId === action.id;
          const icon = ICON_MAP[action.iconName] || <FileText size={14} />;

          return (
            <button
              key={action.id}
              onClick={() => onSelectAction(action.id)}
              disabled={loading}
              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'border-foreground/30 bg-secondary text-foreground ring-1 ring-foreground/15 shadow-2xs'
                  : 'border-border/80 bg-card hover:bg-secondary/50 text-foreground hover:border-foreground/20 shadow-2xs'
              } disabled:opacity-50`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                  isActive ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'
                }`}>
                  {icon}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
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
