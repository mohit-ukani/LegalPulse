'use client';

import React, { useState, useEffect } from 'react';
import { LegalDocument, Citation } from '@/lib/types';
import { SAMPLE_DOC_A, SAMPLE_DOC_B } from '@/lib/sample-data';
import { Navbar } from '@/components/layout/Navbar';
import { LegalDisclaimerBanner } from '@/components/ui/LegalDisclaimerBanner';
import { InteractivePdfViewer } from '@/components/viewer/InteractivePdfViewer';
import { AnalysisWorkspace } from '@/components/analysis/AnalysisWorkspace';
import { ComparisonWorkspace } from '@/components/comparison/ComparisonWorkspace';
import { UploadModal } from '@/components/modals/UploadModal';
import { ApiKeyModal } from '@/components/modals/ApiKeyModal';
import { ExportReportModal } from '@/components/modals/ExportReportModal';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function Home() {
  const [documents, setDocuments] = useState<LegalDocument[]>([SAMPLE_DOC_A, SAMPLE_DOC_B]);
  const [currentDocId, setCurrentDocId] = useState<string>(SAMPLE_DOC_A.id);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [activeMode, setActiveMode] = useState<'workstation' | 'comparison'>('workstation');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [chatPromptTrigger, setChatPromptTrigger] = useState<{ text: string; timestamp: number } | null>(null);

  // Load API key from localStorage if saved
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('legalpulse_gemini_key') || '';
      setApiKey(savedKey);
    }
  }, []);

  const currentDoc = documents.find((d) => d.id === currentDocId) || documents[0];

  // Dynamic document title update based on mode and active document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (activeMode === 'comparison') {
        document.title = 'Contract Diff & Risk Delta | LegalPulse';
      } else {
        const shortTitle = currentDoc?.title?.split('—')[0]?.trim() || 'Document';
        document.title = `${shortTitle} | LegalPulse AI Workstation`;
      }
    }
  }, [activeMode, currentDoc]);

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    if (typeof window !== 'undefined') {
      localStorage.setItem('legalpulse_gemini_key', newKey);
    }
  };

  const handleDocumentLoaded = (newDoc: LegalDocument) => {
    setDocuments((prev) => {
      const exists = prev.some((d) => d.id === newDoc.id);
      if (exists) return prev.map((d) => (d.id === newDoc.id ? newDoc : d));
      return [newDoc, ...prev];
    });
    setCurrentDocId(newDoc.id);
    setActiveCitation(null);
  };

  const handleCitationClick = (citation: Citation) => {
    setActiveCitation(citation);
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
        {/* Top Navbar */}
        <Navbar
          currentDoc={currentDoc}
          onSelectDoc={(id) => {
            setCurrentDocId(id);
            setActiveCitation(null);
          }}
          availableDocs={documents}
          activeMode={activeMode}
          onSelectMode={setActiveMode}
          onOpenUpload={() => setUploadModalOpen(true)}
          onOpenSettings={() => setApiKeyModalOpen(true)}
          onOpenExport={() => setExportModalOpen(true)}
          apiKeySet={Boolean(apiKey)}
        />

        {/* Legal Assistance Disclaimer Banner */}
        <LegalDisclaimerBanner />

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          {activeMode === 'comparison' ? (
            /* Mode 2: Contract-vs-Contract Comparison View */
            <ComparisonWorkspace
              onBackToWorkstation={() => setActiveMode('workstation')}
              onSelectDoc={(id) => {
                setCurrentDocId(id);
                setActiveMode('workstation');
              }}
              apiKey={apiKey}
            />
          ) : (
            /* Mode 1: Split-Screen Legal Workstation */
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full overflow-hidden">
              {/* Left Panel: Interactive PDF Viewer & Citation Highlighter */}
              <section
                aria-label="PDF Document Viewer"
                className="h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-border"
              >
                <InteractivePdfViewer
                  document={currentDoc}
                  activeCitation={activeCitation}
                  onAskAboutText={(selectedText) => {
                    // Switch to grounded chat and ask about selected passage
                    setChatPromptTrigger({
                      text: `Explain this passage and evaluate legal risks or obligations: "${selectedText}"`,
                      timestamp: Date.now(),
                    });
                  }}
                />
              </section>

              {/* Right Panel: Executive Analysis Workspace */}
              <section
                aria-label="Legal Analysis Workspace"
                className="h-full overflow-hidden bg-card"
              >
                <AnalysisWorkspace
                  document={currentDoc}
                  onCitationClick={handleCitationClick}
                  activeCitation={activeCitation}
                  onSwitchToComparison={() => setActiveMode('comparison')}
                  apiKey={apiKey}
                  externalPrompt={chatPromptTrigger}
                  onOpenExport={() => setExportModalOpen(true)}
                />
              </section>
            </div>
          )}
        </main>

        {/* Upload Modal */}
        <UploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onDocumentLoaded={handleDocumentLoaded}
        />

        {/* Gemini Settings Modal */}
        <ApiKeyModal
          isOpen={apiKeyModalOpen}
          onClose={() => setApiKeyModalOpen(false)}
          apiKey={apiKey}
          onSaveApiKey={handleSaveApiKey}
        />

        {/* Executive Legal Audit Export Modal */}
        <ExportReportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          document={currentDoc}
        />
      </div>
    </ErrorBoundary>
  );
}
