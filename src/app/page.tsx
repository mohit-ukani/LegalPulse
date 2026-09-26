'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle } from '@phosphor-icons/react';
import { LegalDocument, Citation, ChallengePersona } from '@/lib/types';
import {
  BENCHMARK_DOCUMENTS,
  SAMPLE_DOC_A,
  SAMPLE_DOC_B,
  SAMPLE_DOC_C,
  SAMPLE_DOC_D,
} from '@/lib/sample-data';
import { Navbar } from '@/components/layout/Navbar';
import { LegalDisclaimerBanner } from '@/components/ui/LegalDisclaimerBanner';
import { InteractivePdfViewer } from '@/components/viewer/InteractivePdfViewer';
import { AnalysisWorkspace } from '@/components/analysis/AnalysisWorkspace';
import { ComparisonWorkspace } from '@/components/comparison/ComparisonWorkspace';
import { UploadModal } from '@/components/modals/UploadModal';
import { ApiKeyModal } from '@/components/modals/ApiKeyModal';
import { ExportReportModal } from '@/components/modals/ExportReportModal';
import { DeleteDocumentModal } from '@/components/modals/DeleteDocumentModal';
import { DocumentSidebar } from '@/components/layout/DocumentSidebar';
import { EmptyWorkspace } from '@/components/ui/EmptyWorkspace';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const BENCHMARK_IDS = new Set(BENCHMARK_DOCUMENTS.map((d) => d.id));
const isCustomDoc = (d: LegalDocument) => !BENCHMARK_IDS.has(d.id);

export default function Home() {
  const [documents, setDocuments] = useState<LegalDocument[]>(BENCHMARK_DOCUMENTS);
  const [currentDocId, setCurrentDocId] = useState<string>(SAMPLE_DOC_A.id);
  const [activePersona, setActivePersona] = useState<ChallengePersona>('professional');
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [activeMode, setActiveMode] = useState<'workstation' | 'comparison'>('workstation');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<LegalDocument | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [chatPromptTrigger, setChatPromptTrigger] = useState<{ text: string; timestamp: number } | null>(null);

  // Load API key, custom uploaded documents, sidebar preference, and persona from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('legalpulse_gemini_key') || '';
      setApiKey(savedKey);

      const savedSidebar = localStorage.getItem('legalpulse_sidebar_open');
      if (savedSidebar !== null) {
        setSidebarOpen(savedSidebar === 'true');
      } else {
        setSidebarOpen(window.innerWidth >= 1200);
      }

      const savedPersona = localStorage.getItem('legalpulse_active_persona') as ChallengePersona | null;
      if (savedPersona === 'professional' || savedPersona === 'business') {
        setActivePersona(savedPersona);
      }

      try {
        const savedCustomDocs = localStorage.getItem('legalpulse_custom_docs');
        if (savedCustomDocs) {
          const parsed = JSON.parse(savedCustomDocs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDocuments([...BENCHMARK_DOCUMENTS, ...parsed]);
          }
        }
      } catch (e) {
        console.warn('Failed to load custom docs from localStorage', e);
      }
    }
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const currentDoc = documents.find((d) => d.id === currentDocId) || documents[0] || null;

  // Dynamic document title update based on mode and active document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (activeMode === 'comparison') {
        document.title = 'Contract Diff & Risk Delta | LegalPulse';
      } else if (currentDoc) {
        const shortTitle = currentDoc.title?.split('—')[0]?.trim() || 'Document';
        document.title = `${shortTitle} | LegalPulse AI Studio`;
      } else {
        document.title = 'LegalPulse Studio — No Documents Open';
      }
    }
  }, [activeMode, currentDoc]);

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    if (typeof window !== 'undefined') {
      localStorage.setItem('legalpulse_gemini_key', newKey);
    }
  };

  const handleSelectDoc = (id: string) => {
    setCurrentDocId(id);
    setActiveCitation(null);

    // Context switching: auto-align persona with benchmark contract type
    if (id === SAMPLE_DOC_C.id || id === SAMPLE_DOC_D.id) {
      setActivePersona('business');
      if (typeof window !== 'undefined') {
        localStorage.setItem('legalpulse_active_persona', 'business');
      }
    } else if (id === SAMPLE_DOC_A.id || id === SAMPLE_DOC_B.id) {
      setActivePersona('professional');
      if (typeof window !== 'undefined') {
        localStorage.setItem('legalpulse_active_persona', 'professional');
      }
    }
  };

  const handleSelectPersona = (newPersona: ChallengePersona) => {
    setActivePersona(newPersona);
    if (typeof window !== 'undefined') {
      localStorage.setItem('legalpulse_active_persona', newPersona);
    }

    // If currently viewing a benchmark contract from another persona, switch to the active persona's default doc
    if (newPersona === 'business' && (currentDocId === SAMPLE_DOC_A.id || currentDocId === SAMPLE_DOC_B.id)) {
      setCurrentDocId(SAMPLE_DOC_C.id);
      setActiveCitation(null);
      showToast('Switched to Business Persona: Enterprise MSA');
    } else if (newPersona === 'professional' && (currentDocId === SAMPLE_DOC_C.id || currentDocId === SAMPLE_DOC_D.id)) {
      setCurrentDocId(SAMPLE_DOC_A.id);
      setActiveCitation(null);
      showToast('Switched to Professional Persona: Employment Agreement');
    } else {
      showToast(newPersona === 'business' ? 'Active Focus: Enterprise Commercial B2B' : 'Active Focus: Individual Professional & Employee');
    }
  };

  const handleDocumentLoaded = (newDoc: LegalDocument) => {
    setDocuments((prev) => {
      const exists = prev.some((d) => d.id === newDoc.id);
      const updated = exists ? prev.map((d) => (d.id === newDoc.id ? newDoc : d)) : [newDoc, ...prev];
      if (typeof window !== 'undefined') {
        try {
          const customDocs = updated.filter(isCustomDoc);
          localStorage.setItem('legalpulse_custom_docs', JSON.stringify(customDocs));
        } catch (e) {
          console.warn('Failed to save custom doc to localStorage', e);
        }
      }
      return updated;
    });
    setCurrentDocId(newDoc.id);
    setActiveCitation(null);
    showToast(`Loaded "${newDoc.title.split('—')[0].trim()}"`);
  };

  const handleDeleteDocument = (docIdToDelete: string) => {
    const docToDeleteItem = documents.find((d) => d.id === docIdToDelete);
    const docName = docToDeleteItem ? docToDeleteItem.title.split('—')[0].trim() : 'Document';

    setDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== docIdToDelete);
      if (typeof window !== 'undefined') {
        try {
          const customDocs = updated.filter(isCustomDoc);
          localStorage.setItem('legalpulse_custom_docs', JSON.stringify(customDocs));
        } catch (e) {
          console.warn('Failed to update localStorage after doc deletion', e);
        }
      }
      return updated;
    });

    const remainingDocs = documents.filter((d) => d.id !== docIdToDelete);
    if (currentDocId === docIdToDelete) {
      if (remainingDocs.length > 0) {
        setCurrentDocId(remainingDocs[0].id);
      } else {
        setCurrentDocId(activePersona === 'business' ? SAMPLE_DOC_C.id : SAMPLE_DOC_A.id);
      }
      setActiveCitation(null);
    }

    showToast(`Deleted "${docName}" from session`);
  };

  const handleResetSamples = () => {
    setDocuments((prev) => {
      const customDocs = prev.filter(isCustomDoc);
      return [...BENCHMARK_DOCUMENTS, ...customDocs];
    });
    setCurrentDocId(activePersona === 'business' ? SAMPLE_DOC_C.id : SAMPLE_DOC_A.id);
    setActiveCitation(null);
    showToast('Restored all 4 benchmark contracts (Professional & Business)');
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('legalpulse_sidebar_open', String(next));
      }
      return next;
    });
  };

  const handleCitationClick = React.useCallback((citation: Citation) => {
    setActiveCitation((prev) => {
      if (
        prev &&
        prev.pageNumber === citation.pageNumber &&
        prev.sectionNumber === citation.sectionNumber &&
        prev.clauseId === citation.clauseId
      ) {
        return prev;
      }
      return citation;
    });
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        {/* Document & Chats Sidebar (ChatGPT & Gemini Style) */}
        <DocumentSidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          documents={documents}
          currentDocId={currentDocId}
          onSelectDoc={handleSelectDoc}
          onRequestDeleteDoc={(doc) => setDocToDelete(doc)}
          onOpenUpload={() => setUploadModalOpen(true)}
          onOpenSettings={() => setApiKeyModalOpen(true)}
          onResetSamples={handleResetSamples}
          apiKeySet={Boolean(apiKey)}
          activePersona={activePersona}
          onSelectPersona={handleSelectPersona}
        />

        {/* Main Workstation Frame */}
        <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          {/* Top Navbar */}
          <Navbar
            currentDoc={currentDoc}
            onSelectDoc={handleSelectDoc}
            availableDocs={documents}
            activeMode={activeMode}
            onSelectMode={setActiveMode}
            onOpenUpload={() => setUploadModalOpen(true)}
            onOpenSettings={() => setApiKeyModalOpen(true)}
            onOpenExport={() => setExportModalOpen(true)}
            onRequestDeleteDoc={(doc) => setDocToDelete(doc)}
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={sidebarOpen}
            apiKeySet={Boolean(apiKey)}
            activePersona={activePersona}
            onSelectPersona={handleSelectPersona}
          />

          {/* Legal Assistance Disclaimer Banner */}
          <LegalDisclaimerBanner activePersona={activePersona} />

          {/* Main Content Area */}
          <main className="flex-1 overflow-hidden">
            {activeMode === 'comparison' ? (
              /* Mode 2: Contract-vs-Contract Comparison View */
              <ComparisonWorkspace
                onBackToWorkstation={() => setActiveMode('workstation')}
                onSelectDoc={(id) => {
                  handleSelectDoc(id);
                  setActiveMode('workstation');
                }}
                apiKey={apiKey}
              />
            ) : !currentDoc ? (
              /* Zero-Document Clean Empty State */
              <EmptyWorkspace
                onOpenUpload={() => setUploadModalOpen(true)}
                onRestoreSamples={handleResetSamples}
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
                    onRequestDelete={(doc) => setDocToDelete(doc)}
                    onAskAboutText={(selectedText) => {
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
                    activePersona={activePersona}
                  />
                </section>
              </div>
            )}
          </main>
        </div>

        {/* Upload Modal with Uploaded Documents Management */}
        <UploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onDocumentLoaded={handleDocumentLoaded}
          uploadedDocs={documents.filter(isCustomDoc)}
          onDeleteDocument={(doc) => setDocToDelete(doc)}
          onSelectDocument={(id) => {
            handleSelectDoc(id);
          }}
        />

        {/* Delete Document Confirmation Modal */}
        <DeleteDocumentModal
          isOpen={Boolean(docToDelete)}
          document={docToDelete}
          onClose={() => setDocToDelete(null)}
          onConfirmDelete={handleDeleteDocument}
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

        {/* Subtle Minimalist Toast Notification */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-foreground text-background px-3.5 py-2 rounded-xl shadow-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2 border border-border/20"
          >
            <CheckCircle size={15} weight="fill" className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
