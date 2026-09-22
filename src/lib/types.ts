export type RiskLevel = 'low' | 'medium' | 'high';

export interface DocumentClause {
  id: string;
  pageNumber: number;
  sectionNumber: string;
  title: string;
  content: string;
  riskLevel: RiskLevel;
  category: string;
  implication: string;
}

export interface DocumentPage {
  pageNumber: number;
  text: string;
  clauses: DocumentClause[];
}

export interface LegalDocument {
  id: string;
  title: string;
  filename: string;
  fileUrl?: string;
  numPages: number;
  uploadedAt: string;
  documentType: 'employment' | 'vendor' | 'terms' | 'nda' | 'consulting' | 'general';
  parties: string[];
  effectiveDate?: string;
  jurisdiction?: string;
  summary?: string;
  pages: DocumentPage[];
}

export interface Citation {
  id?: string;
  clauseId?: string;
  pageNumber: number;
  sectionNumber: string;
  clauseTitle?: string;
  quote: string;
  relevanceExplanation: string;
  riskLevel?: RiskLevel;
}

export type QuickActionId =
  | 'notice_period'
  | 'non_compete'
  | 'compensation'
  | 'termination'
  | 'bond_terms'
  | 'ip_rights'
  | 'confidentiality'
  | 'governing_law'
  | 'indemnification';

export interface QuickActionItem {
  id: QuickActionId;
  label: string;
  iconName: string;
  description: string;
  defaultPrompt: string;
}

export interface QuickActionResult {
  actionId: QuickActionId;
  title: string;
  status: 'found' | 'not_found' | 'partial';
  plainEnglishSummary: string;
  legalImplications: string;
  riskRating: RiskLevel;
  citations: Citation[];
  suggestedLegalQuestions: string[];
  actionableNextSteps: string[];
}

export interface RiskAnalysisReport {
  overallRisk: RiskLevel;
  riskScore: number; // 0 to 100
  executiveVerdict: string;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  clauses: DocumentClause[];
  criticalWarnings: string[];
  recommendedNegotiations: string[];
}

export interface ContractDifference {
  category: string;
  term: string;
  inDocA: string;
  inDocB: string;
  riskDelta: 'improved' | 'worsened' | 'neutral';
  analysis: string;
  citationA?: Citation;
  citationB?: Citation;
}

export interface ContractComparisonResult {
  docAId: string;
  docBId: string;
  titleA: string;
  titleB: string;
  summary: string;
  differences: ContractDifference[];
  addedClauses: string[];
  removedClauses: string[];
  overallRiskShift: 'lower_risk' | 'higher_risk' | 'comparable';
  strategicAdvice: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  citations?: Citation[];
  suggestedQuestions?: string[];
  isMissingInfoNotice?: boolean;
}
