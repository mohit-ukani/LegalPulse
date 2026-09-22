import { NextRequest, NextResponse } from 'next/server';
import { executeQuickAction } from '@/lib/gemini-client';
import { LegalDocument, QuickActionId } from '@/lib/types';
import { SAMPLE_DOC_A, SAMPLE_DOC_B } from '@/lib/sample-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actionId, documentId, customDoc } = body;

    if (!actionId) {
      return NextResponse.json({ error: 'actionId is required' }, { status: 400 });
    }

    let doc: LegalDocument = SAMPLE_DOC_A;
    if (customDoc) {
      doc = customDoc;
    } else if (documentId === SAMPLE_DOC_B.id) {
      doc = SAMPLE_DOC_B;
    } else if (documentId === SAMPLE_DOC_A.id) {
      doc = SAMPLE_DOC_A;
    }

    const result = executeQuickAction(actionId as QuickActionId, doc);

    return NextResponse.json({
      success: true,
      result,
      documentId: doc.id,
      documentTitle: doc.title,
    });
  } catch (error: unknown) {
    console.error('API /api/quick-action error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Action failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
