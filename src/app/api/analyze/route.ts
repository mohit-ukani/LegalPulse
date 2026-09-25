import { NextRequest, NextResponse } from 'next/server';
import { queryDocumentWithGemini } from '@/lib/gemini-client';
import { LegalDocument } from '@/lib/types';
import { SAMPLE_DOC_A, SAMPLE_DOC_B } from '@/lib/sample-data';
import {
  queryRateLimiter,
  detectPromptInjection,
  sanitizeLegalInput,
} from '@/lib/security';
import { analysisCache, generateCacheKey } from '@/lib/cache';

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
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(rateCheck.resetInMs / 1000)) },
        }
      );
    }

    const body = await req.json();
    const { query: rawQuery, documentId, customDoc, apiKey } = body;

    // 2. Input Sanitization & Boundary Enforcement
    const query = sanitizeLegalInput(rawQuery, 2000);
    if (!query) {
      return NextResponse.json(
        { error: 'Valid query text is required' },
        { status: 400 }
      );
    }

    // 3. Prompt Injection Defense
    const injectionCheck = detectPromptInjection(query);
    if (!injectionCheck.isSafe) {
      return NextResponse.json(
        {
          error: 'Prompt rejected: Security policy prohibits instructions that attempt to alter system boundaries or override legal constraints.',
          threatDetected: injectionCheck.threatDetected,
        },
        { status: 400 }
      );
    }

    // 4. Resolve Target Document
    let doc: LegalDocument = SAMPLE_DOC_A;
    if (customDoc) {
      doc = customDoc;
    } else if (documentId === SAMPLE_DOC_B.id) {
      doc = SAMPLE_DOC_B;
    } else if (documentId === SAMPLE_DOC_A.id) {
      doc = SAMPLE_DOC_A;
    }

    // 5. In-Memory Cache Lookup (Efficiency Engine)
    const cacheKey = generateCacheKey('analyze', {
      docId: doc.id,
      docPages: doc.pages?.length || 0,
      query: query.toLowerCase().trim(),
    });

    const cachedResult = analysisCache.get(cacheKey);
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
        cacheStats: analysisCache.getStats(),
      });
    }

    // 6. Execute Grounded Neural Analysis
    const result = await queryDocumentWithGemini(query, doc, apiKey);

    const responsePayload = {
      success: true,
      query,
      documentId: doc.id,
      documentTitle: doc.title,
      answer: result.answer,
      citations: result.citations,
      suggestedQuestions: result.suggestedQuestions,
      isMissingInfo: result.isMissingInfo,
      cached: false,
      modelUsed:
        process.env.GEMINI_API_KEY || apiKey
          ? 'Gemini 3.8 Flash (Grounded)'
          : 'LegalPulse Grounded Neural RAG',
    };

    // Store in cache for future instant responses
    analysisCache.set(cacheKey, responsePayload);

    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    console.error('API /api/analyze error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
