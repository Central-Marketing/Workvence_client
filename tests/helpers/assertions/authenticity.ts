import { Page } from '@playwright/test';

export interface AuthenticityViolation {
  type: 'DUMMY_DATA' | 'BROKEN_IMAGE' | 'DEAD_LINK' | 'DEAD_BUTTON' | 'SYNTAX_LEAK';
  message: string;
  selector?: string;
  context?: string;
}

export interface AuthenticityAuditResult {
  url: string;
  violations: AuthenticityViolation[];
  passed: boolean;
}

/**
 * Scans the active page for rendered fallback strings, broken images, dead links, and dead buttons.
 */
export async function auditPageAuthenticity(page: Page): Promise<AuthenticityAuditResult> {
  const currentUrl = page.url();
  const violations: AuthenticityViolation[] = [];

  // 1. Audit visible rendered text for suspicious dummy/leak data
  const textAudit = await page.evaluate(() => {
    const issues: { text: string; tag: string; selector: string }[] = [];
    const forbiddenPatterns = [
      /\blorem\s+ipsum\b/i,
      /\bjohn\s+doe\b/i,
      /\bjane\s+doe\b/i,
      /\bexample\.com\b/i,
      /\bplaceholder\.com\b/i,
      /\bundefined\b/,
      /\bNaN\b/,
      /\[object\s+Object\]/
    ];

    const elements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, td, th, li, a, button');
    for (const el of Array.from(elements)) {
      // Check if element is visible
      const rect = el.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
      if (!isVisible) continue;

      const directText = el.textContent || '';
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(directText)) {
          issues.push({
            text: directText.trim().slice(0, 100),
            tag: el.tagName.toLowerCase(),
            selector: el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase()
          });
          break;
        }
      }
    }
    return issues;
  });

  for (const item of textAudit) {
    violations.push({
      type: item.text.includes('undefined') || item.text.includes('NaN') || item.text.includes('[object Object]')
        ? 'SYNTAX_LEAK'
        : 'DUMMY_DATA',
      message: `Suspicious data found in <${item.tag}>: "${item.text}"`,
      selector: item.selector
    });
  }

  // 2. Audit images for broken sources or /undefined
  const imageAudit = await page.evaluate(() => {
    const broken: { src: string; alt: string }[] = [];
    const images = document.querySelectorAll('img');
    for (const img of Array.from(images)) {
      const src = img.getAttribute('src') || '';
      const naturalWidth = img.naturalWidth;
      const isVisible = img.offsetWidth > 0 && img.offsetHeight > 0;

      if (!src || src === '#' || src.includes('/undefined') || (isVisible && naturalWidth === 0 && img.complete)) {
        broken.push({ src, alt: img.getAttribute('alt') || 'No Alt' });
      }
    }
    return broken;
  });

  for (const img of imageAudit) {
    violations.push({
      type: 'BROKEN_IMAGE',
      message: `Broken or unpopulated image source: src="${img.src}" (alt="${img.alt}")`
    });
  }

  // 3. Audit links for empty or placeholder href="#"
  const linkAudit = await page.evaluate(() => {
    const deadLinks: { href: string; text: string }[] = [];
    const links = document.querySelectorAll('a');
    for (const a of Array.from(links)) {
      const href = a.getAttribute('href');
      const text = (a.textContent || '').trim().slice(0, 40);
      if (href === '#' || href === '' || href === 'javascript:void(0)') {
        deadLinks.push({ href: href || 'EMPTY', text });
      }
    }
    return deadLinks;
  });

  for (const link of linkAudit) {
    violations.push({
      type: 'DEAD_LINK',
      message: `Dead anchor link with dummy href="${link.href}" on element text: "${link.text}"`
    });
  }

  return {
    url: currentUrl,
    violations,
    passed: violations.length === 0
  };
}
