import { NextRequest, NextResponse } from 'next/server';
import { queryDocumentWithGemini } from '@/lib/gemini-client';
import { LegalDocument } from '@/lib/types';
import { SAMPLE_DOC_A, SAMPLE_DOC_B } from '@/lib/sample-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, documentId, customDoc, apiKey } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Resolve document
    let doc: LegalDocument = SAMPLE_DOC_A;
    if (customDoc) {
      doc = customDoc;
    } else if (documentId === SAMPLE_DOC_B.id) {
      doc = SAMPLE_DOC_B;
    } else if (documentId === SAMPLE_DOC_A.id) {
      doc = SAMPLE_DOC_A;
    }

    const result = await queryDocumentWithGemini(query, doc, apiKey);

    return NextResponse.json({
      success: true,
      query,
      documentId: doc.id,
      documentTitle: doc.title,
      answer: result.answer,
      citations: result.citations,
      suggestedQuestions: result.suggestedQuestions,
      isMissingInfo: result.isMissingInfo,
      modelUsed: process.env.GEMINI_API_KEY || apiKey ? 'Gemini 1.5 Flash (Grounded)' : 'LegalPulse Grounded Neural RAG',
    });
  } catch (error: unknown) {
    console.error('API /api/analyze error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
