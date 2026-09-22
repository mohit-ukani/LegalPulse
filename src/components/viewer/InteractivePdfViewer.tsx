'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
  ArrowsOut,
  ArrowsIn,
  FileText,
  BookmarkSimple,
  ShieldWarning,
  Sparkle,
  ArrowSquareOut,
  ChatText,
} from '@phosphor-icons/react';
import { Citation, LegalDocument } from '@/lib/types';

interface InteractivePdfViewerProps {
  document: LegalDocument;
  activeCitation?: Citation | null;
  onAskAboutText?: (selectedText: string) => void;
}

export function InteractivePdfViewer({
  document,
  activeCitation,
  onAskAboutText,
}: InteractivePdfViewerProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionCoord, setSelectionCoord] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // When activeCitation updates, navigate to page and scroll to highlighted clause!
  useEffect(() => {
    if (activeCitation) {
      const targetPage = activeCitation.pageNumber;
      setCurrentPage(targetPage);

      setTimeout(() => {
        const pageEl = pageRefs.current[targetPage];
        if (pageEl) {
          pageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  }, [activeCitation]);

  // Handle text selection inside the document viewer
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 5) {
      const text = selection.toString().trim();
      setSelectedText(text);

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionCoord({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    } else {
      setSelectedText('');
      setSelectionCoord(null);
    }
  };

  const handleAskSelection = () => {
    if (selectedText && onAskAboutText) {
      onAskAboutText(selectedText);
      setSelectedText('');
      setSelectionCoord(null);
    }
  };

  const activePageData = document.pages.find((p) => p.pageNumber === currentPage) || document.pages[0];

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-muted/40 border-r border-border select-text relative overflow-hidden"
      onMouseUp={handleMouseUp}
    >
      {/* Viewer Header Toolbar */}
      <div className="h-12 bg-card border-b border-border px-3 flex items-center justify-between gap-2 shrink-0 z-20 shadow-2xs">
        {/* Left: Page Navigator */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 rounded hover:bg-secondary disabled:opacity-35 text-foreground cursor-pointer transition-colors"
            title="Previous Page"
          >
            <CaretLeft size={16} />
          </button>

          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-secondary text-foreground">
            Page {currentPage} of {document.numPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(document.numPages, p + 1))}
            disabled={currentPage >= document.numPages}
            className="p-1.5 rounded hover:bg-secondary disabled:opacity-35 text-foreground cursor-pointer transition-colors"
            title="Next Page"
          >
            <CaretRight size={16} />
          </button>
        </div>

        {/* Middle: Document Title & Search */}
        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-xs mx-2">
          <div className="relative w-full">
            <MagnifyingGlass size={13} className="absolute left-2.5 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search in document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-7.5 pl-8 pr-3 text-xs rounded-md bg-secondary/80 border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Right: Zoom & Raw PDF link */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-secondary rounded border border-border">
            <button
              onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
              className="px-1.5 py-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              title="Zoom Out"
            >
              <ArrowsIn size={14} />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-foreground font-medium">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="px-1.5 py-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              title="Zoom In"
            >
              <ArrowsOut size={14} />
            </button>
          </div>

          {document.fileUrl && (
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Open raw PDF in new tab"
            >
              <ArrowSquareOut size={15} />
            </a>
          )}
        </div>
      </div>

      {/* Floating Citation Target Badge (when active) */}
      {activeCitation && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2 z-10 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <BookmarkSimple size={15} weight="fill" className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">
              Visual Verification Active:
            </span>
            <span className="font-mono font-medium truncate">
              {activeCitation.sectionNumber} (Page {activeCitation.pageNumber})
            </span>
          </div>
          <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded font-mono shrink-0">
            Source Grounded
          </span>
        </div>
      )}

      {/* Selection Tooltip Action */}
      {selectedText && selectionCoord && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-2 bg-primary text-primary-foreground text-xs rounded-lg px-2.5 py-1.5 shadow-lg flex items-center gap-1.5 cursor-pointer animate-in fade-in"
          style={{ left: `${selectionCoord.x}px`, top: `${selectionCoord.y}px` }}
          onClick={handleAskSelection}
        >
          <ChatText size={14} weight="bold" />
          <span>Ask LegalPulse about this passage</span>
        </div>
      )}

      {/* Document Pages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 flex flex-col items-center">
        {document.pages.map((page) => {
          const isCurrentPage = page.pageNumber === currentPage;
          const isCitedPage = activeCitation?.pageNumber === page.pageNumber;

          return (
            <div
              key={page.pageNumber}
              ref={(el) => {
                pageRefs.current[page.pageNumber] = el;
              }}
              style={{
                width: `${Math.round(595 * (zoomLevel / 100))}px`,
                minHeight: `${Math.round(842 * (zoomLevel / 100))}px`,
              }}
              className={`bg-card text-card-foreground rounded-lg shadow-md border transition-all duration-300 relative flex flex-col ${
                isCitedPage
                  ? 'ring-2 ring-amber-500/80 shadow-amber-500/10'
                  : 'border-border'
              }`}
            >
              {/* Top Page Header Bar */}
              <div className="h-9 px-6 bg-secondary/70 border-b border-border flex items-center justify-between text-[10px] text-muted-foreground font-mono rounded-t-lg">
                <span className="flex items-center gap-1 font-semibold text-foreground/80">
                  <FileText size={12} />
                  {document.title}
                </span>
                <span>
                  PAGE {page.pageNumber} OF {document.numPages}
                </span>
              </div>

              {/* Page Content Body */}
              <div className="p-8 sm:p-10 flex-1 flex flex-col font-serif leading-relaxed text-[13px] text-foreground/90 space-y-4">
                {renderFormattedPageText(
                  page.text,
                  activeCitation,
                  page.pageNumber,
                  searchQuery
                )}
              </div>

              {/* Page Footer Bar */}
              <div className="h-8 px-6 border-t border-border/80 flex items-center justify-between text-[9px] text-muted-foreground font-mono rounded-b-lg">
                <span>LEGALPULSE CITATION GROUNDING ENGINE</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  VERIFIED DOCUMENT ARCHIVE
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * High-fidelity rendering of legal contract text with interactive citation highlights
 */
function renderFormattedPageText(
  text: string,
  activeCitation?: Citation | null,
  pageNumber?: number,
  searchQuery?: string
) {
  const paragraphs = text.split('\n\n');

  return paragraphs.map((para, idx) => {
    const isHeading =
      para.trim().startsWith('SECTION') ||
      para.trim().startsWith('EMPLOYMENT') ||
      para.trim().startsWith('REVISED') ||
      para.trim().startsWith('IN WITNESS');

    // Check if this paragraph matches the active citation quote
    const isCitationTarget =
      Boolean(activeCitation &&
      activeCitation.pageNumber === pageNumber &&
      (para.includes(activeCitation.quote.slice(0, 30)) ||
        (activeCitation.clauseTitle && para.includes(activeCitation.clauseTitle))));

    if (isHeading) {
      return (
        <h3
          key={idx}
          className="font-sans font-bold text-sm text-primary tracking-tight border-b border-border/60 pb-1 pt-2 uppercase"
        >
          {highlightText(para.trim(), searchQuery)}
        </h3>
      );
    }

    // Regular legal clause paragraph
    return (
      <div
        key={idx}
        className={`relative p-2 rounded transition-all duration-300 ${
          isCitationTarget
            ? 'citation-highlight-pulse bg-amber-500/20 border-l-4 border-amber-500 my-2'
            : 'hover:bg-muted/30'
        }`}
      >
        {isCitationTarget && (
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-sans font-bold text-amber-900 dark:text-amber-200">
            <Sparkle size={12} weight="fill" className="text-amber-600" />
            MATCHED CLAUSE CITATION · {activeCitation?.sectionNumber}
          </div>
        )}

        <p className="text-[13px] leading-relaxed">
          {highlightText(para.trim(), searchQuery)}
        </p>
      </div>
    );
  });
}

/**
 * Text search highlighter helper
 */
function highlightText(text: string, query?: string) {
  if (!query || query.trim().length < 2) {
    return text;
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        className="bg-yellow-300 dark:bg-yellow-600/60 text-black dark:text-white px-0.5 rounded"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
