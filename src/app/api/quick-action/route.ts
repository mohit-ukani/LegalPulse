import { NextRequest, NextResponse } from 'next/server';
import { executeQuickAction } from '@/lib/gemini-client';
import { LegalDocument, QuickActionId, ChallengePersona } from '@/lib/types';
import { SAMPLE_DOC_A, SAMPLE_DOC_B, SAMPLE_DOC_C, SAMPLE_DOC_D } from '@/lib/sample-data';
import { queryRateLimiter } from '@/lib/security';
import { analysisCache, generateCacheKey } from '@/lib/cache';

const VALID_ACTION_IDS: QuickActionId[] = [
  'notice_period',
  'non_compete',
  'compensation',
  'termination',
  'bond_terms',
  'ip_rights',
  'confidentiality',
  'governing_law',
  'indemnification',
  'liability_cap',
  'payment_terms',
  'service_level',
  'ip_warranty',
];

export async function POST(req: NextRequest) {
  try {
    // 1. Sliding-Window Rate Limiting
    const clientIp = req.headers.get('x-forwarded-for') || 'local-client';
    const rateCheck = queryRateLimiter.check(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a moment before sending another query.',
          retryAfterMs: rateCheck.resetInMs,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { actionId, documentId, customDoc, apiKey, persona } = body;

    if (!actionId) {
      return NextResponse.json({ error: 'actionId is required' }, { status: 400 });
    }

    if (!VALID_ACTION_IDS.includes(actionId as QuickActionId)) {
      return NextResponse.json(
        { error: `Invalid actionId "${actionId}". Valid actions: ${VALID_ACTION_IDS.join(', ')}` },
        { status: 400 }
      );
    }

    let doc: LegalDocument = SAMPLE_DOC_A;
    if (customDoc) {
      doc = customDoc;
    } else if (documentId === SAMPLE_DOC_B.id) {
      doc = SAMPLE_DOC_B;
    } else if (documentId === SAMPLE_DOC_C.id) {
      doc = SAMPLE_DOC_C;
    } else if (documentId === SAMPLE_DOC_D.id) {
      doc = SAMPLE_DOC_D;
    } else if (documentId === SAMPLE_DOC_A.id) {
      doc = SAMPLE_DOC_A;
    }

    const activePersona: ChallengePersona = persona || doc.persona || 'professional';

    // 2. Efficiency Cache Lookup
    const cacheKey = generateCacheKey('quick-action', {
      actionId,
      docId: doc.id,
      persona: activePersona,
      pagesCount: doc.pages?.length || 0,
    });

    const cached = analysisCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true,
      });
    }

    const result = executeQuickAction(actionId as QuickActionId, doc, activePersona);

    const responsePayload = {
      success: true,
      result,
      documentId: doc.id,
      documentTitle: doc.title,
      cached: false,
      modelUsed:
        process.env.GEMINI_API_KEY || apiKey
          ? 'Gemini 3.8 Flash (Grounded)'
          : 'LegalPulse Grounded Neural RAG',
    };

    analysisCache.set(cacheKey, responsePayload);

    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    console.error('API /api/quick-action error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Action failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
