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
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
          <Sparkle size={14} className="text-emerald-600 dark:text-emerald-400" />
          Guided Legal Workflows (One-Click Analysis)
        </div>
        <span className="text-[11px] text-muted-foreground font-mono">
          &lt; 40 Clicks Optimized
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {QUICK_ACTIONS.map((action) => {
          const isActive = activeActionId === action.id;
          const icon = ICON_MAP[action.iconName] || <FileText size={16} />;

          return (
            <button
              key={action.id}
              onClick={() => onSelectAction(action.id)}
              disabled={loading}
              className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border bg-card hover:bg-secondary/70 text-card-foreground hover:border-border/80'
              } disabled:opacity-50`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={isActive ? 'text-primary-foreground' : 'text-primary'}>
                  {icon}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <div>
                <div className="text-xs font-semibold leading-tight line-clamp-1">
                  {action.label}
                </div>
                <div
                  className={`text-[10px] leading-tight line-clamp-1 mt-0.5 ${
                    isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}
                >
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
