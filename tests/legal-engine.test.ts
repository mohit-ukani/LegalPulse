import { describe, it, expect } from 'vitest';
import {
  runDeterministicGroundedSearch,
  executeQuickAction,
} from '../src/lib/gemini-client';
import {
  SAMPLE_DOC_A,
  SAMPLE_DOC_B,
  SAMPLE_COMPARISON,
} from '../src/lib/sample-data';
import { QuickActionId } from '../src/lib/types';

describe('Legal Intelligence Engine & Grounded Analysis', () => {
  describe('Document Verification & Indexing', () => {
    it('should have complete page and clause structures in benchmark documents', () => {
      expect(SAMPLE_DOC_A.pages.length).toBeGreaterThan(0);
      expect(SAMPLE_DOC_B.pages.length).toBeGreaterThan(0);

      const allClausesA = SAMPLE_DOC_A.pages.flatMap((p) => p.clauses || []);
      expect(allClausesA.length).toBeGreaterThanOrEqual(10);

      // Verify presence of high-risk clauses in Sample A (Onerous contract)
      const highRisk = allClausesA.filter((c) => c.riskLevel === 'high');
      expect(highRisk.length).toBeGreaterThan(0);
    });
  });

  describe('Grounded Q&A & Visual Citations', () => {
    it('should locate notice period clause and return grounded visual citations with exact page numbers', () => {
      const result = runDeterministicGroundedSearch('What is the notice period for resignation?', SAMPLE_DOC_A);

      expect(result.isMissingInfo).toBe(false);
      expect(result.citations.length).toBeGreaterThan(0);
      expect(result.citations[0].pageNumber).toBe(3);
      expect(result.citations[0].quote).toContain('90');
      expect(result.suggestedQuestions.length).toBeGreaterThan(0);
    });

    it('should identify non-compete clauses and surface severe risk alerts', () => {
      const result = runDeterministicGroundedSearch('What are the restrictions in the non-compete clause?', SAMPLE_DOC_A);

      expect(result.isMissingInfo).toBe(false);
      expect(result.citations.length).toBeGreaterThan(0);
      expect(result.citations.some((c) => c.riskLevel === 'high')).toBe(true);
      expect(result.answer).toContain('non-compete');
    });

    it('should strictly flag missing contractual terms and prevent hallucination', () => {
      const result = runDeterministicGroundedSearch('What is the parental leave policy?', SAMPLE_DOC_A);

      expect(result.isMissingInfo).toBe(true);
      expect(result.citations.length).toBe(0);
      expect(result.answer).toContain('does not contain information regarding');
      expect(result.suggestedQuestions[0]).toContain('HR');
    });

    it('should flag absent maternity/paternity benefits rather than fabricating clauses', () => {
      const result = runDeterministicGroundedSearch('Is maternity leave compensated?', SAMPLE_DOC_A);

      expect(result.isMissingInfo).toBe(true);
      expect(result.citations).toHaveLength(0);
    });
  });

  describe('Guided Legal Workflows (9 Quick Action Chips)', () => {
    const quickActions: QuickActionId[] = [
      'notice_period',
      'non_compete',
      'compensation',
      'termination',
      'bond_terms',
      'ip_rights',
      'confidentiality',
      'governing_law',
      'indemnification',
    ];

    for (const action of quickActions) {
      it(`should successfully execute quick action: ${action}`, () => {
        const result = executeQuickAction(action, SAMPLE_DOC_A);

        expect(result).toBeDefined();
        expect(result.plainEnglishSummary.length).toBeGreaterThan(20);
        expect(result.citations.length).toBeGreaterThan(0);
        expect(['low', 'medium', 'high']).toContain(result.riskRating);
        expect(result.actionableNextSteps.length).toBeGreaterThan(0);
      });
    }

    it('should assign high risk to bond terms and provide next steps', () => {
      const result = executeQuickAction('bond_terms', SAMPLE_DOC_A);

      expect(result.riskRating).toBe('high');
      expect(result.actionableNextSteps.length).toBeGreaterThan(0);
      expect(result.plainEnglishSummary.toLowerCase()).toMatch(/lock-in|liquidated damages|bond/);
    });
  });

  describe('Bilateral Contract Comparison (Diff Engine)', () => {
    it('should calculate risk deltas across contract revisions', () => {
      expect(SAMPLE_COMPARISON.docAId).toBe(SAMPLE_DOC_A.id);
      expect(SAMPLE_COMPARISON.docBId).toBe(SAMPLE_DOC_B.id);
      expect(SAMPLE_COMPARISON.differences.length).toBeGreaterThan(0);

      // Verify that Version 2 reflects lower risk
      expect(SAMPLE_COMPARISON.overallRiskShift).toBe('lower_risk');

      // Check removed liabilities (like service bond)
      expect(SAMPLE_COMPARISON.removedClauses.some((c) => c.toLowerCase().includes('bond'))).toBe(true);

      // Check added protections
      expect(SAMPLE_COMPARISON.addedClauses.length).toBeGreaterThan(0);
    });
  });
});
