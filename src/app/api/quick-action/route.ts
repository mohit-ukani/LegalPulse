import { NextRequest, NextResponse } from 'next/server';
import { executeQuickAction } from '@/lib/gemini-client';
import { LegalDocument, QuickActionId } from '@/lib/types';
import { SAMPLE_DOC_A, SAMPLE_DOC_B } from '@/lib/sample-data';
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
    const { actionId, documentId, customDoc, apiKey } = body;

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
    } else if (documentId === SAMPLE_DOC_A.id) {
      doc = SAMPLE_DOC_A;
    }

    // 2. Efficiency Cache Lookup
    const cacheKey = generateCacheKey('quick-action', {
      actionId,
      docId: doc.id,
      pagesCount: doc.pages?.length || 0,
    });

    const cached = analysisCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true,
      });
    }

    const result = executeQuickAction(actionId as QuickActionId, doc);

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
