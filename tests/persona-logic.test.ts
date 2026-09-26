import { describe, it, expect } from 'vitest';
import {
  runDeterministicGroundedSearch,
  executeQuickAction,
} from '../src/lib/gemini-client';
import {
  PERSONA_CONFIGS,
  SAMPLE_DOC_A,
  SAMPLE_DOC_B,
  SAMPLE_DOC_C,
  SAMPLE_DOC_D,
  SAMPLE_RISK_REPORT_A,
  SAMPLE_RISK_REPORT_C,
  SAMPLE_COMPARISON_BUSINESS,
  QUICK_ACTIONS,
  BENCHMARK_DOCUMENTS,
} from '../src/lib/sample-data';
import { ChallengePersona, QuickActionId } from '../src/lib/types';

describe('Challenge Vertical: Legal Assistance for All Professionals and Businesses', () => {
  describe('Persona Configuration & Context Grounding', () => {
    it('should define robust configurations for both Professional and Business personas', () => {
      expect(PERSONA_CONFIGS.professional).toBeDefined();
      expect(PERSONA_CONFIGS.business).toBeDefined();

      // Professional Persona verification
      expect(PERSONA_CONFIGS.professional.id).toBe('professional');
      expect(PERSONA_CONFIGS.professional.label).toContain('Professional');
      expect(PERSONA_CONFIGS.professional.statutoryFramework).toContain('California Labor Code');
      expect(PERSONA_CONFIGS.professional.keyRiskPriorities.length).toBeGreaterThanOrEqual(4);

      // Business Persona verification
      expect(PERSONA_CONFIGS.business.id).toBe('business');
      expect(PERSONA_CONFIGS.business.label).toContain('Business');
      expect(PERSONA_CONFIGS.business.statutoryFramework).toContain('Uniform Commercial Code');
      expect(PERSONA_CONFIGS.business.keyRiskPriorities.length).toBeGreaterThanOrEqual(4);
    });

    it('should provide benchmark documents for both challenge personas', () => {
      expect(BENCHMARK_DOCUMENTS.length).toBe(4);

      const professionalDocs = BENCHMARK_DOCUMENTS.filter(
        (d) => d.persona === 'professional'
      );
      const businessDocs = BENCHMARK_DOCUMENTS.filter(
        (d) => d.persona === 'business'
      );

      expect(professionalDocs.length).toBe(2);
      expect(businessDocs.length).toBe(2);
      expect(SAMPLE_DOC_C.documentType).toBe('vendor');
      expect(SAMPLE_DOC_D.documentType).toBe('vendor');
    });

    it('should tag quick action workflows with targeted persona alignment', () => {
      const profActions = QUICK_ACTIONS.filter(
        (a) => a.targetPersona === 'professional' || a.targetPersona === 'both'
      );
      const bizActions = QUICK_ACTIONS.filter(
        (a) => a.targetPersona === 'business' || a.targetPersona === 'both'
      );

      expect(profActions.some((a) => a.id === 'notice_period')).toBe(true);
      expect(profActions.some((a) => a.id === 'non_compete')).toBe(true);
      expect(profActions.some((a) => a.id === 'bond_terms')).toBe(true);

      expect(bizActions.some((a) => a.id === 'liability_cap')).toBe(true);
      expect(bizActions.some((a) => a.id === 'payment_terms')).toBe(true);
      expect(bizActions.some((a) => a.id === 'service_level')).toBe(true);
      expect(bizActions.some((a) => a.id === 'ip_warranty')).toBe(true);
    });
  });

  describe('Business Persona Logic & Risk Evaluation (Enterprise MSA)', () => {
    it('should flag uncapped consequential damages as high risk in Sample C', () => {
      const result = executeQuickAction('liability_cap', SAMPLE_DOC_C, 'business');

      expect(result.status).toBe('found');
      expect(result.riskRating).toBe('high');
      expect(result.plainEnglishSummary).toContain('uncapped consequential damages');
      expect(result.citations.length).toBeGreaterThan(0);
      expect(result.citations[0].sectionNumber).toContain('Section 6');
      expect(result.actionableNextSteps.length).toBeGreaterThan(0);
    });

    it('should confirm mutual 12-month liability cap as low risk in Sample D', () => {
      const result = executeQuickAction('liability_cap', SAMPLE_DOC_D, 'business');

      expect(result.status).toBe('found');
      expect(result.riskRating).toBe('low');
      expect(result.plainEnglishSummary.toLowerCase()).toMatch(/mutual waiver|12 months/);
      expect(result.citations[0].quote).toContain('12 MONTHS');
    });

    it('should detect Net 90 payment cycle and unilateral fee withholding in Sample C', () => {
      const result = executeQuickAction('payment_terms', SAMPLE_DOC_C, 'business');

      expect(result.riskRating).toBe('high');
      expect(result.plainEnglishSummary).toContain('Net 90');
      expect(result.citations.some((c) => c.sectionNumber.includes('Section 2'))).toBe(true);
    });

    it('should validate Net 30 payment terms and 15-day dispute window in Sample D', () => {
      const result = executeQuickAction('payment_terms', SAMPLE_DOC_D, 'business');

      expect(result.riskRating).toBe('low');
      expect(result.plainEnglishSummary).toContain('Net 30');
      expect(result.citations[0].quote).toContain('thirty (30) days');
    });

    it('should detect disproportionate 50% SLA penalty in Sample C', () => {
      const result = executeQuickAction('service_level', SAMPLE_DOC_C, 'business');

      expect(result.riskRating).toBe('high');
      expect(result.plainEnglishSummary).toContain('50%');
      expect(result.citations[0].sectionNumber).toContain('Section 7');
    });

    it('should validate tiered SLA credits as exclusive remedy in Sample D', () => {
      const result = executeQuickAction('service_level', SAMPLE_DOC_D, 'business');

      expect(result.riskRating).toBe('low');
      expect(result.plainEnglishSummary).toContain('tiered service credits');
    });

    it('should identify unilateral uncapped indemnification in Sample C', () => {
      const result = executeQuickAction('indemnification', SAMPLE_DOC_C, 'business');

      expect(result.riskRating).toBe('high');
      expect(result.title).toContain('Unilateral');
      expect(result.plainEnglishSummary.toLowerCase()).toContain('indemnify');
      expect(result.citations[0].quote).toContain('indemnify, and hold harmless');
    });

    it('should identify mutual IP indemnification in Sample D', () => {
      const result = executeQuickAction('indemnification', SAMPLE_DOC_D, 'business');

      expect(result.riskRating).toBe('low');
      expect(result.plainEnglishSummary.toLowerCase()).toContain('bilateral indemnity');
    });

    it('should detect Background IP forfeiture in Sample C and retention in Sample D', () => {
      const resultC = executeQuickAction('ip_warranty', SAMPLE_DOC_C, 'business');
      expect(resultC.riskRating).toBe('high');
      expect(resultC.title).toContain('Background IP');
      expect(resultC.plainEnglishSummary.toLowerCase()).toContain('background');

      const resultD = executeQuickAction('ip_warranty', SAMPLE_DOC_D, 'business');
      expect(resultD.riskRating).toBe('low');
      expect(resultD.title).toContain('Background IP');
      expect(resultD.plainEnglishSummary).toContain('Vendor retains full ownership');
    });
  });

  describe('Contextual Search & Dynamic Q&A Adaptation', () => {
    it('should answer liability queries with exact grounded citations for business agreements', () => {
      const result = runDeterministicGroundedSearch(
        'What is the limitation of liability and are consequential damages waived?',
        SAMPLE_DOC_C,
        'business'
      );

      expect(result.isMissingInfo).toBe(false);
      expect(result.citations.length).toBeGreaterThan(0);
      expect(result.citations[0].quote).toContain('CONSEQUENTIAL DAMAGES');
      expect(result.answer).toContain('consequential damages');
    });

    it('should answer payment terms queries with exact grounded citations for business agreements', () => {
      const result = runDeterministicGroundedSearch(
        'What are the payment terms and invoicing timeline?',
        SAMPLE_DOC_C,
        'business'
      );

      expect(result.isMissingInfo).toBe(false);
      expect(result.citations.length).toBeGreaterThan(0);
      expect(result.answer).toContain('90-day');
    });

    it('should execute business comparison diff showing lower risk in Sample D', () => {
      expect(SAMPLE_COMPARISON_BUSINESS.overallRiskShift).toBe('lower_risk');
      expect(SAMPLE_COMPARISON_BUSINESS.differences.length).toBeGreaterThanOrEqual(4);
      expect(SAMPLE_COMPARISON_BUSINESS.addedClauses.length).toBeGreaterThan(0);
      expect(SAMPLE_COMPARISON_BUSINESS.removedClauses.length).toBeGreaterThan(0);
    });

    it('should generate high risk score for onerous business MSA in Sample Report C', () => {
      expect(SAMPLE_RISK_REPORT_C.overallRisk).toBe('high');
      expect(SAMPLE_RISK_REPORT_C.riskScore).toBeGreaterThanOrEqual(85);
      expect(SAMPLE_RISK_REPORT_C.criticalWarnings.length).toBeGreaterThanOrEqual(4);
      expect(SAMPLE_RISK_REPORT_C.recommendedNegotiations.length).toBeGreaterThanOrEqual(4);
    });
  });
});
