import {
  LegalDocument,
  QuickActionItem,
  RiskAnalysisReport,
  ContractComparisonResult,
  ChallengePersona,
  PersonaContext,
} from './types';

export const PERSONA_CONFIGS: Record<ChallengePersona, PersonaContext> = {
  professional: {
    id: 'professional',
    label: 'Working Professional',
    badge: 'Labor & Career Protection',
    tagline: 'Employees, Tech Workers, Freelancers & Consultants',
    description:
      'Engineered to safeguard individual career mobility, protect personal intellectual property, eliminate coercive service bonds, and negotiate equitable severance and notice terms.',
    primaryAgreements: [
      'Employment Contracts',
      'Independent Contractor Agreements',
      'Stock Option Plans & Equity Grants',
      'Employee Non-Disclosure Agreements (NDAs)',
    ],
    keyRiskPriorities: [
      'Uncompensated 24-Month Non-Competes',
      'Service Bonds & $50,000 Liquidated Damages Clawbacks',
      'Asymmetric 90-Day Notice Periods with Buyout Bans',
      'Overbroad Off-Hours Inventions & Moonlighting Claims',
      '30-Day Accelerated Stock Option Forfeiture Traps',
    ],
    statutoryFramework:
      'California Labor Code §16600 & §2870, Section 27 Indian Contract Act 1872, FTC Non-Compete Ruling, UK Restraint of Trade Doctrine',
  },
  business: {
    id: 'business',
    label: 'Business & Commercial Vendor',
    badge: 'Enterprise Commercial Defense',
    tagline: 'Startups, SMBs, Commercial Vendors & Procurement Teams',
    description:
      'Engineered to protect commercial balance sheets, cap catastrophic consequential liabilities, ensure reciprocal indemnities, establish enforceable SLA bounds, and optimize cash-flow payment cycles.',
    primaryAgreements: [
      'Master Services Agreements (MSA)',
      'SaaS Terms of Service & Subscription Agreements',
      'Vendor Statements of Work (SOW)',
      'Commercial Procurement & Enterprise Sales Terms',
    ],
    keyRiskPriorities: [
      'Uncapped Consequential Damages & Lost Profit Exposure',
      'One-Sided Unilateral Customer Indemnification',
      'Disproportionate 50% Invoice Deduction SLA Outage Penalties',
      'Net 90 Invoicing Cycles with Unilateral Withholding Rights',
      'Exclusive Out-of-State Litigation Forums with Asymmetric Legal Fees',
    ],
    statutoryFramework:
      'Uniform Commercial Code (UCC) Article 2, American Arbitration Association (AAA) Commercial Rules, B2B Standard Contract Practice',
  },
};

export const QUICK_ACTIONS: QuickActionItem[] = [
  // --- Professional Persona Focus Workflows ---
  {
    id: 'notice_period',
    label: 'Notice Period & Buyout',
    iconName: 'Clock',
    description: 'Notice duration, buyout options, and garden leave obligations',
    defaultPrompt: 'What is the required notice period for resignation and termination, and are there buyout or garden leave clauses?',
    targetPersona: 'professional',
  },
  {
    id: 'non_compete',
    label: 'Non-Compete & Restraints',
    iconName: 'ShieldWarning',
    description: 'Post-employment restrictions, geographical scope, and duration',
    defaultPrompt: 'What non-compete, non-solicitation, and post-employment restrictions exist in this agreement?',
    targetPersona: 'professional',
  },
  {
    id: 'bond_terms',
    label: 'Bond & Financial Clawbacks',
    iconName: 'CurrencyDollar',
    description: 'Employment service bonds, liquidated damages, and clawbacks',
    defaultPrompt: 'Does this contract contain an employment bond, lock-in period, training reimbursement, or financial clawback clause?',
    targetPersona: 'professional',
  },
  {
    id: 'compensation',
    label: 'Compensation & Stock Options',
    iconName: 'Coins',
    description: 'Fixed CTC, bonus discretion, equity vesting, and forfeiture rules',
    defaultPrompt: 'Detail the compensation structure, variable bonus eligibility, and stock option vesting or forfeiture terms.',
    targetPersona: 'professional',
  },
  {
    id: 'termination',
    label: 'Termination & Severance',
    iconName: 'WarningCircle',
    description: 'Grounds for termination, severance rights, and immediate discharge terms',
    defaultPrompt: 'What are the conditions for termination with and without cause, and what severance pay is guaranteed?',
    targetPersona: 'professional',
  },
  {
    id: 'ip_rights',
    label: 'IP & Invention Assignment',
    iconName: 'Lightbulb',
    description: 'Ownership of side projects, pre-existing code, and invention assignment',
    defaultPrompt: 'What are the intellectual property assignment terms, and does it claim personal projects developed on off-hours?',
    targetPersona: 'professional',
  },

  // --- Business Persona Focus Workflows ---
  {
    id: 'liability_cap',
    label: 'Liability Cap & Damages',
    iconName: 'ShieldWarning',
    description: 'Consequential damages waivers and overall contractual liability caps',
    defaultPrompt: 'What are the limitation of liability terms, consequential damages waivers, and aggregate liability caps?',
    targetPersona: 'business',
  },
  {
    id: 'indemnification',
    label: 'Indemnity & Hold Harmless',
    iconName: 'FileText',
    description: 'Third-party claim defense obligations, reciprocity, and carve-outs',
    defaultPrompt: 'What are the indemnification and hold harmless obligations, and are they reciprocal or unilateral?',
    targetPersona: 'both',
  },
  {
    id: 'payment_terms',
    label: 'Payment Terms & Invoicing',
    iconName: 'CurrencyDollar',
    description: 'Net payment cycles, invoice dispute rights, and withholding traps',
    defaultPrompt: 'What are the invoicing timelines, net payment terms, late fees, and customer withholding rights?',
    targetPersona: 'business',
  },
  {
    id: 'service_level',
    label: 'SLA & Uptime Penalties',
    iconName: 'Clock',
    description: 'Uptime guarantees, outage penalties, and service credit remedies',
    defaultPrompt: 'What are the service level agreements (SLAs), uptime commitments, and financial penalty credits?',
    targetPersona: 'business',
  },
  {
    id: 'ip_warranty',
    label: 'IP Warranties & Infringement',
    iconName: 'Lightbulb',
    description: 'Infringement indemnification, IP warranties, and remedy caps',
    defaultPrompt: 'Does the vendor warrant non-infringement, and what are the indemnification remedies for third-party claims?',
    targetPersona: 'business',
  },
  {
    id: 'confidentiality',
    label: 'Confidentiality & Trade Secrets',
    iconName: 'Lock',
    description: 'Non-disclosure obligations, trade secret scope, and post-exit duration',
    defaultPrompt: 'What are the confidentiality and non-disclosure obligations, and how long do they survive termination?',
    targetPersona: 'both',
  },
  {
    id: 'governing_law',
    label: 'Governing Law & Forum',
    iconName: 'Scales',
    description: 'Applicable courts, mandatory arbitration, and dispute resolution',
    defaultPrompt: 'What is the governing jurisdiction, and does it enforce mandatory binding arbitration or waive jury trials?',
    targetPersona: 'both',
  },
];

export const SAMPLE_DOC_A: LegalDocument = {
  id: 'doc-apex-emp-v1',
  title: 'Apex Cloud Technologies — Senior Staff Engineer Employment Agreement (Original)',
  filename: 'Apex_Employment_Agreement_2026_Standard.pdf',
  fileUrl: '/samples/sample-agreement-v1.pdf',
  numPages: 4,
  uploadedAt: '2026-09-22T10:00:00Z',
  documentType: 'employment',
  persona: 'professional',
  parties: ['Apex Cloud Technologies Inc. (Employer)', 'Alex Morgan (Employee)'],
  effectiveDate: 'October 1, 2026',
  jurisdiction: 'Delaware / Bangalore Exclusive Jurisdiction',
  summary:
    'A bilateral Senior Staff Software Engineer employment agreement containing aggressive employer protections: a 90-day asymmetric notice period, a 24-month worldwide non-compete restraint, an enforceable 2-year service bond with $50,000 / ₹6,00,000 liquidated damages, broad IP assignment reaching personal off-hours creations, and mandatory one-sided arbitration.',
  pages: [
    {
      pageNumber: 1,
      text: `EMPLOYMENT AND CONFIDENTIALITY AGREEMENT

THIS AGREEMENT is entered into on this 1st day of October, 2026 (the "Effective Date"), by and between:
1. APEX CLOUD TECHNOLOGIES INC., a corporation with principal offices at 500 Tech Parkway, Suite 400 (hereinafter referred to as the "Company" or "Employer"); and
2. ALEX MORGAN, residing at 142 Riverview Drive (hereinafter referred to as the "Employee").

SECTION 1: APPOINTMENT AND SCOPE OF SERVICES
1.1 Title: The Company hereby engages the Employee in the full-time role of Senior Staff Software Engineer, Cloud Core Systems.
1.2 Duties: The Employee agrees to devote their entire business time, attention, skill, and best efforts exclusively to the business and affairs of the Company.
1.3 Exclusive Service: During the Employment Term, the Employee shall not directly or indirectly engage in, perform services for, consult with, or receive remuneration from any other enterprise, business entity, open-source organization, or commercial project, whether during or outside normal working hours, without express prior written consent from the Company's Board of Directors.

SECTION 2: COMPENSATION AND BENEFITS
2.1 Base Salary: The Company shall pay the Employee a fixed base salary of $185,000 (or equivalent INR 42,00,000) per annum, payable in accordance with normal payroll cycles.
2.2 Discretionary Incentive Bonus: The Employee may be considered for an annual variable performance bonus of up to 25% of Base Salary. The award, calculation, timing, and disbursement of any bonus remains at the absolute and sole discretion of the Company Executive Committee and shall not be deemed an earned entitlement.
2.3 Equity Incentive: The Employee shall be eligible to receive an option grant of 15,000 Incentive Stock Options (ISOs), governed strictly by the 2024 Apex Equity Incentive Plan. Said options are subject to a standard twelve (12) month cliff and four (4) year pro-rata vesting schedule.
2.4 Equity Forfeiture: In the event Employee separates from the Company for any reason whatsoever, whether voluntary, involuntary, with cause, or without cause, all unvested options shall immediately terminate. Furthermore, any vested options must be exercised within thirty (30) calendar days of separation, failing which they shall be forfeited back to the Company treasury.`,
      clauses: [
        {
          id: 'c-1-3',
          pageNumber: 1,
          sectionNumber: 'Section 1.3',
          title: 'Exclusive Service & Moonlighting Prohibition',
          content: 'Employee shall not directly or indirectly engage in, perform services for, consult with, or receive remuneration from any other enterprise, open-source organization, or commercial project, whether during or outside normal working hours, without prior written Board approval.',
          riskLevel: 'medium',
          category: 'Employment Restrictions',
          implication: 'Strict moonlighting and open-source contribution ban that prohibits personal coding projects or unpaid community contributions outside work hours.',
        },
        {
          id: 'c-2-2',
          pageNumber: 1,
          sectionNumber: 'Section 2.2',
          title: 'Discretionary Incentive Bonus',
          content: 'The award, calculation, timing, and disbursement of any bonus remains at the absolute and sole discretion of the Company Executive Committee and shall not be deemed an earned entitlement.',
          riskLevel: 'medium',
          category: 'Compensation',
          implication: 'Variable pay of 25% is legally unenforceable as an entitlement; the company can withhold bonus payout even if all personal performance milestones are reached.',
        },
        {
          id: 'c-2-4',
          pageNumber: 1,
          sectionNumber: 'Section 2.4',
          title: 'Stock Option Forfeiture and Accelerated 30-Day Window',
          content: 'In the event Employee separates from the Company for any reason whatsoever, whether voluntary or involuntary... vested options must be exercised within thirty (30) calendar days of separation, failing which they shall be forfeited back to Company treasury.',
          riskLevel: 'high',
          category: 'Equity & Compensation',
          implication: 'Unforgiving 30-day post-termination exercise window (PTE) may cause total loss of earned equity due to liquidity constraints, compared to modern 5-10 year PTE windows.',
        },
      ],
    },
    {
      pageNumber: 2,
      text: `SECTION 3: SERVICE BOND AND TRAINING EXPENSE RECOVERY
3.1 Minimum Mandatory Term: The Company invests substantial specialized infrastructure and proprietary domain training in the Employee upon hire. In consideration thereof, the Employee covenants and agrees to remain in the continuous, uninterrupted service of the Company for a minimum lock-in period of twenty-four (24) consecutive months from the Effective Date (the "Commitment Period").
3.2 Liquidated Damages and Clawback: In the event the Employee tenders resignation, ceases employment, or is terminated for cause prior to the expiration of the twenty-four (24) month Commitment Period, the Employee shall immediately pay to the Company, as agreed liquidated damages and reimbursement of specialized onboarding expenses, the sum of $50,000 (or INR 6,00,000) in lump sum within seven (7) days of separation notice.
3.3 Payroll Deductions: The Employee hereby authorizes the Company to withhold, deduct, and retain all accrued salary, expense reimbursements, earned bonuses, and paid leave encashment toward satisfaction of the liquidated damages stipulated in Section 3.2.

SECTION 4: INTELLECTUAL PROPERTY AND INVENTIONS
4.1 Assignment of Inventions: The Employee hereby irrevocably transfers, conveys, and assigns to the Company all right, title, and interest worldwide in and to any and all inventions, software code, discoveries, designs, trade secrets, architecture diagrams, and copyrightable works created, authored, conceived, or reduced to practice by the Employee, either solely or jointly with others.
4.2 Scope of Assignment: This assignment applies comprehensively to all creations made during the term of employment, whether or not conceived during regular business hours, whether or not using Company computers or hardware, and whether or not directly related to the Company's current commercial products, unless the Employee proves by clear and convincing evidence that the creation was disclosed prior to employment in Exhibit A.`,
      clauses: [
        {
          id: 'c-3-1',
          pageNumber: 2,
          sectionNumber: 'Section 3.1 & 3.2',
          title: 'Two-Year Service Bond & $50,000 Liquidated Damages Clawback',
          content: 'Employee covenants and agrees to remain in the continuous service of the Company for a minimum lock-in period of twenty-four (24) consecutive months... failing which Employee shall immediately pay the sum of $50,000 (or INR 6,00,000) as agreed liquidated damages within seven (7) days.',
          riskLevel: 'high',
          category: 'Financial Liability & Lock-in',
          implication: 'Imposes severe financial penalization for early resignation. While punitive bonds are often legally unenforceable or restricted under labor laws (e.g. Indian Contract Act Section 27, California Labor Code 2802), companies often use them to withhold final settlements.',
        },
        {
          id: 'c-3-3',
          pageNumber: 2,
          sectionNumber: 'Section 3.3',
          title: 'Full Final Settlement Salary Withholding',
          content: 'Employee hereby authorizes Company to withhold, deduct, and retain all accrued salary, expense reimbursements, and paid leave encashment toward satisfaction of liquidated damages.',
          riskLevel: 'high',
          category: 'Financial Liability',
          implication: 'Employer asserts right to withhold your earned wages and earned leave payout to fund their claimed training penalty.',
        },
        {
          id: 'c-4-2',
          pageNumber: 2,
          sectionNumber: 'Section 4.2',
          title: 'Overbroad Intellectual Property Claim on Off-Hours Creations',
          content: 'This assignment applies comprehensively to all creations made during the term of employment, whether or not conceived during regular business hours, whether or not using Company computers or hardware, and whether or not directly related to Company products.',
          riskLevel: 'high',
          category: 'Intellectual Property',
          implication: 'Extreme overreach: claims ownership over apps, side businesses, or open source projects you build on weekends using your own personal laptop.',
        },
      ],
    },
    {
      pageNumber: 3,
      text: `SECTION 5: TERMINATION AND NOTICE PERIOD
5.1 Voluntary Resignation by Employee: The Employee may terminate this Agreement only by providing ninety (90) calendar days prior written notice to the Company Management. 
5.2 No Buyout Right for Employee: The Employee shall not have any unilateral right to pay salary in lieu of serving the full ninety (90) day notice period. The Company reserves the sole prerogative to require the Employee to actively perform transition duties for the entirety of the 90 days.
5.3 Termination by Company Without Cause: The Company may terminate Employee's service at any time without cause upon thirty (30) days notice or by paying thirty (30) days basic salary in lieu of notice.
5.4 Termination for Cause: The Company may terminate this Agreement immediately with zero notice and zero severance upon the occurrence of: (a) any breach of Company policies, (b) failure to attain quarterly Key Performance Indicators (KPIs) set by management, (c) unexcused absence exceeding three (3) days, or (d) any action deemed detrimental by the Board to the Company's business interests.
5.5 Garden Leave: During any notice period, the Company may in its sole discretion relieve the Employee of all operational duties, prohibit entry to Company premises, and disable network credentials ("Garden Leave").

SECTION 6: RESTRICTIVE COVENANTS AND NON-COMPETE
6.1 Non-Competition Period and Territory: For a period of twenty-four (24) consecutive months following the termination or cessation of employment for any reason whatsoever, the Employee shall not, directly or indirectly, own, manage, join, consult with, provide services to, or become employed by any business, enterprise, or entity worldwide that develops, sells, licenses, or operates cloud infrastructure, distributed virtualization, Kubernetes tooling, or developer workflow software.
6.2 Non-Solicitation of Customers and Employees: For twenty-four (24) months post-separation, Employee shall not solicit or hire any employee, contractor, or customer of the Company.
6.3 No Consideration for Post-Termination Restraint: The Employee acknowledges that the Base Salary paid during active employment constitutes complete, valid, and adequate consideration for the restrictive covenants in this Section 6, and no garden leave pay or post-termination salary shall be paid during the 24-month non-compete restraint period.`,
      clauses: [
        {
          id: 'c-5-1',
          pageNumber: 3,
          sectionNumber: 'Section 5.1 & 5.2',
          title: 'Asymmetric 90-Day Notice Period with No Employee Buyout',
          content: 'Employee may terminate this Agreement only by providing ninety (90) calendar days prior written notice... Employee shall not have any unilateral right to pay salary in lieu of serving the full ninety (90) day notice period.',
          riskLevel: 'high',
          category: 'Notice & Transition',
          implication: 'Asymmetric notice: Employee must serve 90 days with zero buyout right, but Company can dismiss employee with only 30 days notice under Section 5.3. Can severely hinder taking up new job offers.',
        },
        {
          id: 'c-5-4',
          pageNumber: 3,
          sectionNumber: 'Section 5.4',
          title: 'Immediate Termination for Cause on Subjective KPI Targets',
          content: 'Company may terminate this Agreement immediately with zero notice and zero severance upon... failure to attain quarterly Key Performance Indicators (KPIs) set by management, or any action deemed detrimental by Board.',
          riskLevel: 'high',
          category: 'Termination & Severance',
          implication: 'Subjective underperformance (missing quarterly KPIs) is classified as "Cause", allowing the company to fire immediately without notice period or severance.',
        },
        {
          id: 'c-6-1',
          pageNumber: 3,
          sectionNumber: 'Section 6.1 & 6.3',
          title: 'Uncompensated 24-Month Worldwide Non-Compete',
          content: 'For twenty-four (24) consecutive months post-separation... Employee shall not directly or indirectly join or consult with any enterprise worldwide developing cloud infrastructure or developer tools... with zero post-termination consideration.',
          riskLevel: 'high',
          category: 'Restrictive Covenants',
          implication: 'Draconian 2-year worldwide non-compete without any financial support or garden leave pay. In many jurisdictions (e.g. California, India, UK), broad post-employment non-competes are void, but employers use them in demand letters to scare candidates.',
        },
      ],
    },
    {
      pageNumber: 4,
      text: `SECTION 7: CONFIDENTIALITY AND TRADE SECRETS
7.1 Perpetual Confidentiality: The Employee agrees to hold in strictest confidence and never disclose, publish, or utilize any Confidential Information of the Company for a perpetual period following separation.
7.2 Return of Property: Upon separation, Employee shall immediately return all documents, laptops, code repositories, and physical assets.

SECTION 8: GOVERNING LAW AND DISPUTE RESOLUTION
8.1 Governing Law: This Agreement shall be governed by, construed, and enforced in accordance with the laws of the State of Delaware (or Bengaluru, Karnataka for Indian personnel), without regard to conflict of law principles.
8.2 Mandatory Binding Individual Arbitration: Any dispute, claim, or controversy arising out of or relating to this Agreement or breach thereof shall be resolved exclusively through private, binding arbitration before a single arbitrator selected by the Company.
8.3 Class Action Waiver and Cost Shifting: The Employee explicitly waives any right to initiate, join, or participate in any collective or class action against the Company. In the event Company prevails in any enforcement proceeding, Employee shall reimburse all legal costs, court filing fees, and external attorney fees incurred by Company.

SECTION 9: MISCELLANEOUS
9.1 Entire Agreement: This document represents the entire understanding between the parties and supersedes all prior verbal representations, interview discussions, offer letters, or Slack correspondences.
9.2 Severability: If any provision of this Agreement is held invalid or unenforceable, remaining provisions shall continue in full force and effect.

IN WITNESS WHEREOF, the parties hereto have executed this Employment and Confidentiality Agreement as of the Effective Date written above.

FOR APEX CLOUD TECHNOLOGIES INC.:           EMPLOYEE:
By: ___________________________            By: ___________________________
Marcus Vance, Chief Executive Officer      Alex Morgan`,
      clauses: [
        {
          id: 'c-8-2',
          pageNumber: 4,
          sectionNumber: 'Section 8.2',
          title: 'Unilateral Employer-Selected Arbitrator Clause',
          content: 'Any dispute... shall be resolved exclusively through private, binding arbitration before a single arbitrator selected by the Company.',
          riskLevel: 'high',
          category: 'Dispute Resolution',
          implication: 'Biased dispute mechanism where the Company unilaterally selects the arbitrator, violating mutual arbitrator appointment standards.',
        },
        {
          id: 'c-8-3',
          pageNumber: 4,
          sectionNumber: 'Section 8.3',
          title: 'One-Sided Legal Cost Shifting and Class Action Waiver',
          content: 'In the event Company prevails in any enforcement proceeding, Employee shall reimburse all legal costs and external attorney fees incurred by Company.',
          riskLevel: 'medium',
          category: 'Legal Exposure',
          implication: 'Asymmetric fee shifting: If the company wins, you pay their expensive corporate legal bills. Does not provide reciprocal fee recovery if employee prevails.',
        },
      ],
    },
  ],
};

export const SAMPLE_DOC_B: LegalDocument = {
  id: 'doc-apex-emp-v2',
  title: 'Apex Cloud Technologies — Senior Staff Engineer Employment Agreement (Revised Fair Version)',
  filename: 'Apex_Employment_Agreement_2026_Fair_Negotiated.pdf',
  fileUrl: '/samples/sample-agreement-v2.pdf',
  numPages: 4,
  uploadedAt: '2026-09-22T11:30:00Z',
  documentType: 'employment',
  persona: 'professional',
  parties: ['Apex Cloud Technologies Inc. (Employer)', 'Alex Morgan (Employee)'],
  effectiveDate: 'October 1, 2026',
  jurisdiction: 'Mutual Jurisdiction / Balanced Mediation',
  summary:
    'A revised, modernized, and balanced Senior Staff Engineer employment agreement incorporating fair labor protections: a reciprocal 30-day notice period with employee buyout rights, complete elimination of the training service bond, a narrowed 6-month non-compete with 100% paid garden leave, clear carve-outs for off-hours personal open-source projects, and mutual dispute resolution.',
  pages: [
    {
      pageNumber: 1,
      text: `REVISED EMPLOYMENT AND COLLABORATION AGREEMENT (FAIR STANDARD)
Effective Date: October 1, 2026
Between: APEX CLOUD TECHNOLOGIES INC. ("Company") and ALEX MORGAN ("Employee")

SECTION 1: APPOINTMENT AND PROFESSIONAL ENGAGEMENT
1.1 Title: Senior Staff Software Engineer, Cloud Core Systems.
1.2 Standard Business Hours: Employee shall dedicate customary working hours to Company projects.
1.3 Permitted External Projects: Employee may freely engage in personal programming, non-competing consulting, open-source software contributions, and academic writing outside business hours, provided such activities do not use Company trade secrets or Company-owned equipment.

SECTION 2: COMPENSATION AND EQUITY
2.1 Base Salary: $190,000 per annum, paid monthly.
2.2 Performance Bonus: Target 25% annual bonus, based on mutually agreed and objective performance benchmarks established within thirty (30) days of hiring.
2.3 Equity Incentive: 15,000 Stock Options with 1-year cliff and 4-year vesting.
2.4 Extended Post-Termination Exercise Period: In the event of departure, Employee shall have twenty-four (24) months to exercise vested options. Accelerated vesting of 50% unvested options in the event of a Change of Control.`,
      clauses: [
        {
          id: 'c-v2-1-3',
          pageNumber: 1,
          sectionNumber: 'Section 1.3',
          title: 'Protected Open-Source and Personal Coding Rights',
          content: 'Employee may freely engage in personal programming, non-competing consulting, open-source contributions, and academic writing outside business hours.',
          riskLevel: 'low',
          category: 'Personal Rights',
          implication: 'Fair clause protecting personal hobby projects and open-source activities created on personal time.',
        },
        {
          id: 'c-v2-2-4',
          pageNumber: 1,
          sectionNumber: 'Section 2.4',
          title: '24-Month Extended Option Exercise Window and Change-of-Control Acceleration',
          content: 'Employee shall have twenty-four (24) months to exercise vested options. Accelerated vesting of 50% unvested options in the event of Change of Control.',
          riskLevel: 'low',
          category: 'Equity & Compensation',
          implication: 'Provides 2 full years to exercise vested shares, shielding employee from cash-flow penalties upon resignation.',
        },
      ],
    },
    {
      pageNumber: 2,
      text: `SECTION 3: PROFESSIONAL DEVELOPMENT (NO BOND)
3.1 Training Commitment: Company provides training and conference budgets as normal business investment.
3.2 No Lock-In Period: There shall be no mandatory service lock-in, bond, or liquidated damages clawback of any kind.
3.3 Relocation & Advanced Certification: If Company directly covers documented third-party certification costs exceeding $5,000, reimbursement is pro-rated only if employee leaves within six (6) months, capping at actual direct fees paid.

SECTION 4: INTELLECTUAL PROPERTY CARVE-OUTS
4.1 Inventions Assignment: Employee assigns inventions conceived during business hours or using Company assets.
4.2 Explicit Personal Carve-Out: Company explicitly waives claim over any intellectual property developed by Employee entirely on Employee's own time, without using Company equipment, software, or confidential trade secrets.`,
      clauses: [
        {
          id: 'c-v2-3-2',
          pageNumber: 2,
          sectionNumber: 'Section 3.2',
          title: 'Zero Employment Bond or Punitive Clawbacks',
          content: 'There shall be no mandatory service lock-in, bond, or liquidated damages clawback of any kind.',
          riskLevel: 'low',
          category: 'Financial Freedom',
          implication: 'Completely eliminates the 2-year lock-in and $50,000 penalty found in the previous version.',
        },
        {
          id: 'c-v2-4-2',
          pageNumber: 2,
          sectionNumber: 'Section 4.2',
          title: 'Clean Personal IP Carve-Out',
          content: 'Company explicitly waives claim over any IP developed by Employee entirely on Employee own time without using Company equipment or confidential secrets.',
          riskLevel: 'low',
          category: 'Intellectual Property',
          implication: 'Protects employee independent code, apps, and side ventures from employer ownership claims.',
        },
      ],
    },
    {
      pageNumber: 3,
      text: `SECTION 5: RECIPROCAL TERMINATION AND NOTICE
5.1 Notice Period: Either party may terminate employment by giving thirty (30) calendar days prior written notice.
5.2 Employee Buyout Right: Employee may elect to terminate immediately by paying basic salary for any unserved portion of the thirty-day notice period.
5.3 Severance Upon Involuntary Termination Without Cause: If Company terminates Employee without cause, Company shall pay two (2) months base salary as severance, plus continuation of health benefits.
5.4 Cause Definitions: "Cause" strictly requires intentional felony conviction, active embezzlement, or proven material fraud against Company.

SECTION 6: FAIR RESTRICTIVE COVENANTS
6.1 Narrowed Non-Compete: Restricted for a reasonable period of six (6) months post-separation, limited only to five (5) named direct competitors in cloud storage.
6.2 Paid Garden Leave: During said six (6) month restriction, Company shall pay Employee one hundred percent (100%) of monthly Base Salary as continuing non-compete compensation. If Company ceases payment, non-compete immediately lapses.`,
      clauses: [
        {
          id: 'c-v2-5-1',
          pageNumber: 3,
          sectionNumber: 'Section 5.1 & 5.2',
          title: 'Reciprocal 30-Day Notice Period with Employee Buyout Right',
          content: 'Either party may terminate employment by giving thirty (30) calendar days notice. Employee may elect to terminate immediately by paying basic salary in lieu of notice.',
          riskLevel: 'low',
          category: 'Notice & Transition',
          implication: 'Balanced reciprocal timeline; employee is free to buyout and transition quickly to high-priority opportunities.',
        },
        {
          id: 'c-v2-6-2',
          pageNumber: 3,
          sectionNumber: 'Section 6.2',
          title: '100% Paid Non-Compete with Automatic Lapse Protection',
          content: 'During said six (6) month restriction, Company shall pay Employee one hundred percent (100%) of Base Salary... If Company ceases payment, non-compete immediately lapses.',
          riskLevel: 'low',
          category: 'Restrictive Covenants',
          implication: 'Fair European/German-style non-compete: the company must continue paying full salary during the 6-month restriction, preventing career strangulation.',
        },
      ],
    },
    {
      pageNumber: 4,
      text: `SECTION 7: CONFIDENTIALITY
7.1 Standard Trade Secrets Protection: Five (5) year term for business data, perpetual for technical trade secrets.

SECTION 8: MUTUAL DISPUTE RESOLUTION
8.1 Mediation First: Parties agree to thirty (30) days of good faith commercial mediation prior to legal filings.
8.2 Mutual Arbitrator Appointment: Arbitrator appointed jointly by mutual written consent of both parties.
8.3 Reciprocal Attorney Fees: The prevailing party in any dispute shall be awarded reasonable attorney fees from the non-prevailing party.`,
      clauses: [
        {
          id: 'c-v2-8-2',
          pageNumber: 4,
          sectionNumber: 'Section 8.2 & 8.3',
          title: 'Joint Arbitrator Appointment & Reciprocal Attorney Fees',
          content: 'Arbitrator appointed jointly by mutual written consent. Prevailing party awarded reasonable attorney fees.',
          riskLevel: 'low',
          category: 'Dispute Resolution',
          implication: 'Restores procedural equality: employee participates in arbitrator selection, and company must reimburse employee fees if employee wins.',
        },
      ],
    },
  ],
};

export const SAMPLE_RISK_REPORT_A: RiskAnalysisReport = {
  overallRisk: 'high',
  riskScore: 88,
  executiveVerdict:
    'CRITICAL LEGAL CAUTION: This employment contract contains several clauses heavily weighted in favor of the employer, including an asymmetric 90-day notice period with no employee buyout right, a 2-year service bond enforcing $50,000 / ₹6L liquidated damages, an uncompensated 24-month worldwide non-compete, and total ownership claims over personal off-hours creations.',
  highRiskCount: 6,
  mediumRiskCount: 3,
  lowRiskCount: 1,
  clauses: SAMPLE_DOC_A.pages.flatMap((p) => p.clauses),
  criticalWarnings: [
    'Section 3.1-3.3 imposes a $50,000 / ₹6,00,000 penalty for leaving before 24 months, with employer authority to withhold your earned salary.',
    'Section 6.1 imposes a 24-month worldwide non-compete with ZERO compensation or garden leave salary.',
    'Section 5.1-5.2 forces a 90-day notice period on the employee with no option to buyout, while the employer can fire with 30 days.',
    'Section 4.2 claims all software code and inventions created by you during employment, even on personal laptops outside business hours.',
    'Section 5.4 allows immediate termination with zero severance for subjective failure to meet quarterly KPIs.',
  ],
  recommendedNegotiations: [
    'Demand removal of Section 3 service bond or replace with pro-rated direct third-party training reimbursement only.',
    'Negotiate Section 5.1 notice period down from 90 days to 30 days reciprocal with full employee buyout right.',
    'Limit Section 6.1 non-compete to 6 months with mandatory 100% salary paid garden leave, or strike it out completely.',
    'Insert a clear California Labor Code 2870 style carve-out in Section 4.2 for personal off-hours coding projects.',
    'Extend Section 2.4 stock option exercise window from 30 days to at least 12–24 months post-separation.',
  ],
};

export const SAMPLE_COMPARISON: ContractComparisonResult = {
  docAId: SAMPLE_DOC_A.id,
  docBId: SAMPLE_DOC_B.id,
  titleA: 'Original Standard Agreement (v1)',
  titleB: 'Negotiated Fair Agreement (v2)',
  summary:
    'Version 2 represents a comprehensive de-risking of the employment contract, eliminating punitive financial lock-ins, equalizing notice periods, providing full salary during non-compete restrictions, and protecting personal intellectual property.',
  overallRiskShift: 'lower_risk',
  strategicAdvice: [
    'Version 2 eliminates the $50,000 financial clawback bond entirely (Section 3.2).',
    'Version 2 lowers your notice period commitment from 90 days to 30 days and gives you a buyout right (Section 5.1).',
    'Version 2 turns an unpaid 24-month non-compete into a 6-month non-compete with 100% salary paid garden leave (Section 6.2).',
    'Version 2 protects your open-source projects and personal coding from company claims (Section 1.3 & 4.2).',
    'Version 2 expands stock option exercise runway from 30 days to 24 months (Section 2.4).',
  ],
  differences: [
    {
      category: 'Notice Period',
      term: 'Resignation Notice & Buyout',
      inDocA: '90 days mandatory; employee has NO right to pay salary in lieu of notice.',
      inDocB: '30 days reciprocal; employee has unilateral right to buyout unserved notice.',
      riskDelta: 'improved',
      analysis: 'Notice period dropped by 67%, eliminating career lock-in and allowing smooth transition to new employers.',
      citationA: {
        pageNumber: 3,
        sectionNumber: 'Section 5.1 & 5.2',
        quote: 'Employee may terminate this Agreement only by providing ninety (90) calendar days prior written notice... Employee shall not have any unilateral right to pay salary in lieu of serving the full ninety (90) day notice period.',
        relevanceExplanation: 'Enforces rigid 90-day lock without buyout.',
        riskLevel: 'high',
      },
      citationB: {
        pageNumber: 3,
        sectionNumber: 'Section 5.1 & 5.2',
        quote: 'Either party may terminate employment by giving thirty (30) calendar days prior written notice. Employee may elect to terminate immediately by paying basic salary in lieu of notice.',
        relevanceExplanation: 'Balanced 30 days with full buyout flexibility.',
        riskLevel: 'low',
      },
    },
    {
      category: 'Service Bond',
      term: 'Training Bond & Liquidated Damages',
      inDocA: '24-month mandatory lock-in with $50,000 / ₹6,00,000 penalty and final settlement withholding.',
      inDocB: 'Completely removed. No service lock-in or liquidated damages.',
      riskDelta: 'improved',
      analysis: 'Eliminates massive personal financial liability and risk of final paycheck retention.',
      citationA: {
        pageNumber: 2,
        sectionNumber: 'Section 3.1 & 3.2',
        quote: 'Employee shall immediately pay to the Company, as agreed liquidated damages... the sum of $50,000 (or INR 6,00,000) in lump sum within seven (7) days of separation notice.',
        relevanceExplanation: 'Punitive monetary forfeiture for leaving before 2 years.',
        riskLevel: 'high',
      },
      citationB: {
        pageNumber: 2,
        sectionNumber: 'Section 3.2',
        quote: 'There shall be no mandatory service lock-in, bond, or liquidated damages clawback of any kind.',
        relevanceExplanation: 'Total waiver of employment bonds.',
        riskLevel: 'low',
      },
    },
    {
      category: 'Non-Compete',
      term: 'Post-Employment Restraint Duration & Pay',
      inDocA: '24 months worldwide restraint across all cloud software with $0 compensation.',
      inDocB: '6 months limited to 5 named competitors, with 100% base salary paid monthly.',
      riskDelta: 'improved',
      analysis: 'Transforms an aggressive 2-year career embargo into a fully paid 6-month sabbatical with narrow scope.',
      citationA: {
        pageNumber: 3,
        sectionNumber: 'Section 6.1 & 6.3',
        quote: 'For twenty-four (24) consecutive months... Employee shall not directly or indirectly join any enterprise worldwide... and no garden leave pay shall be paid.',
        relevanceExplanation: 'Uncompensated 2-year global restraint.',
        riskLevel: 'high',
      },
      citationB: {
        pageNumber: 3,
        sectionNumber: 'Section 6.1 & 6.2',
        quote: 'Restricted for a reasonable period of six (6) months... Company shall pay Employee one hundred percent (100%) of monthly Base Salary as continuing non-compete compensation.',
        relevanceExplanation: '100% paid garden leave.',
        riskLevel: 'low',
      },
    },
    {
      category: 'Intellectual Property',
      term: 'Off-Hours Side Projects & Open Source',
      inDocA: 'Company claims all code conceived during employment, even off-hours on personal laptops.',
      inDocB: 'Explicit carve-out: Employee retains 100% ownership of personal projects created on personal time.',
      riskDelta: 'improved',
      analysis: 'Safeguards employee side startups, mobile apps, and open-source contributions.',
      citationA: {
        pageNumber: 2,
        sectionNumber: 'Section 4.2',
        quote: 'This assignment applies comprehensively to all creations made during the term of employment, whether or not conceived during regular business hours, whether or not using Company computers.',
        relevanceExplanation: 'Overbroad claim on personal creations.',
        riskLevel: 'high',
      },
      citationB: {
        pageNumber: 2,
        sectionNumber: 'Section 4.2',
        quote: 'Company explicitly waives claim over any intellectual property developed by Employee entirely on Employee own time without using Company equipment.',
        relevanceExplanation: 'Standard personal IP carve-out.',
        riskLevel: 'low',
      },
    },
    {
      category: 'Stock Options',
      term: 'Post-Termination Exercise Window',
      inDocA: '30 calendar days to exercise all vested options before total forfeiture.',
      inDocB: '24 months extended exercise window plus 50% accelerated vesting upon acquisition.',
      riskDelta: 'improved',
      analysis: 'Extends exercise timeline by 24x, preventing forced forfeiture of earned equity due to sudden tax burdens.',
      citationA: {
        pageNumber: 1,
        sectionNumber: 'Section 2.4',
        quote: 'vested options must be exercised within thirty (30) calendar days of separation, failing which they shall be forfeited back to the Company treasury.',
        relevanceExplanation: 'Aggressive 30-day golden handcuffs trap.',
        riskLevel: 'high',
      },
      citationB: {
        pageNumber: 1,
        sectionNumber: 'Section 2.4',
        quote: 'Employee shall have twenty-four (24) months to exercise vested options. Accelerated vesting of 50% unvested options in the event of a Change of Control.',
        relevanceExplanation: 'Fair 2-year exercise runway.',
        riskLevel: 'low',
      },
    },
  ],
  addedClauses: [
    'Section 1.3: Permitted External Open-Source & Personal Projects',
    'Section 5.3: Mandatory 2-Month Base Salary Severance on Involuntary Termination Without Cause',
    'Section 6.2: 100% Base Salary Paid Garden Leave Protection',
    'Section 8.1: Mandatory 30-Day Pre-Dispute Commercial Mediation',
    'Section 8.3: Bilateral Reciprocal Attorney Fees for Prevailing Party',
  ],
  removedClauses: [
    'Section 3.1 & 3.2: 24-Month Lock-in Period and $50,000 / ₹6,00,000 Liquidated Damages Bond',
    'Section 3.3: Payroll and Earned Wages Withholding Authorization',
    'Section 5.2: Prohibition of Employee Notice Buyout',
    'Section 5.4(b): Immediate Termination for Cause on Subjective Quarterly KPI Shortfalls',
    'Section 8.2: Unilateral Company-Selected Arbitrator Clause',
  ],
  personaPerspective: 'professional',
};

export const SAMPLE_DOC_C: LegalDocument = {
  id: 'doc-cloudscale-msa-v1',
  title: 'CloudScale Data Systems — Enterprise Cloud Infrastructure MSA (Original Vendor Onerous)',
  filename: 'CloudScale_Enterprise_MSA_2026_Standard.pdf',
  fileUrl: '/samples/sample-msa-v1.pdf',
  numPages: 4,
  uploadedAt: '2026-09-23T09:00:00Z',
  documentType: 'vendor',
  persona: 'business',
  parties: [
    'Global Logistics Enterprise Corp. ("Customer")',
    'CloudScale Data Systems Inc. ("Vendor" / "Service Provider")',
  ],
  effectiveDate: 'November 1, 2026',
  jurisdiction: 'Exclusive Jurisdiction of State and Federal Courts in Wilmington, Delaware',
  summary:
    'An enterprise Master Services Agreement (MSA) containing extreme commercial exposure for the technology vendor: uncapped consequential and indirect damages, unilateral uncapped customer indemnification, Net 90 payment cycles with customer withholding rights, aggressive SLA outage deductions (50% monthly invoice clawback), and asymmetric attorney fee recovery.',
  pages: [
    {
      pageNumber: 1,
      text: `MASTER SERVICES AGREEMENT (ENTERPRISE STANDARD)

THIS MASTER SERVICES AGREEMENT is made effective November 1, 2026 (the "Effective Date") by and between:
1. GLOBAL LOGISTICS ENTERPRISE CORP., a Delaware corporation with offices at 1200 Commerce Blvd, Suite 800 ("Customer"); and
2. CLOUDSCALE DATA SYSTEMS INC., a Delaware corporation with offices at 450 Innovation Way ("Vendor").

SECTION 1: SERVICES AND STATEMENTS OF WORK (SOW)
1.1 Engagement: Vendor shall deliver managed distributed database clustering, cloud pipeline synchronization, and high-availability telemetry infrastructure as detailed in Statements of Work executed hereunder.
1.2 Standard of Performance: Vendor warrants that all Services and Deliverables shall strictly conform to Customer specifications and be performed in accordance with highest industry standards without interruption or defect.
1.3 Conflict of Terms: In the event of any conflict between this Agreement and any Statement of Work or Vendor order form, the terms of this Agreement and Customer purchase orders shall unconditionally prevail.

SECTION 2: FEES, INVOICING, AND PAYMENT TERMS
2.1 Payment Term: Customer shall remit undisputed payment within ninety (90) calendar days ("Net 90") following receipt of a valid and correct itemized invoice from Vendor.
2.2 Invoice Submission Window: Vendor must submit all invoices within sixty (60) days of Service delivery. Invoices submitted after 60 days shall be deemed permanently waived and uncollectible.
2.3 Right of Offset and Disputed Withholding: Customer reserves the absolute right to withhold, deduct, and offset against any Vendor invoices any sums claimed by Customer for alleged performance deficiencies, SLA credits, or damages. Disputed sums shall not incur late interest fees.`,
      clauses: [
        {
          id: 'c-msa-2-1',
          pageNumber: 1,
          sectionNumber: 'Section 2.1 & 2.2',
          title: 'Net 90 Extended Payment Terms & Invoicing Forfeiture',
          content: 'Customer shall remit undisputed payment within ninety (90) calendar days ("Net 90")... Invoices submitted after 60 days shall be deemed permanently waived and uncollectible.',
          riskLevel: 'high',
          category: 'Cash Flow & Payment Terms',
          implication: 'Severe working capital strain on Vendor. A 90-day collection cycle strains cash flow, while a 60-day invoice submission forfeiture creates accidental revenue loss risk.',
        },
        {
          id: 'c-msa-2-3',
          pageNumber: 1,
          sectionNumber: 'Section 2.3',
          title: 'Unilateral Fee Withholding and Zero Late Payment Interest',
          content: 'Customer reserves absolute right to withhold, deduct, and offset against any Vendor invoices any sums claimed by Customer... Disputed sums shall not incur late interest fees.',
          riskLevel: 'high',
          category: 'Commercial Dispute Risk',
          implication: 'Customer can freeze operational cash flow indefinitely on unilateral assertion of dissatisfaction, depriving Vendor of immediate revenue.',
        },
      ],
    },
    {
      pageNumber: 2,
      text: `SECTION 3: INTELLECTUAL PROPERTY AND DELIVERABLES
3.1 Customer Ownership: Customer shall exclusively own all right, title, and interest worldwide in and to all Deliverables, code, scripts, configurations, schemas, and documentation developed under this Agreement as a "work made for hire."
3.2 Comprehensive Background IP Transfer: To the extent any pre-existing software, generic utilities, or Vendor background tooling are incorporated into Deliverables, Vendor hereby transfers and assigns full proprietary copyright ownership of such underlying assets to Customer, without reserving reusable core software rights.
3.3 Non-Assertion Covenant: Vendor covenants not to assert any intellectual property right, patent, or proprietary claim against Customer or Customer affiliates for any technology deployed under this Agreement.

SECTION 4: WARRANTIES AND COMPLIANCE
4.1 Absolute Warranty of Continuous Operation: Vendor warrants that the cloud infrastructure shall operate 100% error-free and uninterrupted. Vendor shall promptly cure any defect within four (4) hours at Vendor sole expense.
4.2 Express Warranty of Non-Infringement: Vendor warrants that no Services, software components, open-source libraries, or Deliverables infringe or misappropriate any patent, copyright, trademark, or trade secret of any third party worldwide.`,
      clauses: [
        {
          id: 'c-msa-3-2',
          pageNumber: 2,
          sectionNumber: 'Section 3.2',
          title: 'Overbroad Background IP Forfeiture & Work-for-Hire Assignment',
          content: 'Vendor hereby transfers and assigns full proprietary copyright ownership of such underlying assets to Customer, without reserving reusable core software rights.',
          riskLevel: 'high',
          category: 'Intellectual Property',
          implication: 'Catastrophic IP risk: Vendor risks assigning its own core proprietary software and underlying code libraries to the customer, impairing Vendor ability to service other clients.',
        },
        {
          id: 'c-msa-4-1',
          pageNumber: 2,
          sectionNumber: 'Section 4.1',
          title: 'Unrealistic Zero-Defect Operational Warranty',
          content: 'Vendor warrants that the cloud infrastructure shall operate 100% error-free and uninterrupted. Vendor shall promptly cure any defect within four (4) hours at Vendor sole expense.',
          riskLevel: 'medium',
          category: 'Warranties',
          implication: 'Unrealistic strict liability standard for complex cloud systems. Standard commercial SaaS terms warrant material conformance, not absolute error-free operation.',
        },
      ],
    },
    {
      pageNumber: 3,
      text: `SECTION 5: INDEMNIFICATION AND DEFENSE OF CLAIMS
5.1 Unilateral Vendor Indemnification: Vendor shall defend, indemnify, and hold harmless Customer, its parent, affiliates, directors, officers, employees, and agents from and against any and all third-party claims, demands, liabilities, losses, damages, settlements, judgments, and legal expenses (including full outside attorney fees) arising out of or related to: (a) any alleged breach of this Agreement, (b) any claim of intellectual property infringement, (c) any data security incident, or (d) any act or omission of Vendor or its subcontractors.
5.2 Absence of Customer Reciprocal Indemnity: Customer provides no indemnification to Vendor for Customer data, third-party software furnished by Customer, or Customer contributory negligence.

SECTION 6: LIMITATION OF LIABILITY
6.1 Uncapped Vendor Consequential Damages: IN NO EVENT SHALL CUSTOMER BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES. HOWEVER, THIS EXCLUSION SHALL NOT APPLY TO VENDOR, AND VENDOR SHALL REMAIN FULLY LIABLE FOR ALL CONSEQUENTIAL DAMAGES, LOST PROFITS, LOST REVENUE, AND BUSINESS INTERRUPTION SUFFERED BY CUSTOMER.
6.2 Asymmetric Aggregate Liability Cap: Customer aggregate cumulative liability under this Agreement shall be strictly capped at $1,000. Vendor liability under this Agreement shall be completely uncapped for indemnification, confidentiality breaches, and data security incidents.`,
      clauses: [
        {
          id: 'c-msa-5-1',
          pageNumber: 3,
          sectionNumber: 'Section 5.1 & 5.2',
          title: 'Unilateral Uncapped Customer Indemnification',
          content: 'Vendor shall defend, indemnify, and hold harmless Customer... from all claims, damages, settlements, and legal expenses... Customer provides no indemnification to Vendor.',
          riskLevel: 'high',
          category: 'Indemnification & Exposure',
          implication: 'One-sided indemnity exposes Vendor to existential financial ruin for third-party claims without any reciprocal customer protection or liability containment.',
        },
        {
          id: 'c-msa-6-1',
          pageNumber: 3,
          sectionNumber: 'Section 6.1 & 6.2',
          title: 'Asymmetric Liability Cap & Uncapped Vendor Consequential Damages',
          content: 'VENDOR SHALL REMAIN FULLY LIABLE FOR ALL CONSEQUENTIAL DAMAGES, LOST PROFITS, AND BUSINESS INTERRUPTION... Customer aggregate liability shall be strictly capped at $1,000.',
          riskLevel: 'high',
          category: 'Limitation of Liability',
          implication: 'Fatal enterprise risk: A minor outage could expose Vendor to millions of dollars in claimed customer lost profits, while Customer liability is restricted to a nominal $1,000.',
        },
      ],
    },
    {
      pageNumber: 4,
      text: `SECTION 7: SERVICE LEVEL AGREEMENTS (SLA) AND DOWNTIME CREDITS
7.1 Uptime Requirement: Vendor covenants a monthly Service Availability of 99.99% twenty-four (24) hours per day, excluding scheduled maintenance.
7.2 Severe Penalty Clawback: If availability falls below 99.9% in any calendar month, or if latency exceeds 250ms for more than fifteen (15) consecutive minutes, Customer shall be entitled to an immediate 50% credit reduction of the total monthly billing invoice, without limiting Customer right to terminate for breach.

SECTION 8: TERM, TERMINATION, AND DISPUTE RESOLUTION
8.1 Term: This Agreement commences on the Effective Date and continues for an initial period of thirty-six (36) months.
8.2 Unilateral Customer Termination for Convenience: Customer may terminate this Agreement or any Statement of Work in whole or in part at any time, for any reason or no reason, upon seven (7) days prior written notice, without paying any early termination fee, wind-down cost, or unamortized infrastructure expenditure.
8.3 Vendor Termination Restriction: Vendor shall have no right to terminate for convenience and may terminate only for undisputed non-payment after ninety (90) days written notice and sixty (60) days cure opportunity.
8.4 Governing Law and Forum: Governed exclusively by the laws of Delaware. Any litigation shall be conducted in state or federal court in Wilmington, Delaware. In the event Customer prevails in any litigation, Vendor shall reimburse Customer for all litigation expenses and outside counsel fees.`,
      clauses: [
        {
          id: 'c-msa-7-2',
          pageNumber: 4,
          sectionNumber: 'Section 7.2',
          title: 'Disproportionate 50% Monthly Invoice Penalty for Sub-Second Latency',
          content: 'latency exceeds 250ms for more than 15 minutes, Customer shall be entitled to immediate 50% credit reduction of total monthly billing invoice.',
          riskLevel: 'high',
          category: 'Service Level Agreement',
          implication: 'Draconian SLA penalty: A transient 15-minute network latency spike wipes out 50% of the entire monthly revenue for all infrastructure services.',
        },
        {
          id: 'c-msa-8-2',
          pageNumber: 4,
          sectionNumber: 'Section 8.2',
          title: 'Unilateral 7-Day Customer Termination for Convenience Without Wind-Down',
          content: 'Customer may terminate this Agreement at any time, for any reason... upon seven (7) days prior written notice, without paying any early termination fee or wind-down cost.',
          riskLevel: 'high',
          category: 'Contract Termination',
          implication: 'Customer can cancel on 7 days notice after Vendor provisions dedicated cloud infrastructure, leaving Vendor with heavy unamortized capital and hosting commitments.',
        },
        {
          id: 'c-msa-8-4',
          pageNumber: 4,
          sectionNumber: 'Section 8.4',
          title: 'One-Sided Litigation Fee Shifting in Delaware Courts',
          content: 'In the event Customer prevails in any litigation, Vendor shall reimburse Customer for all litigation expenses and outside counsel fees.',
          riskLevel: 'medium',
          category: 'Legal Dispute',
          implication: 'Asymmetric litigation risk in distant Delaware courts. Forces Vendor to bear litigation risk without reciprocal attorney fee recovery if Vendor successfully defends claims.',
        },
      ],
    },
  ],
};

export const SAMPLE_DOC_D: LegalDocument = {
  id: 'doc-cloudscale-msa-v2',
  title: 'CloudScale Data Systems — Enterprise Cloud Infrastructure MSA (Negotiated Fair B2B Standard)',
  filename: 'CloudScale_Enterprise_MSA_2026_Fair_Negotiated.pdf',
  fileUrl: '/samples/sample-msa-v2.pdf',
  numPages: 4,
  uploadedAt: '2026-09-23T14:30:00Z',
  documentType: 'vendor',
  persona: 'business',
  parties: [
    'Global Logistics Enterprise Corp. ("Customer")',
    'CloudScale Data Systems Inc. ("Vendor" / "Service Provider")',
  ],
  effectiveDate: 'November 1, 2026',
  jurisdiction: 'Neutral Commercial Arbitration (American Arbitration Association - AAA)',
  summary:
    'A balanced, market-standard enterprise Master Services Agreement (MSA) incorporating mutual commercial protections: standard Net 30 payment terms with 15-day dispute notice, retention of vendor background IP with non-exclusive customer license, mutual indemnification for third-party IP claims, aggregate liability capped at 12 months fees with mutual waiver of consequential damages, and tiered SLA credits.',
  pages: [
    {
      pageNumber: 1,
      text: `REVISED MASTER SERVICES AGREEMENT (BALANCED B2B STANDARD)
Effective Date: November 1, 2026
Between: GLOBAL LOGISTICS ENTERPRISE CORP. ("Customer") and CLOUDSCALE DATA SYSTEMS INC. ("Vendor")

SECTION 1: ENGAGEMENT AND STATEMENTS OF WORK
1.1 Scope: Vendor delivers managed distributed database clustering and pipeline sync as agreed in mutually executed SOWs.
1.2 Conformance: Vendor warrants Services perform in all material respects with written specifications.
1.3 Harmonization: Any SOW terms that explicitly reference and amend Agreement provisions shall govern for that SOW.

SECTION 2: INVOICING AND BALANCED PAYMENT TERMS
2.1 Net 30 Terms: Customer shall pay all undisputed invoices within thirty (30) days of receipt ("Net 30").
2.2 Invoice Dispute Procedure: Customer shall notify Vendor in writing within fifteen (15) days of invoice receipt describing any good faith dispute. Undisputed balances shall be paid promptly on schedule.
2.3 Statutory Interest: Overdue undisputed amounts accrue interest at the lesser of 1.0% per month or maximum legal rate.`,
      clauses: [
        {
          id: 'c-v2-msa-2-1',
          pageNumber: 1,
          sectionNumber: 'Section 2.1 & 2.2',
          title: 'Standard Net 30 Payment Terms with 15-Day Dispute Protocol',
          content: 'Customer shall pay all undisputed invoices within thirty (30) days... notify Vendor in writing within 15 days of good faith dispute.',
          riskLevel: 'low',
          category: 'Payment Terms',
          implication: 'Fair commercial standard ensuring healthy cash flow predictability while safeguarding customer right to dispute bona fide errors.',
        },
      ],
    },
    {
      pageNumber: 2,
      text: `SECTION 3: INTELLECTUAL PROPERTY AND LICENSING
3.1 Customer Data and Deliverables: Customer retains all right, title, and interest in Customer Data and custom configuration scripts created uniquely for Customer.
3.2 Vendor Background Technology: Vendor retains all right, title, and ownership in Vendor pre-existing software, generic code libraries, algorithms, architectures, and SaaS platforms ("Background IP").
3.3 Non-Exclusive License: Vendor grants Customer a perpetual, non-exclusive, worldwide license to utilize Background IP embedded in Deliverables solely for Customer internal business operations.

SECTION 4: WARRANTIES AND REMEDIES
4.1 Material Conformance Warranty: Vendor warrants that Services shall substantially conform to published documentation.
4.2 Exclusive Remedy: In the event of material defect, Vendor sole obligation and Customer exclusive remedy is commercially reasonable re-performance or pro-rata fee refund.`,
      clauses: [
        {
          id: 'c-v2-msa-3-2',
          pageNumber: 2,
          sectionNumber: 'Section 3.2 & 3.3',
          title: 'Protection of Vendor Core Background IP & Customer License Grant',
          content: 'Vendor retains all right, title, and ownership in Vendor pre-existing software... Vendor grants Customer perpetual non-exclusive internal license.',
          riskLevel: 'low',
          category: 'Intellectual Property',
          implication: 'Protects Vendor core software assets from forfeiture while delivering full operational autonomy to Customer.',
        },
      ],
    },
    {
      pageNumber: 3,
      text: `SECTION 5: MUTUAL INDEMNIFICATION
5.1 Vendor IP Indemnity: Vendor shall defend and indemnify Customer against direct third-party judgments holding that Vendor software infringes a valid copyright or patent, provided Customer gives prompt written notice.
5.2 Customer Indemnity: Customer shall defend and indemnify Vendor against third-party claims arising from Customer Data or unauthorized modifications.
5.3 Defense Control: Indemnifying party has right to control defense with counsel of its choice.

SECTION 6: MUTUAL LIMITATION OF LIABILITY
6.1 Mutual Consequential Damages Waiver: NEITHER PARTY SHALL BE LIABLE TO THE OTHER FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOSS OF PROFITS, LOSS OF REVENUE, OR DATA LOSS.
6.2 Mutual Aggregate Liability Cap: EXCEPT FOR GROSS NEGLIGENCE OR BREACH OF CONFIDENTIALITY, EACH PARTY TOTAL AGGREGATE LIABILITY ARISING UNDER THIS AGREEMENT SHALL BE STRICTLY LIMITED TO THE TOTAL FEES PAID OR PAYABLE BY CUSTOMER IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.`,
      clauses: [
        {
          id: 'c-v2-msa-5-1',
          pageNumber: 3,
          sectionNumber: 'Section 5.1 & 5.2',
          title: 'Mutual & Symmetrical Intellectual Property Indemnification',
          content: 'Vendor indemnifies Customer against direct IP infringement... Customer indemnifies Vendor against claims arising from Customer Data.',
          riskLevel: 'low',
          category: 'Indemnification',
          implication: 'Balanced reciprocal protection aligning defense obligations with each party respective responsibilities.',
        },
        {
          id: 'c-v2-msa-6-1',
          pageNumber: 3,
          sectionNumber: 'Section 6.1 & 6.2',
          title: 'Mutual Consequential Damages Waiver & 12-Month Liability Cap',
          content: 'NEITHER PARTY SHALL BE LIABLE FOR INDIRECT OR CONSEQUENTIAL DAMAGES... AGGREGATE LIABILITY STRICTLY LIMITED TO FEES PAID IN PRECEDING 12 MONTHS.',
          riskLevel: 'low',
          category: 'Limitation of Liability',
          implication: 'Gold standard B2B commercial risk protection: Caps maximum catastrophic downside for both parties to actual fees paid.',
        },
      ],
    },
    {
      pageNumber: 4,
      text: `SECTION 7: SERVICE LEVEL AGREEMENTS (SLA) AND CREDITS
7.1 Uptime Target: Vendor commits to 99.9% monthly availability, excluding scheduled maintenance windows.
7.2 Tiered Service Credits:
- 99.0% to 99.89%: 5% monthly Service credit.
- 98.0% to 98.99%: 10% monthly Service credit.
- Below 98.0%: 20% monthly Service credit.
Service credits constitute Customer sole and exclusive financial remedy for uptime failures.

SECTION 8: TERMINATION AND DISPUTE RESOLUTION
8.1 Termination for Convenience: Either party may terminate on sixty (60) days written notice. Customer shall reimburse Vendor for Services rendered plus unavoidable committed third-party cloud hosting costs incurred.
8.2 Commercial Arbitration: Disputes unresolved after thirty (30) days executive negotiation shall be resolved by binding arbitration under American Arbitration Association (AAA) Commercial Rules in a neutral forum.
8.3 Bilateral Attorney Fees: The prevailing party in any formal arbitration shall be awarded reasonable outside attorney fees and costs.`,
      clauses: [
        {
          id: 'c-v2-msa-7-2',
          pageNumber: 4,
          sectionNumber: 'Section 7.2',
          title: 'Fair Tiered SLA Credits as Exclusive Remedy',
          content: 'Tiered service credits from 5% to 20%... constitute Customer sole and exclusive financial remedy for uptime failures.',
          riskLevel: 'low',
          category: 'Service Level Agreement',
          implication: 'Fair B2B remedy: Prevents catastrophic revenue loss while providing meaningful accountability for performance.',
        },
        {
          id: 'c-v2-msa-8-1',
          pageNumber: 4,
          sectionNumber: 'Section 8.1 & 8.3',
          title: '60-Day Termination with Wind-Down Coverage & Neutral AAA Arbitration',
          content: 'Either party may terminate on 60 days notice with reimbursement for committed cloud costs... Binding arbitration under AAA Commercial Rules with bilateral attorney fees.',
          riskLevel: 'low',
          category: 'Dispute Resolution & Exit',
          implication: 'Prevents stranded infrastructure costs and guarantees a neutral dispute forum with reciprocal fee recovery.',
        },
      ],
    },
  ],
};

export const SAMPLE_RISK_REPORT_C: RiskAnalysisReport = {
  overallRisk: 'high',
  riskScore: 92,
  executiveVerdict:
    'CRITICAL COMMERCIAL RISK: This Master Services Agreement contains severe B2B enterprise liabilities that threaten corporate solvency. Key red flags include uncapped consequential damages against the Vendor with a nominal $1,000 Customer liability cap, unilateral and uncapped Customer indemnification, Net 90 payment terms with unilateral fee offset rights, and a disproportionate 50% monthly invoice clawback for minor latency fluctuations.',
  highRiskCount: 6,
  mediumRiskCount: 2,
  lowRiskCount: 1,
  clauses: SAMPLE_DOC_C.pages.flatMap((p) => p.clauses),
  criticalWarnings: [
    'Section 6.1 leaves Vendor exposed to uncapped consequential damages and lost profits, while Section 6.2 caps Customer liability at just $1,000.',
    'Section 5.1 forces unilateral and uncapped Vendor indemnification for all third-party claims without any Customer reciprocity.',
    'Section 3.2 transfers ownership of Vendor pre-existing background IP and reusable software utilities to Customer as a work-for-hire.',
    'Section 7.2 imposes an extreme 50% monthly billing penalty for latency exceeding 250ms for more than 15 minutes.',
    'Section 2.1 forces Net 90 payment cycles with Section 2.3 granting Customer unilateral rights to withhold and offset fees without late interest.',
  ],
  recommendedNegotiations: [
    'Insert a mutual waiver of consequential damages and cap aggregate liability at 12 months fees paid under the contract.',
    'Make indemnification strictly mutual and limited to third-party claims of direct intellectual property infringement.',
    'Carve out Vendor pre-existing Background IP and grant Customer a non-exclusive license instead of full copyright assignment.',
    'Replace the 50% SLA penalty with market-standard tiered service credits (5%–20%) as the sole and exclusive financial remedy.',
    'Shorten payment terms to Net 30 and require 15 days written notice for good-faith invoice disputes.',
  ],
  personaPerspective: 'business',
};

export const SAMPLE_COMPARISON_BUSINESS: ContractComparisonResult = {
  docAId: SAMPLE_DOC_C.id,
  docBId: SAMPLE_DOC_D.id,
  titleA: 'Enterprise MSA (Original Vendor Onerous)',
  titleB: 'Enterprise MSA (Negotiated Fair B2B Standard)',
  summary:
    'Version 2 eliminates existential enterprise commercial risks for the technology provider by capping aggregate liability at 12 months fees, introducing mutual consequential damages waivers, protecting vendor background IP, establishing standard Net 30 payment terms, and replacing punitive 50% invoice clawbacks with market-standard tiered SLA credits.',
  overallRiskShift: 'lower_risk',
  strategicAdvice: [
    'Version 2 eliminates uncapped consequential damages and caps total liability at 12 months fees paid (Section 6.1 & 6.2).',
    'Version 2 establishes mutual indemnification for IP infringement, replacing unilateral customer indemnification (Section 5.1 & 5.2).',
    'Version 2 protects Vendor background IP assets and grants a non-exclusive customer license instead of assigning ownership (Section 3.2 & 3.3).',
    'Version 2 converts Net 90 payment terms to Net 30 with structured 15-day dispute notifications (Section 2.1 & 2.2).',
    'Version 2 replaces 50% revenue deductions with structured 5%–20% service credits as the exclusive uptime remedy (Section 7.2).',
  ],
  differences: [
    {
      category: 'Limitation of Liability',
      term: 'Consequential Damages & Aggregate Liability Cap',
      inDocA: 'Vendor uncapped for consequential damages and lost profits; Customer liability capped at $1,000.',
      inDocB: 'Mutual waiver of consequential damages; aggregate liability for both parties capped at 12 months fees paid.',
      riskDelta: 'improved',
      analysis: 'Shields Vendor from catastrophic lost profit claims and restores symmetrical liability limits.',
      citationA: {
        pageNumber: 3,
        sectionNumber: 'Section 6.1 & 6.2',
        quote: 'VENDOR SHALL REMAIN FULLY LIABLE FOR ALL CONSEQUENTIAL DAMAGES, LOST PROFITS... Customer liability capped at $1,000.',
        relevanceExplanation: 'Severe asymmetric liability exposure.',
        riskLevel: 'high',
      },
      citationB: {
        pageNumber: 3,
        sectionNumber: 'Section 6.1 & 6.2',
        quote: 'NEITHER PARTY SHALL BE LIABLE FOR INDIRECT OR CONSEQUENTIAL DAMAGES... AGGREGATE LIABILITY STRICTLY LIMITED TO FEES PAID IN PRECEDING 12 MONTHS.',
        relevanceExplanation: 'Market-standard mutual liability cap.',
        riskLevel: 'low',
      },
    },
    {
      category: 'Indemnification',
      term: 'Third-Party Claims Defense & Scope',
      inDocA: 'Unilateral Vendor indemnity for all claims; zero Customer indemnity for Customer Data.',
      inDocB: 'Mutual indemnity: Vendor indemnifies for software IP infringement; Customer indemnifies for Customer Data.',
      riskDelta: 'improved',
      analysis: 'Equalizes risk allocation and protects Vendor against claims originating from customer-furnished data.',
      citationA: {
        pageNumber: 3,
        sectionNumber: 'Section 5.1 & 5.2',
        quote: 'Vendor shall defend, indemnify, and hold harmless Customer... Customer provides no indemnification to Vendor.',
        relevanceExplanation: 'One-sided indemnification obligation.',
        riskLevel: 'high',
      },
      citationB: {
        pageNumber: 3,
        sectionNumber: 'Section 5.1 & 5.2',
        quote: 'Vendor indemnifies Customer against direct IP infringement... Customer indemnifies Vendor against claims arising from Customer Data.',
        relevanceExplanation: 'Reciprocal indemnity provisions.',
        riskLevel: 'low',
      },
    },
    {
      category: 'Intellectual Property',
      term: 'Background IP Ownership vs Licensing',
      inDocA: 'Vendor assigns full proprietary copyright in pre-existing Background IP to Customer.',
      inDocB: 'Vendor retains 100% ownership in Background IP; grants Customer perpetual non-exclusive license.',
      riskDelta: 'improved',
      analysis: 'Prevents customer from claiming exclusive ownership of Vendor core technology platform and utilities.',
      citationA: {
        pageNumber: 2,
        sectionNumber: 'Section 3.2',
        quote: 'Vendor hereby transfers and assigns full proprietary copyright ownership of such underlying assets to Customer.',
        relevanceExplanation: 'Loss of core reusable intellectual property.',
        riskLevel: 'high',
      },
      citationB: {
        pageNumber: 2,
        sectionNumber: 'Section 3.2 & 3.3',
        quote: 'Vendor retains all right, title, and ownership in Vendor pre-existing software... Vendor grants Customer perpetual non-exclusive license.',
        relevanceExplanation: 'Safe retention of core software assets.',
        riskLevel: 'low',
      },
    },
    {
      category: 'Cash Flow & Payment',
      term: 'Payment Terms & Dispute Withholding',
      inDocA: 'Net 90 payment cycle with 60-day invoice waiver forfeiture and unilateral customer fee offset.',
      inDocB: 'Net 30 payment cycle with 15-day dispute window and prompt payment of undisputed balances.',
      riskDelta: 'improved',
      analysis: 'Shortens collection cycle by 60 days and eliminates arbitrary invoice withholding.',
      citationA: {
        pageNumber: 1,
        sectionNumber: 'Section 2.1 & 2.3',
        quote: 'Customer shall remit undisputed payment within ninety (90) calendar days ("Net 90")... Customer reserves absolute right to withhold and offset.',
        relevanceExplanation: 'Extremely prolonged payment timeline and offset risk.',
        riskLevel: 'high',
      },
      citationB: {
        pageNumber: 1,
        sectionNumber: 'Section 2.1 & 2.2',
        quote: 'Customer shall pay all undisputed invoices within thirty (30) days... notify Vendor in writing within 15 days of good faith dispute.',
        relevanceExplanation: 'Predictable Net 30 commercial standard.',
        riskLevel: 'low',
      },
    },
  ],
  addedClauses: [
    'Section 3.2: Express Vendor Background IP Retention and Customer Non-Exclusive License',
    'Section 5.2: Reciprocal Customer Data Indemnification Protection',
    'Section 6.1: Mutual Consequential Damages and Lost Profits Waiver',
    'Section 6.2: 12-Month Contract Value Aggregate Liability Cap for Both Parties',
    'Section 8.2: Neutral Binding Arbitration under AAA Commercial Rules',
  ],
  removedClauses: [
    'Section 2.2: 60-Day Invoice Submission Waiver and Forfeiture Clause',
    'Section 2.3: Unilateral Customer Right to Offset and Withhold Disputed Fees',
    'Section 3.2: Comprehensive Assignment of Vendor Pre-Existing Background IP',
    'Section 6.1: Uncapped Vendor Consequential Damages Exposure',
    'Section 7.2: Punitive 50% Monthly Invoice Penalty for 15-Minute Latency Dips',
  ],
  personaPerspective: 'business',
};

export const BENCHMARK_DOCUMENTS: LegalDocument[] = [
  SAMPLE_DOC_A,
  SAMPLE_DOC_B,
  SAMPLE_DOC_C,
  SAMPLE_DOC_D,
];

