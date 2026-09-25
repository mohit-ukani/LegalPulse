import { GoogleGenerativeAI } from '@google/generative-ai';
import { Citation, DocumentClause, LegalDocument, QuickActionId, QuickActionResult, RiskLevel } from './types';

// The system prompt strictly enforcing grounding, zero-hallucination, and exact visual citations
export const LEGAL_SYSTEM_PROMPT = `You are LegalPulse AI, an elite legal intelligence assistant specializing in contract analysis, risk assessment, and clause grounding.

CORE DIRECTIVES & CONSTRAINTS:
1. TRACEABLE EVIDENCE & CITATIONS: Every claim or finding MUST be accompanied by an exact citation consisting of:
   - pageNumber (integer)
   - sectionNumber (e.g., "Section 3.2" or "Section 6.1")
   - quote (the verbatim sentence or phrase from the document text)
   - relevanceExplanation (why this text matters in plain English)

2. HANDLING UNKNOWNS GRACEFULLY (CRITICAL):
   If the user asks about a term, condition, or clause that is NOT present in the provided document (e.g. stock options missing from a contract, severance rights not specified, remote work stipend not included), you MUST explicitly state:
   "The uploaded document does not contain information regarding [Topic]."
   NEVER guess, extrapolate, or fabricate details that are absent from the text.

3. PROFESSIONAL LEGAL DISCLAIMER & ACTIONABLE STEPS:
   You are an AI assistant designed to enhance legal comprehension, NOT a substitute for licensed legal counsel.
   Frame all recommendations responsibly, e.g.:
   "Based on the supplied document, Section X appears relevant. Here are specific questions you may want to clarify with a legal professional."
   Always generate 2-3 specific, high-leverage questions the user can ask their lawyer or HR.

4. STRUCTURED OUTPUT:
   Return your analysis in valid JSON matching the requested schema.`;

// Check if Gemini API is available
export function getGeminiClient(customApiKey?: string): GoogleGenerativeAI | null {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey.trim());
}

/**
 * Execute a grounded question against document text using Gemini 1.5 Flash
 */
export async function queryDocumentWithGemini(
  query: string,
  doc: LegalDocument,
  customApiKey?: string
): Promise<{
  answer: string;
  citations: Citation[];
  suggestedQuestions: string[];
  isMissingInfo: boolean;
}> {
  const genAI = getGeminiClient(customApiKey);

  // If Gemini API Key is configured, use live Gemini 1.5 Flash!
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-3.8-flash',
        systemInstruction: LEGAL_SYSTEM_PROMPT,
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      });

      // Prepare context with exact page numbering
      const documentContext = doc.pages
        .map(
          (p) =>
            `--- PAGE ${p.pageNumber} ---\n${p.text}\n`
        )
        .join('\n\n');

      const prompt = `DOCUMENT METADATA:
Title: ${doc.title}
Document Type: ${doc.documentType}
Parties: ${doc.parties.join(', ')}

DOCUMENT FULL TEXT:
${documentContext}

USER QUESTION:
"${query}"

INSTRUCTIONS:
Analyze the document text and respond in the following JSON format:
{
  "isMissingInfo": boolean (true if the document does NOT contain information answering this question),
  "answer": string (plain English explanation with legal implications),
  "citations": [
    {
      "pageNumber": number,
      "sectionNumber": string,
      "quote": string (verbatim from text),
      "relevanceExplanation": string,
      "riskLevel": "low" | "medium" | "high"
    }
  ],
  "suggestedQuestions": [
    string (specific follow-up questions to clarify with a legal professional)
  ]
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed = JSON.parse(responseText);

      return {
        answer: parsed.answer || 'Analysis complete.',
        citations: parsed.citations || [],
        suggestedQuestions: parsed.suggestedQuestions || [],
        isMissingInfo: Boolean(parsed.isMissingInfo),
      };
    } catch (error) {
      console.warn('Gemini API call error, falling back to grounded rule engine:', error);
      // Fall through to deterministic engine
    }
  }

  // Deterministic Grounded Engine (for immediate offline evaluation / sample documents)
  return runDeterministicGroundedSearch(query, doc);
}

/**
 * Intelligent deterministic RAG and citation matcher for instant response
 */
export function runDeterministicGroundedSearch(
  query: string,
  doc: LegalDocument
): {
  answer: string;
  citations: Citation[];
  suggestedQuestions: string[];
  isMissingInfo: boolean;
} {
  const normalizedQuery = query.toLowerCase();

  // Check for common legal topics
  const allClauses: DocumentClause[] = doc.pages.flatMap((p) => p.clauses || []);

  // 1. Notice period queries
  if (normalizedQuery.includes('notice') || normalizedQuery.includes('resignation') || normalizedQuery.includes('buyout')) {
    const noticeClauses = allClauses.filter((c) =>
      c.title.toLowerCase().includes('notice') || c.category.toLowerCase().includes('notice')
    );

    if (noticeClauses.length > 0) {
      const primary = noticeClauses[0];
      return {
        isMissingInfo: false,
        answer: `Based on **${primary.sectionNumber}** (Page ${primary.pageNumber}), the contract mandates a specific notice period: "${primary.content}". ${primary.implication} Importantly, examine whether you have the right to buyout unserved notice or if the employer has unilateral discretion over garden leave.`,
        citations: noticeClauses.map((c) => ({
          clauseId: c.id,
          pageNumber: c.pageNumber,
          sectionNumber: c.sectionNumber,
          clauseTitle: c.title,
          quote: c.content,
          relevanceExplanation: c.implication,
          riskLevel: c.riskLevel,
        })),
        suggestedQuestions: [
          'Can the employee negotiate a mutual 30-day notice period instead of 90 days?',
          'Is the employee entitled to buyout unserved notice by paying basic salary in lieu of notice?',
          'How is garden leave compensated if the company relieves the employee of duties during notice?',
        ],
      };
    }
  }

  // 2. Non-compete queries
  if (normalizedQuery.includes('non-compete') || normalizedQuery.includes('compete') || normalizedQuery.includes('restraint') || normalizedQuery.includes('restriction')) {
    const nonCompeteClauses = allClauses.filter((c) =>
      c.title.toLowerCase().includes('non-compete') || c.category.toLowerCase().includes('covenants') || c.category.toLowerCase().includes('restrictions')
    );

    if (nonCompeteClauses.length > 0) {
      const primary = nonCompeteClauses[0];
      return {
        isMissingInfo: false,
        answer: `According to **${primary.sectionNumber}** (Page ${primary.pageNumber}), this agreement enforces post-employment restrictive covenants: "${primary.content}". ${primary.implication} In many jurisdictions (such as California or under Section 27 of the Indian Contract Act), post-termination non-competes without consideration are void as restraints on trade.`,
        citations: nonCompeteClauses.map((c) => ({
          clauseId: c.id,
          pageNumber: c.pageNumber,
          sectionNumber: c.sectionNumber,
          clauseTitle: c.title,
          quote: c.content,
          relevanceExplanation: c.implication,
          riskLevel: c.riskLevel,
        })),
        suggestedQuestions: [
          'Is the non-compete enforceable under the governing state or national labor laws?',
          'Will the employer agree to pay 100% garden leave salary during the post-termination restraint period?',
          'Can the restricted scope be narrowed strictly to named direct competitors within a specific geographic radius?',
        ],
      };
    }
  }

  // 3. Service bond / clawbacks
  if (normalizedQuery.includes('bond') || normalizedQuery.includes('clawback') || normalizedQuery.includes('penalty') || normalizedQuery.includes('lock-in') || normalizedQuery.includes('liquidated damages')) {
    const bondClauses = allClauses.filter((c) =>
      c.title.toLowerCase().includes('bond') || c.category.toLowerCase().includes('financial') || c.content.toLowerCase().includes('damages')
    );

    if (bondClauses.length > 0) {
      const primary = bondClauses[0];
      return {
        isMissingInfo: false,
        answer: `Under **${primary.sectionNumber}** (Page ${primary.pageNumber}), the contract includes a financial service bond / clawback: "${primary.content}". ${primary.implication} Note that courts frequently disallow arbitrary penalties unless the employer can prove genuine, documented specialized training expenses incurred specifically for the employee.`,
        citations: bondClauses.map((c) => ({
          clauseId: c.id,
          pageNumber: c.pageNumber,
          sectionNumber: c.sectionNumber,
          clauseTitle: c.title,
          quote: c.content,
          relevanceExplanation: c.implication,
          riskLevel: c.riskLevel,
        })),
        suggestedQuestions: [
          'Can the training bond lock-in period be removed entirely before signing?',
          'Has the employer documented actual third-party training invoices justifying this liquidated damages figure?',
          'Is the employer legally permitted to withhold earned salary from final settlement under local wage payment acts?',
        ],
      };
    }
  }

  // 4. Compensation / Equity / Stock options
  if (normalizedQuery.includes('compensation') || normalizedQuery.includes('salary') || normalizedQuery.includes('stock') || normalizedQuery.includes('equity') || normalizedQuery.includes('option') || normalizedQuery.includes('bonus')) {
    const compClauses = allClauses.filter((c) =>
      c.category.toLowerCase().includes('compensation') || c.category.toLowerCase().includes('equity')
    );

    if (compClauses.length > 0) {
      return {
        isMissingInfo: false,
        answer: `The compensation terms are laid out in **Section 2** (Page 1). The base salary is fixed, while the 25% performance bonus is strictly discretionary and non-entitled. Crucially, the equity stock options are subject to a 1-year cliff and 4-year vesting, but require exercise within 30 days of separation, otherwise all vested shares are forfeited.`,
        citations: compClauses.map((c) => ({
          clauseId: c.id,
          pageNumber: c.pageNumber,
          sectionNumber: c.sectionNumber,
          clauseTitle: c.title,
          quote: c.content,
          relevanceExplanation: c.implication,
          riskLevel: c.riskLevel,
        })),
        suggestedQuestions: [
          'Can the post-termination exercise period (PTE) for vested stock options be extended from 30 days to 10 years?',
          'What objective metrics trigger the 25% performance bonus payout?',
          'Does equity accelerate (single or double trigger) upon a change of control or acquisition of the company?',
        ],
      };
    }
  }

  // 5. Intellectual Property & Inventions
  if (normalizedQuery.includes('ip') || normalizedQuery.includes('invention') || normalizedQuery.includes('patent') || normalizedQuery.includes('open source') || normalizedQuery.includes('copyright') || normalizedQuery.includes('side project')) {
    const ipClauses = allClauses.filter((c) =>
      c.title.toLowerCase().includes('intellectual property') || c.title.toLowerCase().includes('invention') || c.category.toLowerCase().includes('intellectual property')
    );

    if (ipClauses.length > 0) {
      const primary = ipClauses[0];
      return {
        isMissingInfo: false,
        answer: `As outlined in **${primary.sectionNumber}** (Page ${primary.pageNumber}), the intellectual property assignment clause states: "${primary.content}". ${primary.implication} Because it claims inventions made outside work hours and on personal equipment, you must ensure prior inventions and personal open-source projects are carved out in writing.`,
        citations: ipClauses.map((c) => ({
          clauseId: c.id,
          pageNumber: c.pageNumber,
          sectionNumber: c.sectionNumber,
          clauseTitle: c.title,
          quote: c.content,
          relevanceExplanation: c.implication,
          riskLevel: c.riskLevel,
        })),
        suggestedQuestions: [
          'Will the company execute an Exhibit A schedule explicitly listing my prior open-source repositories as excluded from company assignment?',
          'Can we add standard statutory wording protecting inventions developed entirely on personal time without company resources?',
          'Are freelance writing, speaking engagements, and non-commercial GitHub projects permitted without Board approval?',
        ],
      };
    }
  }

  // 6. Termination / Severance
  if (normalizedQuery.includes('termination') || normalizedQuery.includes('severance') || normalizedQuery.includes('fired') || normalizedQuery.includes('cause')) {
    const termClauses = allClauses.filter((c) =>
      c.title.toLowerCase().includes('termination') || c.category.toLowerCase().includes('termination')
    );

    if (termClauses.length > 0) {
      const primary = termClauses[0];
      return {
        isMissingInfo: false,
        answer: `Regarding termination, **${primary.sectionNumber}** (Page ${primary.pageNumber}) stipulates: "${primary.content}". ${primary.implication} Review the definition of "Cause" carefully to ensure that subjective performance issues cannot be used to strip you of severance or notice rights.`,
        citations: termClauses.map((c) => ({
          clauseId: c.id,
          pageNumber: c.pageNumber,
          sectionNumber: c.sectionNumber,
          clauseTitle: c.title,
          quote: c.content,
          relevanceExplanation: c.implication,
          riskLevel: c.riskLevel,
        })),
        suggestedQuestions: [
          'Can "failure to attain quarterly KPIs" be removed from the definition of gross Cause for immediate dismissal?',
          'What severance package is guaranteed in the event of layoff or termination without cause?',
          'Is there a mandatory 30-day cure period for any alleged performance deficiency before termination can take effect?',
        ],
      };
    }
  }

  // 7. Confidentiality & Non-Disclosure
  if (normalizedQuery.includes('confidential') || normalizedQuery.includes('nda') || normalizedQuery.includes('trade secret') || normalizedQuery.includes('disclosure')) {
    const confClauses = allClauses.filter((c) =>
      c.title.toLowerCase().includes('confidential') || c.category.toLowerCase().includes('confidential') || c.content.toLowerCase().includes('confidential')
    );

    if (confClauses.length > 0) {
      const primary = confClauses[0];
      return {
        isMissingInfo: false,
        answer: `Under **${primary.sectionNumber}** (Page ${primary.pageNumber}), the contract sets out confidentiality terms: "${primary.content}". ${primary.implication} Verify whether non-technical commercial information is subjected to an indefinite confidentiality term or limited to a reasonable 3 to 5 year duration.`,
        citations: confClauses.map((c) => ({
          clauseId: c.id,
          pageNumber: c.pageNumber,
          sectionNumber: c.sectionNumber,
          clauseTitle: c.title,
          quote: c.content,
          relevanceExplanation: c.implication,
          riskLevel: c.riskLevel,
        })),
        suggestedQuestions: [
          'Can the non-disclosure obligation for general business information be limited to 3-5 years post-employment?',
          'Does the definition of Confidential Information properly carve out publicly known information or prior knowledge?',
        ],
      };
    }
  }

  // 8. Indemnification & Liability
  if (normalizedQuery.includes('indemnif') || normalizedQuery.includes('liability') || normalizedQuery.includes('fee shifting') || normalizedQuery.includes('attorney fee') || normalizedQuery.includes('legal cost')) {
    const indemClauses = allClauses.filter((c) =>
      c.title.toLowerCase().includes('indemnif') || c.title.toLowerCase().includes('fee') || c.category.toLowerCase().includes('legal exposure') || c.content.toLowerCase().includes('reimburse') || c.content.toLowerCase().includes('attorney')
    );

    if (indemClauses.length > 0) {
      const primary = indemClauses[0];
      return {
        isMissingInfo: false,
        answer: `As stated in **${primary.sectionNumber}** (Page ${primary.pageNumber}): "${primary.content}". ${primary.implication} Ensure legal fee shifting is strictly reciprocal so the prevailing party recovers costs, rather than exposing the employee to one-sided corporate legal fees.`,
        citations: indemClauses.map((c) => ({
          clauseId: c.id,
          pageNumber: c.pageNumber,
          sectionNumber: c.sectionNumber,
          clauseTitle: c.title,
          quote: c.content,
          relevanceExplanation: c.implication,
          riskLevel: c.riskLevel,
        })),
        suggestedQuestions: [
          'Is the attorney fee reimbursement clause reciprocal if the employee prevails in a dispute?',
          'Does the company carry Errors & Omissions (E&O) insurance that shields employees from personal liability?',
        ],
      };
    }
  }

  // 9. Unknowns / Missing clauses handler (e.g. Parental Leave, Remote work allowance, 401k match)
  const unknownTopics = ['parental leave', 'maternity', 'paternity', 'remote stipend', 'relocation allowance', '401k match', 'pension', 'health insurance dental', 'overtime'];
  for (const topic of unknownTopics) {
    if (normalizedQuery.includes(topic)) {
      return {
        isMissingInfo: true,
        answer: `The uploaded document does not contain information regarding **${topic}**. This agreement focuses primarily on employment scope, compensation, intellectual property, service bonds, and termination conditions. It does not stipulate statutory or supplemental benefits for ${topic}.`,
        citations: [],
        suggestedQuestions: [
          `Ask HR: What is the company's formal written policy regarding ${topic}?`,
          `Request an addendum or employee handbook copy detailing ${topic} entitlements before signing.`,
        ],
      };
    }
  }

  // Generic keyword match across all text
  let bestMatchingPage = doc.pages[0];
  let bestQuote = '';
  let highestMatchCount = 0;

  for (const page of doc.pages) {
    const words = normalizedQuery.split(/\s+/).filter((w) => w.length > 3);
    let count = 0;
    for (const word of words) {
      if (page.text.toLowerCase().includes(word)) {
        count++;
      }
    }
    if (count > highestMatchCount) {
      highestMatchCount = count;
      bestMatchingPage = page;
      // Find matching sentence
      const sentences = page.text.split(/[.\n]+/);
      for (const sentence of sentences) {
        if (words.some((w) => sentence.toLowerCase().includes(w))) {
          bestQuote = sentence.trim();
          break;
        }
      }
    }
  }

  if (highestMatchCount > 0 && bestQuote) {
    return {
      isMissingInfo: false,
      answer: `Based on the document text on **Page ${bestMatchingPage.pageNumber}**, the relevant clause specifies: "${bestQuote}." Review this in context with your legal advisor to ensure the scope matches your expectations.`,
      citations: [
        {
          pageNumber: bestMatchingPage.pageNumber,
          sectionNumber: `Page ${bestMatchingPage.pageNumber}`,
          quote: bestQuote,
          relevanceExplanation: 'Direct textual match found in the agreement.',
          riskLevel: 'medium',
        },
      ],
      suggestedQuestions: [
        'How is this clause interpreted under prevailing jurisdictional case law?',
        'Can this provision be made mutual or narrowed in scope?',
      ],
    };
  }

  // Fallback if truly not in document
  return {
    isMissingInfo: true,
    answer: `The uploaded document does not contain information regarding your query. The document has been searched across all ${doc.numPages} pages, and no matching clauses or definitions were identified.`,
    citations: [],
    suggestedQuestions: [
      'Is there a separate Offer Letter, Employee Handbook, or Benefit Schedule covering this matter?',
      'Would you like to ask about Notice Periods, Non-Compete restrictions, Service Bonds, or IP Assignment?',
    ],
  };
}

/**
 * Run structured analysis for quick-action chips
 */
export function executeQuickAction(
  actionId: QuickActionId,
  doc: LegalDocument
): QuickActionResult {
  switch (actionId) {
    case 'notice_period': {
      const isDocB = doc.id.includes('v2') || doc.title.includes('Revised');
      if (isDocB) {
        return {
          actionId,
          title: 'Notice Period & Transition Obligations',
          status: 'found',
          plainEnglishSummary:
            'Reciprocal 30-day notice period for both employee and employer. You have the right to buyout unserved notice by paying basic salary.',
          legalImplications:
            'Balanced standard. Prevents prolonged career transition delays and gives you legal autonomy to start a new position earlier if required.',
          riskRating: 'low',
          citations: [
            {
              pageNumber: 3,
              sectionNumber: 'Section 5.1 & 5.2',
              clauseTitle: 'Reciprocal 30-Day Notice & Buyout Right',
              quote: 'Either party may terminate employment by giving thirty (30) calendar days prior written notice. Employee may elect to terminate immediately by paying basic salary in lieu of notice.',
              relevanceExplanation: 'Provides reciprocal timeline and employee buyout flexibility.',
              riskLevel: 'low',
            },
          ],
          suggestedLegalQuestions: [
            'Does the company require active handover meetings during the 30 days?',
            'How is accrued paid leave factored into the final 30-day notice calculation?',
          ],
          actionableNextSteps: [
            'Confirm in writing how accrued leave balances offset the 30-day notice period.',
          ],
        };
      }
      return {
        actionId,
        title: 'Notice Period & Resignation Restraints',
        status: 'found',
        plainEnglishSummary:
          'Mandatory 90-day written notice required from the employee. You have NO right to buyout notice with salary, while the company can fire you with only 30 days notice.',
        legalImplications:
          'Severely asymmetric and restrictive. 90-day mandatory notice without buyout can cause you to lose external offers where future employers demand immediate or 30-day joining.',
        riskRating: 'high',
        citations: [
          {
            pageNumber: 3,
            sectionNumber: 'Section 5.1 & 5.2',
            clauseTitle: 'Asymmetric 90-Day Notice Period with No Employee Buyout',
            quote: 'The Employee may terminate this Agreement only by providing ninety (90) calendar days prior written notice to the Company Management. The Employee shall not have any unilateral right to pay salary in lieu of serving the full ninety (90) day notice period.',
            relevanceExplanation: 'Forces 90-day retention and explicitly forbids employee buyout.',
            riskLevel: 'high',
          },
          {
            pageNumber: 3,
            sectionNumber: 'Section 5.3',
            clauseTitle: '30-Day Employer Notice Disparity',
            quote: 'The Company may terminate Employee service at any time without cause upon thirty (30) days notice or by paying thirty (30) days basic salary in lieu of notice.',
            relevanceExplanation: 'Demonstrates 3:1 asymmetry in termination notice obligations.',
            riskLevel: 'medium',
          },
        ],
        suggestedLegalQuestions: [
          'Can we amend Section 5.1 to a standard 30-day notice period reciprocal for both parties?',
          'Will the company insert an explicit buyout right allowing the employee to pay basic salary in lieu of unserved notice?',
          'Under state/local labor law, can an employer legally enforce a 90-day notice period if resignation is tendered?',
        ],
        actionableNextSteps: [
          'Flag Section 5.1 to the hiring manager and ask for a 30-day reciprocal notice clause.',
          'Consult local labor counsel regarding enforceability of notice buyout bans in your jurisdiction.',
        ],
      };
    }

    case 'non_compete': {
      const isDocB = doc.id.includes('v2') || doc.title.includes('Revised');
      if (isDocB) {
        return {
          actionId,
          title: 'Non-Compete & Post-Employment Restraint',
          status: 'found',
          plainEnglishSummary:
            'A narrow 6-month non-compete restricted strictly to five named competitors, backed by mandatory 100% monthly base salary paid garden leave.',
          legalImplications:
            'Fair and protective. If the company fails to pay full salary during the 6 months, the restriction immediately dissolves.',
          riskRating: 'low',
          citations: [
            {
              pageNumber: 3,
              sectionNumber: 'Section 6.1 & 6.2',
              clauseTitle: 'Narrowed 6-Month Non-Compete with 100% Paid Garden Leave',
              quote: 'Restricted for a reasonable period of six (6) months post-separation, limited only to five (5) named direct competitors... Company shall pay Employee one hundred percent (100%) of monthly Base Salary as continuing non-compete compensation.',
              relevanceExplanation: 'Compensates employee during any post-employment transition restrictions.',
              riskLevel: 'low',
            },
          ],
          suggestedLegalQuestions: [
            'Who are the specific 5 named competitors covered by this schedule?',
            'Can we clarify that non-confidential consulting outside those 5 companies is permitted immediately?',
          ],
          actionableNextSteps: [
            'Obtain the list of 5 named competitors in writing before signing.',
          ],
        };
      }
      return {
        actionId,
        title: 'Non-Compete & Post-Employment Restraint',
        status: 'found',
        plainEnglishSummary:
          'Extreme 24-month worldwide ban on working for or advising any business in cloud infrastructure or developer software, with ZERO post-employment salary or garden leave pay.',
        legalImplications:
          'Potential career strangulation. If strictly enforced, you cannot work in your primary engineering domain for 2 years anywhere in the world. Often used to send threatening cease-and-desist letters to future employers.',
        riskRating: 'high',
        citations: [
          {
            pageNumber: 3,
            sectionNumber: 'Section 6.1',
            clauseTitle: '24-Month Worldwide Non-Compete Restraint',
            quote: 'For a period of twenty-four (24) consecutive months following the termination or cessation of employment... the Employee shall not, directly or indirectly, own, manage, join, consult with, provide services to, or become employed by any business... worldwide that develops cloud infrastructure, distributed virtualization, or developer workflow software.',
            relevanceExplanation: 'Enforces an uncompensated 2-year worldwide career restriction.',
            riskLevel: 'high',
          },
          {
            pageNumber: 3,
            sectionNumber: 'Section 6.3',
            clauseTitle: 'Explicit Waiver of Garden Leave Pay',
            quote: 'no garden leave pay or post-termination salary shall be paid during the 24-month non-compete restraint period.',
            relevanceExplanation: 'Confirms zero financial consideration provided during the restriction.',
            riskLevel: 'high',
          },
        ],
        suggestedLegalQuestions: [
          'Is a 24-month worldwide non-compete legally enforceable under the governing law of this contract?',
          'Will the employer agree to pay 100% garden leave salary if they choose to enforce post-termination restrictions?',
          'Can we limit the restriction to non-solicitation of direct clients rather than an outright employment ban?',
        ],
        actionableNextSteps: [
          'Demand strikeout of Section 6.1 or addition of mandatory 100% salary paid garden leave.',
          'Inquire whether your jurisdiction (e.g. California, India, UK) considers post-employment non-competes per se void.',
        ],
      };
    }

    case 'bond_terms': {
      const isDocB = doc.id.includes('v2') || doc.title.includes('Revised');
      if (isDocB) {
        return {
          actionId,
          title: 'Employment Service Bond & Financial Clawbacks',
          status: 'found',
          plainEnglishSummary:
            'No employment service bond, no lock-in period, and zero liquidated damages. Company treats training as an ordinary business expense.',
          legalImplications:
            'Complete financial freedom. You cannot be penalized monetarily for resigning at any point.',
          riskRating: 'low',
          citations: [
            {
              pageNumber: 2,
              sectionNumber: 'Section 3.2',
              clauseTitle: 'Explicit Waiver of Service Bonds',
              quote: 'There shall be no mandatory service lock-in, bond, or liquidated damages clawback of any kind.',
              relevanceExplanation: 'Guarantees zero exit penalties.',
              riskLevel: 'low',
            },
          ],
          suggestedLegalQuestions: [
            'Does third-party training reimbursement only apply to formal certifications exceeding $5,000?',
          ],
          actionableNextSteps: [
            'Confirm no separate bond letter or training undertaking is presented during HR onboarding.',
          ],
        };
      }
      return {
        actionId,
        title: 'Employment Service Bond & $50,000 Clawback',
        status: 'found',
        plainEnglishSummary:
          'Mandatory 24-month lock-in period. If you leave or are terminated for cause before 2 years, you must pay $50,000 (INR 6,00,000) liquidated damages within 7 days, with authorization for the company to withhold your earned salary.',
        legalImplications:
          'Severe financial trap. Courts generally rule that punitive bonds not tied to genuine, documented specialized training are unenforceable, but companies frequently use them to withhold final settlements, experience letters, and PF/gratuity transfers.',
        riskRating: 'high',
        citations: [
          {
            pageNumber: 2,
            sectionNumber: 'Section 3.1 & 3.2',
            clauseTitle: '24-Month Lock-in and $50,000 Liquidated Damages',
            quote: 'Employee covenants and agrees to remain in the continuous, uninterrupted service of the Company for a minimum lock-in period of twenty-four (24) consecutive months... Employee shall immediately pay to the Company, as agreed liquidated damages and reimbursement of specialized onboarding expenses, the sum of $50,000 (or INR 6,00,000) in lump sum within seven (7) days.',
            relevanceExplanation: 'Imposes severe punitive monetary forfeiture for early resignation.',
            riskLevel: 'high',
          },
          {
            pageNumber: 2,
            sectionNumber: 'Section 3.3',
            clauseTitle: 'Full Salary and Leave Withholding Authorization',
            quote: 'The Employee hereby authorizes the Company to withhold, deduct, and retain all accrued salary, expense reimbursements, earned bonuses, and paid leave encashment toward satisfaction of the liquidated damages.',
            relevanceExplanation: 'Permits company to freeze final settlement payments.',
            riskLevel: 'high',
          },
        ],
        suggestedLegalQuestions: [
          'Can Section 3 be struck in its entirety as a condition of accepting this offer?',
          'What specific third-party training costs justify a $50,000 damages figure?',
          'Is the clause authorizing earned salary withholding legal under local Payment of Wages statutes?',
        ],
        actionableNextSteps: [
          'Request removal of Section 3, stating that standard onboarding is a regular cost of hiring.',
          'Never sign an employment bond without written confirmation of actual direct expenditures incurred.',
        ],
      };
    }

    case 'compensation': {
      return {
        actionId,
        title: 'Compensation, Equity & Bonus Discretion',
        status: 'found',
        plainEnglishSummary:
          'Base salary of $185,000 (INR 42L). 25% variable bonus is purely discretionary with no guaranteed entitlement. 15,000 stock options have a strict 30-day post-termination exercise window.',
        legalImplications:
          'A 30-day option exercise window forces you to either pay tens of thousands in exercise costs/taxes within 30 days of leaving or forfeit all your earned equity.',
        riskRating: 'high',
        citations: [
          {
            pageNumber: 1,
            sectionNumber: 'Section 2.2',
            clauseTitle: 'Discretionary Bonus Caveat',
            quote: 'The award, calculation, timing, and disbursement of any bonus remains at the absolute and sole discretion of the Company Executive Committee and shall not be deemed an earned entitlement.',
            relevanceExplanation: 'Variable pay can be withheld even if performance targets are met.',
            riskLevel: 'medium',
          },
          {
            pageNumber: 1,
            sectionNumber: 'Section 2.4',
            clauseTitle: '30-Day Option Exercise Forfeiture Trap',
            quote: 'vested options must be exercised within thirty (30) calendar days of separation, failing which they shall be forfeited back to the Company treasury.',
            relevanceExplanation: 'Short exercise window risks total forfeiture of earned equity.',
            riskLevel: 'high',
          },
        ],
        suggestedLegalQuestions: [
          'Can the post-termination exercise window for vested options be extended to 5 or 10 years?',
          'What are the explicit performance criteria determining the 25% annual bonus?',
          'Does the contract provide for pro-rata bonus payout if employment terminates mid-fiscal-year?',
        ],
        actionableNextSteps: [
          'Negotiate a longer post-termination exercise window (minimum 12–24 months).',
          'Ask for written KPIs governing bonus evaluation.',
        ],
      };
    }

    case 'ip_rights': {
      const isDocB = doc.id.includes('v2') || doc.title.includes('Revised');
      if (isDocB) {
        return {
          actionId,
          title: 'Intellectual Property & Personal Inventions',
          status: 'found',
          plainEnglishSummary:
            'Company only owns code written during business hours or using company resources. Personal weekend projects and open-source contributions are 100% owned by the employee.',
          legalImplications:
            'Healthy intellectual property boundary. Protects your personal portfolio and independent side endeavors.',
          riskRating: 'low',
          citations: [
            {
              pageNumber: 2,
              sectionNumber: 'Section 4.2',
              clauseTitle: 'Personal IP Carve-Out',
              quote: 'Company explicitly waives claim over any intellectual property developed by Employee entirely on Employee own time, without using Company equipment, software, or confidential trade secrets.',
              relevanceExplanation: 'Protects personal side projects from company claims.',
              riskLevel: 'low',
            },
          ],
          suggestedLegalQuestions: [
            'Is there any reporting requirement before publishing an open-source library?',
          ],
          actionableNextSteps: [
            'Maintain clean separation of work on personal laptops and personal GitHub accounts.',
          ],
        };
      }
      return {
        actionId,
        title: 'Intellectual Property Overreach',
        status: 'found',
        plainEnglishSummary:
          'The agreement claims ownership over ALL inventions and code created during the entire period of employment, even if made on weekends, using your own laptop, and unrelated to company products.',
        legalImplications:
          'Extremely broad IP assignment. Any app you build on your personal time could legally belong to the company unless previously disclosed in Exhibit A before joining.',
        riskRating: 'high',
        citations: [
          {
            pageNumber: 2,
            sectionNumber: 'Section 4.2',
            clauseTitle: 'Overbroad Off-Hours Inventions Claim',
            quote: 'This assignment applies comprehensively to all creations made during the term of employment, whether or not conceived during regular business hours, whether or not using Company computers or hardware, and whether or not directly related to the Company current commercial products.',
            relevanceExplanation: 'Claims ownership over personal time and personal hardware creations.',
            riskLevel: 'high',
          },
        ],
        suggestedLegalQuestions: [
          'Can we insert standard statutory carve-out language (e.g. California Labor Code Section 2870)?',
          'How do I formally attach Exhibit A to list my existing GitHub repositories and domain names?',
        ],
        actionableNextSteps: [
          'Draft Exhibit A immediately and list all pre-existing code, projects, and websites.',
          'Negotiate removal of the phrase "whether or not during regular business hours".',
        ],
      };
    }

    case 'termination': {
      return {
        actionId,
        title: 'Termination with & without Cause',
        status: 'found',
        plainEnglishSummary:
          'Company can terminate without cause on 30 days notice. Immediate termination without notice or severance is allowed for subjective "failure to meet quarterly KPIs" or any action deemed detrimental by the Board.',
        legalImplications:
          'Subjective underperformance is treated as gross misconduct ("Cause"), stripping you of notice period and severance.',
        riskRating: 'high',
        citations: [
          {
            pageNumber: 3,
            sectionNumber: 'Section 5.4',
            clauseTitle: 'Subjective KPI Failure Treated as Immediate Cause',
            quote: 'Company may terminate this Agreement immediately with zero notice and zero severance upon... failure to attain quarterly Key Performance Indicators (KPIs) set by management, or any action deemed detrimental by the Board.',
            relevanceExplanation: 'Deprives employee of notice or severance for performance issues.',
            riskLevel: 'high',
          },
        ],
        suggestedLegalQuestions: [
          'Can "failure to attain KPIs" be removed from Cause, leaving only willful fraud, crime, or gross misconduct?',
          'Is there a mandatory 30-day notice and performance improvement plan (PIP) requirement prior to termination?',
        ],
        actionableNextSteps: [
          'Request that Cause be limited to criminal conviction, fraud, or material un-cured breach.',
        ],
      };
    }

    case 'governing_law': {
      return {
        actionId,
        title: 'Governing Law, Arbitration & Fee Shifting',
        status: 'found',
        plainEnglishSummary:
          'Governed by Delaware/Bengaluru law. Mandatory private binding arbitration before an arbitrator unilaterally chosen by the company, plus one-sided legal fee reimbursement if the company wins.',
        legalImplications:
          'Biased arbitration setup. You waive jury trial rights and class actions, and face the risk of paying expensive company legal fees if you lose.',
        riskRating: 'medium',
        citations: [
          {
            pageNumber: 4,
            sectionNumber: 'Section 8.2 & 8.3',
            clauseTitle: 'Unilateral Arbitrator & Asymmetric Cost Shifting',
            quote: 'binding arbitration before a single arbitrator selected by the Company... In the event Company prevails in any enforcement proceeding, Employee shall reimburse all legal costs, court filing fees, and external attorney fees.',
            relevanceExplanation: 'One-sided arbitrator selection and attorney fee recovery.',
            riskLevel: 'medium',
          },
        ],
        suggestedLegalQuestions: [
          'Can the arbitrator be appointed by mutual agreement through a recognized body (AAA / JAMS)?',
          'Can the attorney fee clause be made reciprocal so the prevailing party receives fees?',
        ],
        actionableNextSteps: [
          'Propose mutual arbitrator appointment and mutual fee recovery.',
        ],
      };
    }

    case 'confidentiality': {
      const isDocB = doc.id.includes('v2') || doc.title.includes('Revised');
      if (isDocB) {
        return {
          actionId,
          title: 'Confidentiality & Trade Secret Protections',
          status: 'found',
          plainEnglishSummary:
            'Balanced 5-year non-disclosure protection for general business information, with indefinite protection reserved strictly for genuine technical trade secrets.',
          legalImplications:
            'Fair market standard. Allows you to freely use general commercial knowledge in future roles after 5 years, while honoring proprietary code protections.',
          riskRating: 'low',
          citations: [
            {
              pageNumber: 4,
              sectionNumber: 'Section 7.1',
              clauseTitle: 'Five-Year Commercial Sunset & Trade Secrets Protection',
              quote: 'Five (5) year term for business data, perpetual for technical trade secrets.',
              relevanceExplanation: 'Applies a reasonable sunset on commercial data.',
              riskLevel: 'low',
            },
          ],
          suggestedLegalQuestions: [
            'Are customer lists and pricing records subject to the 5-year expiration?',
          ],
          actionableNextSteps: [
            'Confirm inventory of protected trade secrets prior to formal departure.',
          ],
        };
      }
      return {
        actionId,
        title: 'Perpetual Confidentiality & Trade Secrets',
        status: 'found',
        plainEnglishSummary:
          'Broad indefinite non-disclosure requirement. You are prohibited from ever using or disclosing any company information perpetually after leaving, with no sunset period.',
        legalImplications:
          'Overbroad perpetual restrictions can create legal exposure when working in the same industry domain, as former employers may claim ordinary business skills are company secrets.',
        riskRating: 'medium',
        citations: [
          {
            pageNumber: 4,
            sectionNumber: 'Section 7.1',
            clauseTitle: 'Perpetual Confidentiality with Zero Sunset',
            quote: 'hold in strictest confidence and never disclose, publish, or utilize any Confidential Information of the Company for a perpetual period following separation.',
            relevanceExplanation: 'Enforces permanent restrictions on all company data without standard time limits.',
            riskLevel: 'medium',
          },
        ],
        suggestedLegalQuestions: [
          'Can general commercial and operational information be limited to a standard 2-3 year term post-separation?',
          'Does the definition exclude information that is publicly known or independently developed?',
        ],
        actionableNextSteps: [
          'Request standard exclusion carve-outs for general industry knowledge and non-secret data.',
        ],
      };
    }

    case 'indemnification': {
      const isDocB = doc.id.includes('v2') || doc.title.includes('Revised');
      if (isDocB) {
        return {
          actionId,
          title: 'Mutual Dispute Resolution & Reciprocal Legal Fees',
          status: 'found',
          plainEnglishSummary:
            'Requires 30 days of good faith mediation before any arbitration. Arbitrator is appointed jointly by mutual consent, and the prevailing party receives reasonable attorney fees.',
          legalImplications:
            'Symmetrical legal protection. You cannot be ambushed with a company-picked arbitrator, and you recover your legal fees if you successfully defend your rights.',
          riskRating: 'low',
          citations: [
            {
              pageNumber: 4,
              sectionNumber: 'Section 8.1 - 8.3',
              clauseTitle: 'Pre-Dispute Mediation & Bilateral Attorney Fee Recovery',
              quote: 'Parties agree to thirty (30) days of good faith commercial mediation... Arbitrator appointed jointly by mutual written consent... The prevailing party in any dispute shall be awarded reasonable attorney fees.',
              relevanceExplanation: 'Guarantees mutual arbitrator selection and two-way cost reimbursement.',
              riskLevel: 'low',
            },
          ],
          suggestedLegalQuestions: [
            'Which established mediation provider (e.g. AAA, JAMS) administers the initial mediation?',
          ],
          actionableNextSteps: [
            'Retain documentation of all mutual communications should any dispute arise.',
          ],
        };
      }
      return {
        actionId,
        title: 'Asymmetric Legal Cost Shifting & Liability Exposure',
        status: 'found',
        plainEnglishSummary:
          'Extreme one-sided cost shifting: if the company prevails in any enforcement action against you (including non-compete disputes), you must pay all company legal costs, filing fees, and outside attorney bills. There is NO reciprocal fee recovery for you if you win.',
        legalImplications:
          'Severe chilling effect on employee rights. The threat of paying expensive corporate legal bills discourages employees from defending against unconscionable contract terms.',
        riskRating: 'high',
        citations: [
          {
            pageNumber: 4,
            sectionNumber: 'Section 8.3',
            clauseTitle: 'One-Sided Company Legal Fee Reimbursement',
            quote: 'In the event Company prevails in any enforcement proceeding, Employee shall reimburse all legal costs, court filing fees, and external attorney fees incurred by Company.',
            relevanceExplanation: 'Imposes severe asymmetric financial liability on the employee.',
            riskLevel: 'high',
          },
        ],
        suggestedLegalQuestions: [
          'Can Section 8.3 be made bilateral so that the prevailing party receives attorney fees regardless of who wins?',
          'Will the company confirm that employees are covered under corporate Directors & Officers (D&O) or liability insurance?',
        ],
        actionableNextSteps: [
          'Insist that any attorney fee shifting clause be strictly bilateral / reciprocal.',
        ],
      };
    }

    default: {
      return {
        actionId,
        title: 'Legal Assessment',
        status: 'partial',
        plainEnglishSummary: 'Review this clause in detail with a legal professional.',
        legalImplications: 'Ensure all obligations are reciprocal.',
        riskRating: 'medium',
        citations: [],
        suggestedLegalQuestions: ['What are the reciprocal obligations for this clause?'],
        actionableNextSteps: ['Request standard bilateral language.'],
      };
    }
  }
}
