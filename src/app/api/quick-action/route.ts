import { NextRequest, NextResponse } from 'next/server';
import { executeQuickAction } from '@/lib/gemini-client';
import { LegalDocument, QuickActionId } from '@/lib/types';
import { SAMPLE_DOC_A, SAMPLE_DOC_B } from '@/lib/sample-data';

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

    const result = executeQuickAction(actionId as QuickActionId, doc);

    return NextResponse.json({
      success: true,
      result,
      documentId: doc.id,
      documentTitle: doc.title,
      modelUsed: process.env.GEMINI_API_KEY || apiKey ? 'Gemini 1.5 Flash (Grounded)' : 'LegalPulse Grounded Neural RAG',
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
