'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldWarning, ArrowClockwise, FileText } from '@phosphor-icons/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('LegalPulse Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
          <div className="max-w-md w-full p-6 rounded-2xl border border-border bg-card shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
              <ShieldWarning size={28} weight="fill" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">
                Workstation Session Interrupted
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                An unexpected exception occurred while rendering the legal document. Your underlying document data is safe in memory.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-secondary text-left font-mono text-[11px] text-muted-foreground overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ArrowClockwise size={14} weight="bold" />
                Reload Workstation
              </button>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('legalpulse_gemini_key');
                    localStorage.removeItem('legalpulse_custom_docs');
                    localStorage.removeItem('legalpulse_sidebar_open');
                    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                    window.location.href = '/';
                  }
                }}
                className="px-4 py-2 rounded-lg border border-border bg-secondary hover:bg-muted text-xs font-medium text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileText size={14} />
                Reset Session
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
