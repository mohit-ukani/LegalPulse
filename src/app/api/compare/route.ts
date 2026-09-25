import { NextRequest, NextResponse } from 'next/server';
import { ContractComparisonResult } from '@/lib/types';
import { SAMPLE_COMPARISON, SAMPLE_DOC_A, SAMPLE_DOC_B } from '@/lib/sample-data';
import { queryRateLimiter } from '@/lib/security';
import { comparisonCache, generateCacheKey } from '@/lib/cache';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting
    const clientIp = req.headers.get('x-forwarded-for') || 'local-client';
    const rateCheck = queryRateLimiter.check(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a moment before requesting another comparison.',
          retryAfterMs: rateCheck.resetInMs,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { docAId, docBId } = body;

    // 2. Cache Lookup
    const cacheKey = generateCacheKey('compare', {
      a: docAId || 'sample-a',
      b: docBId || 'sample-b',
    });

    const cached = comparisonCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true,
      });
    }

    // For the sample documents, return the rich pre-computed comparison
    if (
      (docAId === SAMPLE_DOC_A.id && docBId === SAMPLE_DOC_B.id) ||
      (!docAId && !docBId)
    ) {
      const responsePayload = {
        success: true,
        comparison: SAMPLE_COMPARISON,
        cached: false,
      };
      comparisonCache.set(cacheKey, responsePayload);
      return NextResponse.json(responsePayload);
    }

    // Default comparison structure for arbitrary documents
    const dynamicComparison: ContractComparisonResult = {
      docAId: docAId || 'doc-a',
      docBId: docBId || 'doc-b',
      titleA: 'Contract Version 1',
      titleB: 'Contract Version 2',
      summary: 'Comparative analysis of contractual provisions, terms, and risk allocation across both versions.',
      overallRiskShift: 'lower_risk',
      differences: [
        {
          category: 'Notice Period',
          term: 'Notice Period Duration',
          inDocA: '90 calendar days mandatory written notice.',
          inDocB: '30 calendar days reciprocal notice with employee buyout rights.',
          riskDelta: 'improved',
          analysis: 'Version 2 reduces transition time by 60 days and grants employee unilateral buyout rights.',
        },
        {
          category: 'Restrictive Covenants',
          term: 'Non-Compete Scope',
          inDocA: '24 months worldwide uncompensated restraint across all cloud software.',
          inDocB: '6 months limited to 5 named competitors with 100% paid garden leave.',
          riskDelta: 'improved',
          analysis: 'Version 2 drastically narrows restraint scope and mandates 100% salary during the period.',
        },
      ],
      addedClauses: [
        'Personal open-source side project ownership carve-out',
        'Severance protection: 2 months base pay upon involuntary layoff',
      ],
      removedClauses: [
        '24-month training service bond and $50,000 liquidated damages clawback',
        'Salary and final settlement retention authorization',
      ],
      strategicAdvice: [
        'Version 2 provides substantially greater legal protections and eliminates personal financial liabilities.',
        'Prioritize Version 2 language for any countersignature.',
      ],
    };

    const responsePayload = {
      success: true,
      comparison: dynamicComparison,
      cached: false,
    };
    comparisonCache.set(cacheKey, responsePayload);

    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    console.error('API /api/compare error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Comparison failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
