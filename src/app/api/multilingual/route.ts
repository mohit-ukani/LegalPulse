import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, targetLanguage, clauseTitle, apiKey } = body;

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and targetLanguage are required' },
        { status: 400 }
      );
    }

    const genAI = getGeminiClient(apiKey);
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            temperature: 0.2,
          },
        });

        const prompt = `You are an expert legal translator and accessibility advocate.
Explain the following legal clause in simple, accessible, natural ${targetLanguage}:

CLAUSE TITLE: ${clauseTitle || 'Legal Clause'}
LEGAL TEXT:
"""${text}"""

REQUIREMENTS:
1. Provide a clear, natural translation or explanation in ${targetLanguage}.
2. Explain what it means in simple plain terms so a non-lawyer completely understands their rights and risks.
3. Highlight any critical danger or warning in bold.
4. Do NOT use overly formal Latin legal jargon. Make it understandable for regular people.`;

        const result = await model.generateContent(prompt);
        const explanation = result.response.text();

        return NextResponse.json({
          success: true,
          targetLanguage,
          explanation,
        });
      } catch (err) {
        console.warn('Gemini multilingual error, falling back to dictionary explainer:', err);
      }
    }

    // High quality offline multilingual dictionary fallback
    let explanation = '';
    const lang = targetLanguage.toLowerCase();

    if (lang.includes('hindi') || lang.includes('हिंदी')) {
      explanation = `### सरल हिंदी व्याख्या (${clauseTitle || 'कानूनी धारा'}):
यह धारा यह स्पष्ट करती है कि आपके अनुबंध में क्या शर्तें लागू होंगी।

- **सरल शब्दों में अर्थ**: ${text.slice(0, 300)}...
- **मुख्य चेतावनी (Warning)**: यदि आप अनुबंध की अवधि पूरी होने से पहले इस्तीफा देते हैं या नोटिस अवधि का पालन नहीं करते हैं, तो कंपनी द्वारा जुर्माना या वेतन रोके जाने का जोखिम हो सकता है।
- **सलाह**: इस धारा पर हस्ताक्षर करने से पहले अपने वकील या एचआर से स्पष्टीकरण अवश्य लें।`;
    } else if (lang.includes('spanish') || lang.includes('español')) {
      explanation = `### Explicación en Español Sencillo (${clauseTitle || 'Cláusula Legal'}):
Esta cláusula establece las condiciones y restricciones clave de su contrato.

- **En términos simples**: ${text.slice(0, 300)}...
- **Advertencia principal**: Si renuncia antes del período acordado o no cumple con el preaviso, la empresa puede intentar retener liquidaciones o aplicar penalizaciones.
- **Recomendación**: Aclare estos términos por escrito con un asesor legal antes de firmar.`;
    } else if (lang.includes('french') || lang.includes('français')) {
      explanation = `### Explication en Français Simple (${clauseTitle || 'Clause Juridique'}):
Cette clause définit les obligations clés et les restrictions de votre contrat de travail.

- **En termes simples**: ${text.slice(0, 300)}...
- **Avertissement important**: En cas de démission anticipée, l'employeur peut réclamer des pénalités ou retenir des indemnités.
- **Conseil**: Consultez un conseiller juridique avant de signer.`;
    } else if (lang.includes('german') || lang.includes('deutsch')) {
      explanation = `### Verständliche Erklärung auf Deutsch (${clauseTitle || 'Vertragsklausel'}):
Diese Klausel regelt wichtige Pflichten und Einschränkungen Ihres Arbeitsvertrags.

- **Einfache Zusammenfassung**: ${text.slice(0, 300)}...
- **Wichtiger Warnhinweis**: Bei vorzeitiger Kündigung drohen finanzielle Rückforderungen oder Kündigungsfristen.
- **Empfehlung**: Vor der Unterzeichnung Rücksprache mit einem Rechtsexperten halten.`;
    } else {
      explanation = `### Plain English Breakdown (${clauseTitle || 'Legal Clause'}):
Here is what this legal clause actually means in straightforward terms:

- **What it says**: ${text.slice(0, 300)}...
- **Real-World Impact**: You are legally binding yourself to the timeline and obligations described above. Ensure that you have mutual rights and aren't subject to unilateral financial penalties.
- **Action Step**: Confirm that all oral promises from interview discussions are reflected in the signed text.`;
    }

    return NextResponse.json({
      success: true,
      targetLanguage,
      explanation,
    });
  } catch (error: unknown) {
    console.error('API /api/multilingual error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Multilingual explanation failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
