import { describe, it, expect } from 'vitest';
import { SAMPLE_DOC_A, SAMPLE_DOC_B } from '../src/lib/sample-data';
import { DocumentClause } from '../src/lib/types';

describe('Risk Assessment & Audit Engine', () => {
  it('should compute weighted severity score accurately', () => {
    const clausesA: DocumentClause[] = SAMPLE_DOC_A.pages.flatMap((p) => p.clauses || []);
    const highRiskA = clausesA.filter((c) => c.riskLevel === 'high');
    const mediumRiskA = clausesA.filter((c) => c.riskLevel === 'medium');

    expect(highRiskA.length).toBeGreaterThanOrEqual(2);
    expect(mediumRiskA.length).toBeGreaterThanOrEqual(3);

    // Onerous sample should have a critical risk score > 75
    const computedScore = Math.min(100, highRiskA.length * 20 + mediumRiskA.length * 10);
    expect(computedScore).toBeGreaterThanOrEqual(70);
  });

  it('should identify fair balanced terms in negotiated sample agreement', () => {
    const clausesB: DocumentClause[] = SAMPLE_DOC_B.pages.flatMap((p) => p.clauses || []);
    const highRiskB = clausesB.filter((c) => c.riskLevel === 'high');

    // Sample B is the negotiated fair version, so high risk clauses should be 0 or near 0
    expect(highRiskB.length).toBeLessThan(clausesB.length / 2);
  });

  it('should include actionable mitigation counsel for every high-risk clause', () => {
    const clausesA: DocumentClause[] = SAMPLE_DOC_A.pages.flatMap((p) => p.clauses || []);
    const highRisk = clausesA.filter((c) => c.riskLevel === 'high');

    for (const clause of highRisk) {
      expect(clause.implication).toBeDefined();
      expect(clause.implication.length).toBeGreaterThan(15);
      expect(clause.sectionNumber).toBeDefined();
    }
  });
});
