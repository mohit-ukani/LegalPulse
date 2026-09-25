'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
  ArrowsOut,
  ArrowsIn,
  FileText,
  Sparkle,
  ArrowSquareOut,
  ChatText,
  TrashSimple,
} from '@phosphor-icons/react';
import { Citation, LegalDocument } from '@/lib/types';

interface InteractivePdfViewerProps {
  document: LegalDocument;
  activeCitation?: Citation | null;
  onAskAboutText?: (selectedText: string) => void;
  onRequestDelete?: (doc: LegalDocument) => void;
}

export function InteractivePdfViewer({
  document,
  activeCitation,
  onAskAboutText,
  onRequestDelete,
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

  const matchingPages = React.useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return [];
    const q = searchQuery.trim().toLowerCase();
    const result: { pageNumber: number; count: number }[] = [];
    document.pages.forEach((page) => {
      const lower = page.text.toLowerCase();
      let count = 0;
      let pos = 0;
      while ((pos = lower.indexOf(q, pos)) !== -1) {
        count++;
        pos += q.length;
      }
      if (count > 0) {
        result.push({ pageNumber: page.pageNumber, count });
      }
    });
    return result;
  }, [document.pages, searchQuery]);

  const totalMatches = matchingPages.reduce((acc, curr) => acc + curr.count, 0);

  // Jump to first matching page on query change
  useEffect(() => {
    if (matchingPages.length > 0 && searchQuery.trim().length >= 2) {
      const firstPage = matchingPages[0].pageNumber;
      setCurrentPage(firstPage);
      setTimeout(() => {
        const pageEl = pageRefs.current[firstPage];
        if (pageEl) {
          pageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  }, [searchQuery, matchingPages]);

  const handleNextMatch = () => {
    if (matchingPages.length === 0) return;
    const currentIndex = matchingPages.findIndex((m) => m.pageNumber === currentPage);
    const nextIndex = (currentIndex + 1) % matchingPages.length;
    const nextPage = matchingPages[nextIndex].pageNumber;
    setCurrentPage(nextPage);
    const pageEl = pageRefs.current[nextPage];
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handlePrevMatch = () => {
    if (matchingPages.length === 0) return;
    const currentIndex = matchingPages.findIndex((m) => m.pageNumber === currentPage);
    const prevIndex = (currentIndex - 1 + matchingPages.length) % matchingPages.length;
    const prevPage = matchingPages[prevIndex].pageNumber;
    setCurrentPage(prevPage);
    const pageEl = pageRefs.current[prevPage];
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };


  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-background border-r border-border select-text relative overflow-hidden"
      onMouseUp={handleMouseUp}
    >
      {/* Viewer Header Toolbar */}
      <div className="h-11 bg-card border-b border-border px-3 flex items-center justify-between gap-2 shrink-0 z-20">
        {/* Left: Page Navigator */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded-md hover:bg-secondary disabled:opacity-30 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            title="Previous Page"
          >
            <CaretLeft size={14} />
          </button>

          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-secondary/80 border border-border/60 text-foreground">
            Page {currentPage} of {document.numPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(document.numPages, p + 1))}
            disabled={currentPage >= document.numPages}
            className="p-1 rounded-md hover:bg-secondary disabled:opacity-30 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            title="Next Page"
          >
            <CaretRight size={14} />
          </button>
        </div>

        {/* Middle: Document Title & Search */}
        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-sm mx-2">
          <div className="relative w-full flex items-center">
            <MagnifyingGlass size={13} className="absolute left-2.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search in document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-7 pl-7.5 pr-20 text-xs rounded-md bg-secondary/70 hover:bg-secondary/90 focus:bg-background border border-border/70 focus:border-foreground/30 focus:outline-none transition-all text-foreground placeholder:text-muted-foreground"
            />
            {searchQuery.trim().length >= 2 && (
              <div className="absolute right-1.5 flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                <span className="bg-secondary text-foreground px-1.5 py-0.5 rounded font-medium border border-border/60">
                  {totalMatches} {totalMatches === 1 ? 'match' : 'matches'}
                </span>
                {matchingPages.length > 1 && (
                  <div className="flex items-center">
                    <button
                      onClick={handlePrevMatch}
                      className="p-0.5 hover:text-foreground cursor-pointer"
                      title="Previous match page"
                    >
                      <CaretLeft size={11} />
                    </button>
                    <button
                      onClick={handleNextMatch}
                      className="p-0.5 hover:text-foreground cursor-pointer"
                      title="Next match page"
                    >
                      <CaretRight size={11} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Zoom & Raw PDF link */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-secondary/80 rounded-md border border-border/70 p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
              className="p-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Zoom Out"
            >
              <ArrowsIn size={13} />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-foreground font-medium">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="p-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Zoom In"
            >
              <ArrowsOut size={13} />
            </button>
          </div>

          {document.fileUrl && (
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Open raw PDF in new tab"
            >
              <ArrowSquareOut size={14} />
            </a>
          )}

          {onRequestDelete && document.id !== 'doc-apex-emp-v1' && document.id !== 'doc-apex-emp-v2' && (
            <button
              onClick={() => onRequestDelete(document)}
              className="h-7 px-2 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 border border-border/70 flex items-center gap-1 text-xs transition-colors cursor-pointer"
              title={`Delete uploaded contract "${document.title}"`}
            >
              <TrashSimple size={13} weight="bold" />
              <span className="hidden sm:inline text-[11px] font-medium">Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Citation Target Badge (when active) */}
      {activeCitation && (
        <div className="bg-secondary/90 backdrop-blur-md border-b border-border/80 px-4 py-1.5 text-xs text-foreground flex items-center justify-between gap-2 z-10 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="font-semibold text-[11px] tracking-tight">
              Grounded Citation:
            </span>
            <span className="font-mono text-muted-foreground truncate">
              {activeCitation.sectionNumber} (Page {activeCitation.pageNumber})
            </span>
          </div>
          <span className="text-[10px] bg-card border border-border/80 text-foreground px-2 py-0.5 rounded-full font-mono shrink-0">
            Source Grounded
          </span>
        </div>
      )}

      {/* Selection Tooltip Action */}
      {selectedText && selectionCoord && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-2 bg-foreground text-background text-xs rounded-lg px-3 py-1.5 shadow-xl flex items-center gap-1.5 cursor-pointer animate-in fade-in"
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
              className={`bg-card text-card-foreground rounded-lg shadow-xs border transition-all duration-200 relative flex flex-col ${
                isCitedPage
                  ? 'border-amber-500/50 ring-1 ring-amber-500/30'
                  : 'border-border/80'
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
          className="font-sans font-semibold text-xs tracking-wider text-foreground border-b border-border/60 pb-1.5 pt-3 uppercase"
        >
          {highlightText(para.trim(), searchQuery)}
        </h3>
      );
    }

    // Regular legal clause paragraph
    return (
      <div
        key={idx}
        className={`relative p-2.5 rounded-lg transition-all duration-200 ${
          isCitationTarget
            ? 'citation-highlight-pulse bg-amber-400/15 dark:bg-amber-400/10 border-l-2 border-amber-500 my-2 shadow-2xs'
            : 'hover:bg-secondary/40'
        }`}
      >
        {isCitationTarget && (
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-sans font-semibold tracking-wide text-amber-800 dark:text-amber-300">
            <Sparkle size={11} weight="fill" className="text-amber-500" />
            <span>VERIFIED CITATION · {activeCitation?.sectionNumber}</span>
          </div>
        )}

        <p className="text-[13px] leading-relaxed text-foreground/90">
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
