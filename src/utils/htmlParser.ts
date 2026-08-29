import { transformAsciiAndDiagramsToHtml, hasAsciiArtOrDiagram } from './asciiTransformer';

/**
 * Converts Plain Text or Markdown into clean semantic HTML
 */
export function convertTextOrMarkdownToHtml(text: string): string {
  if (!text || text.trim() === '') {
    return '<p></p>';
  }

  // Pre-process text to transform any ASCII tables, comparison diagrams, or flowcharts into clean HTML blocks
  const processedText = hasAsciiArtOrDiagram(text)
    ? transformAsciiAndDiagramsToHtml(text)
    : text;

  // If text already looks like full HTML (starts with tags like <p>, <h1>, <div>, <table>, <!DOCTYPE, etc.)
  const trimmed = processedText.trim();
  if (
    trimmed.startsWith('<') &&
    (trimmed.includes('</') || trimmed.includes('/>') || trimmed.startsWith('<!DOCTYPE'))
  ) {
    return sanitizeAndEnhanceHtml(trimmed);
  }

  // Simple and robust Markdown to HTML parser
  const lines = processedText.split(/\r?\n/);
  let html = '';
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const closeListIfOpen = () => {
    if (inList && listType) {
      html += `</${listType}>\n`;
      inList = false;
      listType = null;
    }
  };

  const flushTableIfOpen = () => {
    if (inTable && tableRows.length > 0) {
      html += '<table style="width: 100%; border-collapse: collapse; margin: 12pt 0;">\n';
      const isHeader = tableRows.length > 1;
      tableRows.forEach((row, rowIndex) => {
        // Skip separator row (like |---|---|)
        if (row.every((cell) => /^[-:\s]+$/.test(cell))) {
          return;
        }

        if (rowIndex === 0 && isHeader) {
          html += '  <thead>\n    <tr>\n';
          row.forEach((cell) => {
            html += `      <th style="padding: 8pt 10pt; text-align: left;">${formatInlineMarkdown(cell.trim())}</th>\n`;
          });
          html += '    </tr>\n  </thead>\n  <tbody>\n';
        } else {
          html += '    <tr>\n';
          row.forEach((cell) => {
            html += `      <td style="padding: 8pt 10pt;">${formatInlineMarkdown(cell.trim())}</td>\n`;
          });
          html += '    </tr>\n';
        }
      });
      if (isHeader) {
        html += '  </tbody>\n';
      }
      html += '</table>\n';
      inTable = false;
      tableRows = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Direct HTML block inserted by ASCII transformer or custom tags
    if (trimmedLine.startsWith('<div class="comparison-diagram"') ||
        trimmedLine.startsWith('<div class="flowchart-diagram"') ||
        trimmedLine.startsWith('<div class="part-banner"') ||
        trimmedLine.startsWith('<div class="priority-box"') ||
        trimmedLine.startsWith('<div class="grid-table-wrapper"') ||
        trimmedLine.startsWith('<div class="page-break"')) {
      closeListIfOpen();
      flushTableIfOpen();
      html += trimmedLine + '\n';
      continue;
    }

    // Page break markers: <!-- pagebreak -->, [pagebreak], --- PAGE BREAK ---
    if (/<!--\s*pagebreak\s*-->|\[pagebreak\]|---+\s*PAGE\s*BREAK\s*---+|\\pagebreak/i.test(trimmedLine)) {
      closeListIfOpen();
      flushTableIfOpen();
      html += '<div class="page-break" style="page-break-before: always; break-before: page;"></div>\n';
      continue;
    }

    // Code blocks ```
    if (trimmedLine.startsWith('```')) {
      closeListIfOpen();
      flushTableIfOpen();
      if (inCodeBlock) {
        const rawCode = codeBuffer.join('\n');
        if (hasAsciiArtOrDiagram(rawCode)) {
          html += transformAsciiAndDiagramsToHtml(rawCode) + '\n';
        } else {
          html += `<pre><code>${rawCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>\n`;
        }
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Markdown Table lines (e.g. | Col 1 | Col 2 |)
    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
      closeListIfOpen();
      inTable = true;
      const cells = trimmedLine
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableRows.push(cells);
      continue;
    } else {
      flushTableIfOpen();
    }

    // Empty line
    if (trimmedLine === '') {
      closeListIfOpen();
      continue;
    }

    // Headings
    if (trimmedLine.startsWith('###### ')) {
      closeListIfOpen();
      html += `<h6>${formatInlineMarkdown(trimmedLine.slice(7))}</h6>\n`;
    } else if (trimmedLine.startsWith('##### ')) {
      closeListIfOpen();
      html += `<h5>${formatInlineMarkdown(trimmedLine.slice(6))}</h5>\n`;
    } else if (trimmedLine.startsWith('#### ')) {
      closeListIfOpen();
      html += `<h4>${formatInlineMarkdown(trimmedLine.slice(5))}</h4>\n`;
    } else if (trimmedLine.startsWith('### ')) {
      closeListIfOpen();
      html += `<h3>${formatInlineMarkdown(trimmedLine.slice(4))}</h3>\n`;
    } else if (trimmedLine.startsWith('## ')) {
      closeListIfOpen();
      html += `<h2>${formatInlineMarkdown(trimmedLine.slice(3))}</h2>\n`;
    } else if (trimmedLine.startsWith('# ')) {
      closeListIfOpen();
      // Chapter / Major Heading check
      const headingText = trimmedLine.slice(2);
      const isChapterOrPart = /^CHAPTER\s+\d+|^PART\s+[I|V|X|\d]+|^TABLE OF CONTENTS/i.test(headingText.trim());
      if (isChapterOrPart) {
        html += `<div class="page-break" style="page-break-before: always; break-before: page;"></div>\n`;
      }
      html += `<h1>${formatInlineMarkdown(headingText)}</h1>\n`;
    } else if (trimmedLine === '---' || trimmedLine === '***' || trimmedLine === '___') {
      closeListIfOpen();
      html += '<hr />\n';
    } else if (trimmedLine.startsWith('> ')) {
      closeListIfOpen();
      html += `<blockquote><p>${formatInlineMarkdown(trimmedLine.slice(2))}</p></blockquote>\n`;
    } else if (/^[-*+]\s+/.test(trimmedLine)) {
      if (!inList || listType !== 'ul') {
        closeListIfOpen();
        html += '<ul>\n';
        inList = true;
        listType = 'ul';
      }
      const itemContent = trimmedLine.replace(/^[-*+]\s+/, '');
      html += `  <li>${formatInlineMarkdown(itemContent)}</li>\n`;
    } else if (/^\d+\.\s+/.test(trimmedLine)) {
      if (!inList || listType !== 'ol') {
        closeListIfOpen();
        html += '<ol>\n';
        inList = true;
        listType = 'ol';
      }
      const itemContent = trimmedLine.replace(/^\d+\.\s+/, '');
      html += `  <li>${formatInlineMarkdown(itemContent)}</li>\n`;
    } else {
      closeListIfOpen();
      // If line is starting with "CHAPTER X:" or "PART I:" as plain text, elevate it
      if (/^CHAPTER\s+\d+:|^CHAPITRE\s+\d+:/i.test(trimmedLine)) {
        html += `<div class="page-break" style="page-break-before: always; break-before: page;"></div>\n<h2>${formatInlineMarkdown(trimmedLine)}</h2>\n`;
      } else {
        html += `<p>${formatInlineMarkdown(trimmedLine)}</p>\n`;
      }
    }
  }

  closeListIfOpen();
  flushTableIfOpen();

  if (inCodeBlock && codeBuffer.length > 0) {
    const rawCode = codeBuffer.join('\n');
    if (hasAsciiArtOrDiagram(rawCode)) {
      html += transformAsciiAndDiagramsToHtml(rawCode) + '\n';
    } else {
      html += `<pre><code>${rawCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>\n`;
    }
  }

  return sanitizeAndEnhanceHtml(html);
}

/**
 * Parses inline bold, italic, code, links
 */
export function formatInlineMarkdown(text: string): string {
  let res = text;
  // Bold & Italic ***text*** or ___text___
  res = res.replace(/(\*\*\*|___)(.*?)\1/g, '<strong><em>$2</em></strong>');
  // Bold **text** or __text__
  res = res.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
  // Italic *text* or _text_
  res = res.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
  // Strike ~~text~~
  res = res.replace(/~~(.*?)~~/g, '<del>$1</del>');
  // Inline Code `text`
  res = res.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Links [text](url)
  res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  return res;
}

/**
 * Sanitizes HTML and replaces any <pre> blocks or raw text containing ASCII diagrams
 * with clean converted HTML components.
 */
export function sanitizeAndEnhanceHtml(html: string): string {
  if (!html) return html;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 1. Inspect all <pre> elements: if they contain ASCII tables/diagrams, replace them!
    const preElements = Array.from(doc.querySelectorAll('pre'));
    preElements.forEach((pre) => {
      const text = pre.textContent || '';
      if (hasAsciiArtOrDiagram(text)) {
        const converted = transformAsciiAndDiagramsToHtml(text);
        const tempContainer = doc.createElement('div');
        tempContainer.innerHTML = converted;
        pre.replaceWith(...Array.from(tempContainer.childNodes));
      }
    });

    // 2. Ensure page breaks have proper styling classes
    const pageBreakDivs = Array.from(doc.querySelectorAll('.page-break, [style*="page-break"]'));
    pageBreakDivs.forEach((pb) => {
      pb.classList.add('page-break');
      (pb as HTMLElement).style.pageBreakBefore = 'always';
      (pb as HTMLElement).style.breakBefore = 'page';
    });

    return doc.body.innerHTML;
  } catch {
    return html;
  }
}

/**
 * Extracts a suggested document title from HTML content
 */
export function extractDocumentTitle(html: string, defaultTitle: string = 'Document'): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const h1 = doc.querySelector('h1');
    if (h1 && h1.textContent?.trim()) {
      return h1.textContent.trim();
    }
    const h2 = doc.querySelector('h2');
    if (h2 && h2.textContent?.trim()) {
      return h2.textContent.trim();
    }
    const firstP = doc.querySelector('p');
    if (firstP && firstP.textContent?.trim()) {
      const pText = firstP.textContent.trim();
      return pText.length > 40 ? pText.substring(0, 40) + '...' : pText;
    }
  } catch {
    // fallback
  }
  return defaultTitle;
}

/**
 * Formats/indents HTML nicely for editing
 */
export function prettifyHtml(html: string): string {
  try {
    let formatted = '';
    let indent = 0;
    const tab = '  ';

    // Normalize whitespace
    const cleanHtml = html
      .replace(/>\s+</g, '><')
      .replace(/<br\s*\/?>/gi, '<br/>\n')
      .trim();

    const tokens = cleanHtml.split(/(<[^>]+>)/g).filter(Boolean);

    for (const token of tokens) {
      if (token.startsWith('</')) {
        indent = Math.max(0, indent - 1);
        formatted += '\n' + tab.repeat(indent) + token;
      } else if (token.startsWith('<') && !token.startsWith('<!') && !token.endsWith('/>')) {
        // Self-closing tags check
        const isSelfClosing = /^<(hr|br|img|input|meta|link)/i.test(token);
        formatted += '\n' + tab.repeat(indent) + token;
        if (!isSelfClosing && !token.startsWith('<!--')) {
          indent++;
        }
      } else if (token.startsWith('<') && (token.endsWith('/>') || /^<(hr|br|img)/i.test(token))) {
        formatted += '\n' + tab.repeat(indent) + token;
      } else {
        const text = token.trim();
        if (text) {
          formatted += text;
        }
      }
    }

    return formatted.trim();
  } catch {
    return html;
  }
}
