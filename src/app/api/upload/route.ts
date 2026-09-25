import { NextRequest, NextResponse } from 'next/server';
import { DocumentClause, DocumentPage, LegalDocument } from '@/lib/types';
import { uploadRateLimiter, verifyPdfMagicBytes, sanitizeFileName } from '@/lib/security';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB limit

export async function POST(req: NextRequest) {
  try {
    // 1. Upload Rate Limiting
    const clientIp = req.headers.get('x-forwarded-for') || 'local-client';
    const rateCheck = uploadRateLimiter.check(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Upload rate limit exceeded. Please wait a minute before uploading another document.',
          retryAfterMs: rateCheck.resetInMs,
        },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file uploaded' }, { status: 400 });
    }

    // 2. Strict File Size Boundary
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed limit of 15MB.' },
        { status: 400 }
      );
    }

    // 3. Filename Sanitization against Directory Traversal
    const safeFilename = sanitizeFileName(file.name);

    if (!safeFilename.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Invalid file format. Only PDF files are supported.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Magic-Byte Verification (Ensures file is actually a PDF and not a polyglot executable)
    if (!verifyPdfMagicBytes(buffer)) {
      return NextResponse.json(
        { error: 'Security validation failed: File does not contain valid PDF binary header.' },
        { status: 400 }
      );
    }

    // Parse PDF text
    const pdfData = await pdfParse(buffer);
    const totalPages = pdfData.numpages || 1;
    const fullText = pdfData.text || '';

    // Split text into approximate pages based on form feeds or length
    const rawPages = fullText.split(/\f|\n\s*---\s*PAGE\s*\d+\s*---\s*\n/i);
    const pages: DocumentPage[] = [];

    const pagesCount = Math.max(totalPages, rawPages.length);
    const chunkSize = Math.ceil(fullText.length / pagesCount);

    for (let i = 0; i < pagesCount; i++) {
      const pageNumber = i + 1;
      let pageText = rawPages[i] || '';
      if (!pageText && fullText) {
        pageText = fullText.slice(i * chunkSize, (i + 1) * chunkSize);
      }

      // Advanced clause detection supporting SECTION, ARTICLE, CLAUSE, and numbered legal headings
      const clauses: DocumentClause[] = [];
      const sectionRegex = /(SECTION\s+\d+(\.\d+)?[:\s\w-]+|ARTICLE\s+[IVX\d]+[:\s\w-]+|CLAUSE\s+\d+[:\s\w-]+|\d+\.\d+\s+[^:\n]{3,60}:?)/gi;
      const matches: RegExpMatchArray[] = Array.from(pageText.matchAll(sectionRegex));

      if (matches.length > 0) {
        matches.forEach((m: RegExpMatchArray, idx: number) => {
          const matchTitle = (m[0] || '').trim();
          const matchIndex = m.index ?? 0;
          const nextMatch = matches[idx + 1];
          const nextMatchIndex = nextMatch ? (nextMatch.index ?? pageText.length) : pageText.length;
          
          // Extract specific paragraph excerpt for this clause
          const clauseExcerpt = pageText
            .slice(matchIndex, Math.min(nextMatchIndex, matchIndex + 350))
            .replace(/\s+/g, ' ')
            .trim();

          const combinedText = `${matchTitle} ${clauseExcerpt}`.toLowerCase();

          const isHighRisk =
            /bond|liquidated damages|clawback|non-compete|forfeit|penalty|unilateral|worldwide restraint|waive.*salary/i.test(combinedText);
          const isMediumRisk =
            /notice|bonus|discretionary|arbitration|indemnif|invention|intellectual property|attorney fee|exclusive/i.test(combinedText);

          let category = 'Contractual Provision';
          let implication = 'Standard legal condition. Verify reciprocal obligations.';

          if (/notice|resignation/i.test(combinedText)) {
            category = 'Termination & Notice';
            implication = 'Defines notice period for resignation or termination. Check if employee buyout is permitted.';
          } else if (/non-compete|restraint|compete/i.test(combinedText)) {
            category = 'Restrictive Covenants';
            implication = 'Restricts post-employment activities. Check whether mandatory paid garden leave is provided.';
          } else if (/bond|liquidated|clawback|training/i.test(combinedText)) {
            category = 'Financial Clawback';
            implication = 'Imposes financial lock-in or repayment liability upon departure.';
          } else if (/invention|intellectual property|patent/i.test(combinedText)) {
            category = 'Intellectual Property';
            implication = 'Governs ownership of software code and inventions created during employment.';
          } else if (/arbitration|dispute|jurisdiction/i.test(combinedText)) {
            category = 'Dispute Resolution';
            implication = 'Specifies governing forum and dispute procedures. Verify mutual arbitrator selection.';
          }

          clauses.push({
            id: `custom-c-${pageNumber}-${idx + 1}`,
            pageNumber,
            sectionNumber: matchTitle.split(/[:\n-]/)[0].trim().slice(0, 24),
            title: matchTitle.slice(0, 60),
            content: clauseExcerpt,
            riskLevel: isHighRisk ? 'high' : isMediumRisk ? 'medium' : 'low',
            category,
            implication,
          });
        });
      }

      pages.push({
        pageNumber,
        text: pageText || `Page ${pageNumber} text could not be extracted as plain text.`,
        clauses,
      });
    }

    // Infer document title from sanitized filename
    const cleanTitle = safeFilename
      .replace(/\.pdf$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const docId = `custom-doc-${Date.now()}`;
    const newDoc: LegalDocument = {
      id: docId,
      title: cleanTitle,
      filename: safeFilename,
      numPages: pages.length,
      uploadedAt: new Date().toISOString(),
      documentType: /employment|hire|offer/i.test(safeFilename)
        ? 'employment'
        : /vendor|service|msa/i.test(safeFilename)
        ? 'vendor'
        : /terms|privacy|eula/i.test(safeFilename)
        ? 'terms'
        : 'general',
      parties: ['Contracting Party A', 'Contracting Party B'],
      summary: `Uploaded legal document "${safeFilename}" comprising ${pages.length} pages. Successfully indexed for grounded legal analysis and clause citation.`,
      pages,
    };

    return NextResponse.json({
      success: true,
      document: newDoc,
    });
  } catch (error: unknown) {
    console.error('API /api/upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'PDF upload parsing failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
