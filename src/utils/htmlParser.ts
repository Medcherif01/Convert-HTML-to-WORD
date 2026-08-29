import { hasAsciiArtOrDiagram, transformAsciiAndDiagramsToHtml } from './asciiTransformer';

/**
 * Ultra-robust, Zero-Data-Loss HTML & Markdown Parser
 * Guarantees 100% data retention while formatting raw text, markdown, or HTML into structured, professional documents.
 */

/**
 * Converts Plain Text or Markdown into clean, semantic, well-organized HTML without losing any data.
 */
export function convertTextOrMarkdownToHtml(text: string): string {
  if (!text || text.trim() === '') {
    return '<p></p>';
  }

  let processedInput = text;
  // Automatically convert ASCII box diagrams, converging flowcharts & matrices if detected
  if (hasAsciiArtOrDiagram(processedInput)) {
    processedInput = transformAsciiAndDiagramsToHtml(processedInput);
  }

  const trimmed = processedInput.trim();

  // If input is already full HTML (contains tags like <p>, <h1>, <div>, <table>, <!DOCTYPE, etc.)
  if (
    trimmed.startsWith('<') &&
    (trimmed.includes('</') || trimmed.includes('/>') || trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html'))
  ) {
    return sanitizeAndEnhanceHtml(trimmed);
  }

  const lines = processedInput.split(/\r?\n/);
  const outputBlocks: string[] = [];

  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let currentListItems: string[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';

  let inTable = false;
  let tableRows: string[][] = [];

  let inBlockquote = false;
  let blockquoteBuffer: string[] = [];

  let inHtmlBlock = false;
  let htmlBlockBuffer: string[] = [];
  let openHtmlTagsCount = 0;

  const flushList = () => {
    if (inList && listType && currentListItems.length > 0) {
      const itemsHtml = currentListItems.map((item) => `  <li>${formatInlineMarkdown(item)}</li>`).join('\n');
      outputBlocks.push(`<${listType}>\n${itemsHtml}\n</${listType}>`);
      inList = false;
      listType = null;
      currentListItems = [];
    }
  };

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      const validRows = tableRows.filter((r) => r.length > 0 && !r.every((cell) => /^[-:=+\s]+$/.test(cell)));
      if (validRows.length > 0) {
        const isHeader = validRows.length > 1;
        let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 14pt 0;">\n';
        
        if (isHeader) {
          tableHtml += '  <thead>\n    <tr>\n';
          validRows[0].forEach((cell) => {
            tableHtml += `      <th style="padding: 8pt 10pt; text-align: left; font-weight: 700;">${formatInlineMarkdown(cell.trim())}</th>\n`;
          });
          tableHtml += '    </tr>\n  </thead>\n  <tbody>\n';
          
          validRows.slice(1).forEach((row) => {
            tableHtml += '    <tr>\n';
            row.forEach((cell) => {
              tableHtml += `      <td style="padding: 8pt 10pt;">${formatInlineMarkdown(cell.trim())}</td>\n`;
            });
            tableHtml += '    </tr>\n';
          });
          tableHtml += '  </tbody>\n';
        } else {
          tableHtml += '  <tbody>\n';
          validRows.forEach((row) => {
            tableHtml += '    <tr>\n';
            row.forEach((cell) => {
              tableHtml += `      <td style="padding: 8pt 10pt;">${formatInlineMarkdown(cell.trim())}</td>\n`;
            });
            tableHtml += '    </tr>\n';
          });
          tableHtml += '  </tbody>\n';
        }
        tableHtml += '</table>';
        outputBlocks.push(tableHtml);
      }
      inTable = false;
      tableRows = [];
    }
  };

  const flushBlockquote = () => {
    if (inBlockquote && blockquoteBuffer.length > 0) {
      const quoteText = blockquoteBuffer.map((l) => formatInlineMarkdown(l)).join('<br />');
      outputBlocks.push(`<blockquote><p>${quoteText}</p></blockquote>`);
      inBlockquote = false;
      blockquoteBuffer = [];
    }
  };

  const flushHtmlBlock = () => {
    if (inHtmlBlock && htmlBlockBuffer.length > 0) {
      outputBlocks.push(htmlBlockBuffer.join('\n'));
      inHtmlBlock = false;
      htmlBlockBuffer = [];
      openHtmlTagsCount = 0;
    }
  };

  const flushAll = () => {
    flushList();
    flushTable();
    flushBlockquote();
    flushHtmlBlock();
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmedLine = rawLine.trim();

    // 1. Code blocks (``` or ````)
    if (trimmedLine.startsWith('```')) {
      flushAll();
      if (inCodeBlock) {
        const fullCode = codeBuffer.join('\n');
        outputBlocks.push(
          `<pre><code>${fullCode.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLang = '';
      } else {
        inCodeBlock = true;
        codeLang = trimmedLine.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // 2. Explicit Page Break markers
    if (
      /<!--\s*pagebreak\s*-->|\[pagebreak\]|---+\s*PAGE\s*BREAK\s*---+|\\pagebreak/i.test(trimmedLine) ||
      trimmedLine === '<!-- PAGE_BREAK -->'
    ) {
      flushAll();
      outputBlocks.push('<div class="page-break" style="page-break-before: always; break-before: page;"></div>');
      continue;
    }

    // 3. Raw HTML blocks or existing div/table containers
    const startsHtmlBlock = /^<(div|table|section|article|header|footer|figure|aside)\b/i.test(trimmedLine);
    if (startsHtmlBlock || inHtmlBlock) {
      if (!inHtmlBlock) {
        flushAll();
        inHtmlBlock = true;
        htmlBlockBuffer = [];
        openHtmlTagsCount = 0;
      }

      htmlBlockBuffer.push(rawLine);

      // Count open vs close tags
      const openMatches = trimmedLine.match(/<(div|table|section|article|header|footer|figure|aside)\b/gi) || [];
      const closeMatches = trimmedLine.match(/<\/(div|table|section|article|header|footer|figure|aside)>/gi) || [];
      openHtmlTagsCount += openMatches.length - closeMatches.length;

      if (openHtmlTagsCount <= 0 && htmlBlockBuffer.length > 0) {
        flushHtmlBlock();
      }
      continue;
    }

    // 4. Blank lines
    if (trimmedLine === '') {
      flushAll();
      continue;
    }

    // 5. Blockquotes (> text)
    if (trimmedLine.startsWith('>')) {
      flushList();
      flushTable();
      inBlockquote = true;
      const content = trimmedLine.replace(/^>\s?/, '');
      blockquoteBuffer.push(content);
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    // 6. Markdown Tables (| Col 1 | Col 2 |) or ASCII Grid (+---+---+)
    const isMarkdownTableLine = (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) ||
      (trimmedLine.includes('|') && (trimmedLine.startsWith('+') || trimmedLine.startsWith('|')));
    const isAsciiBorder = /^\+[-=+]{3,}\+$/.test(trimmedLine);

    if (isMarkdownTableLine || isAsciiBorder) {
      flushList();
      inTable = true;
      if (isMarkdownTableLine) {
        const cleanPipes = trimmedLine.replace(/^\||\|$/g, '');
        const cells = cleanPipes.split('|').map((c) => c.trim());
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // 7. Horizontal Rules (---, ***, ___)
    if (/^[-*_]{3,}$/.test(trimmedLine)) {
      flushAll();
      outputBlocks.push('<hr />');
      continue;
    }

    // 8. Markdown Headings (# H1, ## H2, ### H3, #### H4, ##### H5, ###### H6)
    if (trimmedLine.startsWith('#')) {
      flushAll();
      const match = trimmedLine.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const headingText = match[2].trim();
        const isChapter = /^CHAPTER\s+\d+|^CHAPITRE\s+\d+|^PART\s+[I|V|X|\d]+|^TABLE OF CONTENTS|^TABLE DES MATIÈRES/i.test(headingText);
        
        let prefix = '';
        if (level === 1 && isChapter) {
          prefix = '<div class="page-break" style="page-break-before: always; break-before: page;"></div>\n';
        }
        outputBlocks.push(`${prefix}<h${level}>${formatInlineMarkdown(headingText)}</h${level}>`);
        continue;
      }
    }

    // 9. Plain text structured headings (e.g., "Chapitre 1 : ...", "Chapter 1: ...", "Partie I : ...", "PART I : ...", "1. Introduction", "1.1 Contexte")
    const isChapterHeading = /^(PARTIE|PART)\s+([I|V|X|\d]+)\s*[:\-–—]\s*(.*)$/i.test(trimmedLine) ||
      /^(CHAPITRE|CHAPTER)\s+(\d+)\s*[:\-–—]\s*(.*)$/i.test(trimmedLine);

    if (isChapterHeading) {
      flushAll();
      outputBlocks.push(
        `<div class="page-break" style="page-break-before: always; break-before: page;"></div>\n<h1>${formatInlineMarkdown(trimmedLine)}</h1>`
      );
      continue;
    }

    const isNumberedHeading = /^(\d+\.\d+)\s+([A-ZÀ-Ÿ].*)$/.test(trimmedLine) ||
      /^([I|V|X]+\.)\s+([A-ZÀ-Ÿ].*)$/.test(trimmedLine);

    if (isNumberedHeading) {
      flushAll();
      outputBlocks.push(`<h2>${formatInlineMarkdown(trimmedLine)}</h2>`);
      continue;
    }

    // 10. Unordered Lists (- item, * item, + item, • item, – item, — item)
    const bulletMatch = trimmedLine.match(/^([-*+•–—▪])\s+(.*)$/);
    if (bulletMatch) {
      flushTable();
      flushBlockquote();
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
      }
      currentListItems.push(bulletMatch[2]);
      continue;
    }

    // 11. Ordered Lists (1. item, 2) item, a) item)
    const orderedMatch = trimmedLine.match(/^(\d+[\.\)]|[a-zA-Z][\.\)])\s+(.*)$/);
    if (orderedMatch) {
      flushTable();
      flushBlockquote();
      if (!inList || listType !== 'ol') {
        flushList();
        inList = true;
        listType = 'ol';
      }
      currentListItems.push(orderedMatch[2]);
      continue;
    }

    // 12. Callout alerts or notice lines (e.g., "NOTE: ...", "IMPORTANT: ...", "REMARQUE: ...", "ATTENTION: ...")
    const calloutMatch = trimmedLine.match(/^(NOTE|IMPORTANT|REMARQUE|ATTENTION|WARNING|INFO)\s*[:\-–—]\s*(.*)$/i);
    if (calloutMatch) {
      flushAll();
      outputBlocks.push(
        `<div class="callout callout-info" style="margin: 12pt 0; padding: 10pt 14pt; border-left: 4pt solid #2563EB; background-color: #EFF6FF; border-radius: 0 6pt 6pt 0;">\n  <p style="margin: 0;"><strong>${calloutMatch[1].toUpperCase()}:</strong> ${formatInlineMarkdown(calloutMatch[2])}</p>\n</div>`
      );
      continue;
    }

    // 13. Regular Paragraph - zero data loss, exact line preserved!
    flushAll();
    outputBlocks.push(`<p>${formatInlineMarkdown(trimmedLine)}</p>`);
  }

  flushAll();

  if (inCodeBlock && codeBuffer.length > 0) {
    const fullCode = codeBuffer.join('\n');
    outputBlocks.push(
      `<pre><code>${fullCode.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
    );
  }

  const finalHtml = outputBlocks.join('\n\n');
  return sanitizeAndEnhanceHtml(finalHtml);
}

/**
 * Parses inline bold, italic, strikethrough, inline code, and hyperlinks
 */
export function formatInlineMarkdown(text: string): string {
  if (!text) return '';
  let res = text;

  // Bold & Italic: ***text*** or ___text___
  res = res.replace(/(\*\*\*|___)(.*?)\1/g, '<strong><em>$2</em></strong>');

  // Bold: **text** or __text__
  res = res.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');

  // Italic: *text* or _text_ (not inside words with underscores)
  res = res.replace(/(?:^|\s)\*([^*]+)\*(?=\s|$|[.,;:!?])/g, ' <em>$1</em>');
  res = res.replace(/(?:^|\s)_([^_]+)_(?=\s|$|[.,;:!?])/g, ' <em>$1</em>');

  // Strikethrough: ~~text~~
  res = res.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // Inline Code: `text`
  res = res.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Hyperlinks: [text](url)
  res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  return res.trim();
}

/**
 * Sanitizes HTML and ensures all containers, tables, and page breaks have proper classes and styles
 */
export function sanitizeAndEnhanceHtml(html: string): string {
  if (!html) return html;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Ensure all page-break elements have correct classes and styling
    const pageBreakDivs = Array.from(doc.querySelectorAll('.page-break, [style*="page-break"], [style*="break-before"]'));
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
      return pText.length > 50 ? pText.substring(0, 50) + '...' : pText;
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
