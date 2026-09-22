import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOC_A_PAGES = [
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
  },
  {
    pageNumber: 3,
    text: `SECTION 5: TERMINATION AND NOTICE PERIOD
5.1 Voluntary Resignation by Employee: The Employee may terminate this Agreement only by providing ninety (90) calendar days prior written notice to the Company Management.
5.2 No Buyout Right for Employee: The Employee shall not have any unilateral right to pay salary in lieu of serving the full ninety (90) day notice period. The Company reserves the sole prerogative to require the Employee to actively perform transition duties for the entirety of the 90 days.
5.3 Termination by Company Without Cause: The Company may terminate Employee's service at any time without cause upon thirty (30) days notice or by paying thirty (30) days basic salary in lieu of notice.
5.4 Termination for Cause: The Company may terminate this Agreement immediately with zero notice and zero severance upon the occurrence of: (a) any breach of Company policies, (b) failure to attain quarterly Key Performance Indicators (KPIs) set by management, (c) unexcused absence exceeding three (3) days, or (d) any action deemed detrimental by the Board to the Company's business interests.
5.5 Garden Leave: During any notice period, the Company may in its sole discretion relieve the Employee of all operational duties, prohibit entry to Company premises, and disable network credentials.

SECTION 6: RESTRICTIVE COVENANTS AND NON-COMPETE
6.1 Non-Competition Period and Territory: For a period of twenty-four (24) consecutive months following the termination or cessation of employment for any reason whatsoever, the Employee shall not, directly or indirectly, own, manage, join, consult with, provide services to, or become employed by any business, enterprise, or entity worldwide that develops, sells, licenses, or operates cloud infrastructure, distributed virtualization, Kubernetes tooling, or developer workflow software.
6.2 Non-Solicitation of Customers and Employees: For twenty-four (24) months post-separation, Employee shall not solicit or hire any employee, contractor, or customer of the Company.
6.3 No Consideration for Post-Termination Restraint: The Employee acknowledges that the Base Salary paid during active employment constitutes complete, valid, and adequate consideration for the restrictive covenants in this Section 6, and no garden leave pay or post-termination salary shall be paid during the 24-month non-compete restraint period.`,
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
9.1 Entire Agreement: This document represents the entire understanding between the parties and supersedes all prior verbal representations or offer letters.
9.2 Severability: If any provision of this Agreement is held invalid, remaining provisions continue in full effect.

IN WITNESS WHEREOF, the parties hereto have executed this Employment Agreement:
FOR APEX CLOUD TECHNOLOGIES INC.:          EMPLOYEE:
Marcus Vance, Chief Executive Officer     Alex Morgan`,
  },
];

const DOC_B_PAGES = [
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
  },
  {
    pageNumber: 4,
    text: `SECTION 7: CONFIDENTIALITY
7.1 Standard Trade Secrets Protection: Five (5) year term for business data, perpetual for technical trade secrets.

SECTION 8: MUTUAL DISPUTE RESOLUTION
8.1 Mediation First: Parties agree to thirty (30) days of good faith commercial mediation prior to legal filings.
8.2 Mutual Arbitrator Appointment: Arbitrator appointed jointly by mutual written consent of both parties.
8.3 Reciprocal Attorney Fees: The prevailing party in any dispute shall be awarded reasonable attorney fees from the non-prevailing party.

IN WITNESS WHEREOF, the parties hereto have executed this Negotiated Agreement:
FOR APEX CLOUD TECHNOLOGIES INC.:          EMPLOYEE:
Marcus Vance, Chief Executive Officer     Alex Morgan`,
  },
];

async function createLegalPdf(docTitle, pagesData, outputPath) {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  for (let i = 0; i < pagesData.length; i++) {
    const pageData = pagesData[i];
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions
    const { width, height } = page.getSize();
    const margin = 48;

    // Header bar
    page.drawRectangle({
      x: 0,
      y: height - 36,
      width: width,
      height: 36,
      color: rgb(0.1, 0.14, 0.22),
    });

    page.drawText('LEGAL CONTRACT ARCHIVE · CONFIDENTIAL & LEGALLY BINDING', {
      x: margin,
      y: height - 23,
      size: 7.5,
      font: fontBold,
      color: rgb(0.85, 0.9, 0.95),
    });

    page.drawText(`PAGE ${i + 1} OF ${pagesData.length}`, {
      x: width - margin - 55,
      y: height - 23,
      size: 7.5,
      font: fontBold,
      color: rgb(0.85, 0.9, 0.95),
    });

    let yPosition = height - 60;

    if (i === 0) {
      page.drawText(docTitle.toUpperCase(), {
        x: margin,
        y: yPosition,
        size: 11,
        font: fontBold,
        color: rgb(0.08, 0.12, 0.2),
      });
      yPosition -= 18;

      page.drawLine({
        start: { x: margin, y: yPosition },
        end: { x: width - margin, y: yPosition },
        thickness: 1.2,
        color: rgb(0.2, 0.3, 0.45),
      });
      yPosition -= 18;
    }

    const lines = pageData.text.split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        yPosition -= 6;
        continue;
      }

      if (yPosition < 50) break;

      const isHeading =
        line.startsWith('SECTION') ||
        line.startsWith('EMPLOYMENT') ||
        line.startsWith('REVISED') ||
        line.startsWith('IN WITNESS');

      const isSubclause = /^\d+\.\d+/.test(line);

      if (isHeading) {
        yPosition -= 4;
        page.drawText(line, {
          x: margin,
          y: yPosition,
          size: 9.5,
          font: fontBold,
          color: rgb(0.12, 0.18, 0.3),
        });
        yPosition -= 13;
      } else if (isSubclause) {
        const words = line.split(' ');
        let currentLine = '';
        let isFirst = true;

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const textWidth = fontRegular.widthOfTextAtSize(testLine, 8.5);
          if (textWidth > width - margin * 2) {
            page.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: 8.5,
              font: isFirst ? fontBold : fontRegular,
              color: rgb(0.15, 0.15, 0.18),
            });
            yPosition -= 11;
            currentLine = word;
            isFirst = false;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine && yPosition >= 50) {
          page.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: 8.5,
            font: fontRegular,
            color: rgb(0.15, 0.15, 0.18),
          });
          yPosition -= 12;
        }
      } else {
        const words = line.split(' ');
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const textWidth = fontRegular.widthOfTextAtSize(testLine, 8);
          if (textWidth > width - margin * 2) {
            page.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: 8,
              font: fontRegular,
              color: rgb(0.2, 0.22, 0.26),
            });
            yPosition -= 10.5;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine && yPosition >= 50) {
          page.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: 8,
            font: fontRegular,
            color: rgb(0.2, 0.22, 0.26),
          });
          yPosition -= 11;
        }
      }
    }

    // Footer
    page.drawLine({
      start: { x: margin, y: 35 },
      end: { x: width - margin, y: 35 },
      thickness: 0.5,
      color: rgb(0.7, 0.75, 0.8),
    });

    page.drawText('LEGALPULSE GROUNDED CITATION AUDIT TRAIL · POWERED BY GEMINI', {
      x: margin,
      y: 24,
      size: 7,
      font: fontOblique,
      color: rgb(0.45, 0.5, 0.55),
    });
  }

  const pdfBytes = await pdfDoc.save();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Successfully generated: ${outputPath} (${pdfBytes.length} bytes)`);
}

const publicDir = path.join(__dirname, '..', 'public', 'samples');

async function main() {
  await createLegalPdf(
    'Apex Cloud Technologies — Senior Staff Engineer Employment Agreement (Original)',
    DOC_A_PAGES,
    path.join(publicDir, 'sample-agreement-v1.pdf')
  );

  await createLegalPdf(
    'Apex Cloud Technologies — Senior Staff Engineer Employment Agreement (Revised Fair Version)',
    DOC_B_PAGES,
    path.join(publicDir, 'sample-agreement-v2.pdf')
  );
}

main().catch(console.error);
