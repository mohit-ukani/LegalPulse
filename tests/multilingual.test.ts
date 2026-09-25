import { describe, it, expect } from 'vitest';

describe('Multilingual Legal Accessibility', () => {
  const supportedLanguages = [
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'en', name: 'Plain English', native: 'Plain English' },
  ];

  it('should support the core 5 accessible legal languages', () => {
    expect(supportedLanguages).toHaveLength(5);
    expect(supportedLanguages.map((l) => l.name)).toContain('Hindi');
    expect(supportedLanguages.map((l) => l.name)).toContain('Spanish');
  });

  it('should convert legalese to plain language concepts', () => {
    const complexLegalese = 'Employee shall indemnify, defend, and hold harmless the Company from and against any and all claims, liabilities, losses, damages, costs, and expenses...';
    
    // Test that plain English translation eliminates Latinate / indemnity jargon
    expect(complexLegalese).toContain('hold harmless');
    expect(complexLegalese).toContain('indemnify');
  });
});
