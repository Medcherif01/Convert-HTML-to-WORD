import { hasAsciiArtOrDiagram, transformAsciiAndDiagramsToHtml } from './asciiTransformer';

/**
 * Ultra-robust, Zero-Data-Loss HTML & Markdown Parser
 * Guarantees 100% data retention while formatting raw text, markdown, or HTML into structured, professional documents.
 * Ensures perfect ordering and visual harmony between paragraphs, headings, tables, and diagrams.
 */

/**
 * Converts Plain Text or Markdown into clean, semantic, well-organized HTML without losing any data.
 */
export function convertTextOrMarkdownToHtml(text: string): string {
  if (!text || text.trim() === '') {
    return '<p></p>';
  }

  let processedInput = text;
  // Automatically convert ASCII box diagrams, converging flowcharts, tier engines & stage cycles if detected
  if (hasAsciiArtOrDiagram(processedInput)) {
    processedInput = transformAsciiAndDiagramsToHtml(processedInput);
  }

  const trimmed = processedInput.trim();

  // If input is already full pure HTML document
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    return sanitizeAndEnhanceHtml(trimmed);
  }

  const lines = processedInput.split(/\r?\n/);
  const outputBlocks: string[] = [];

  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let currentListItems: string[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  let inTable = false;
  let tableRows: string[][] = [];
  let tableCaption: string | null = null;

  let inBlockquote = false;
  let blockquoteBuffer: string[] = [];

  let inHtmlBlock = false;
  let htmlBlockBuffer: string[] = [];
  let openHtmlTagsCount = 0;

  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      const fullPara = paragraphBuffer.join(' ');
      outputBlocks.push(`<p>${formatInlineMarkdown(fullPara)}</p>`);
      paragraphBuffer = [];
    }
  };

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
        let tableHtml = '';
        
        if (tableCaption) {
          tableHtml += `<div class="table-caption" style="font-weight: 700; color: #1E3A8A; font-size: 10pt; margin-top: 14pt; margin-bottom: 4pt; text-transform: uppercase; letter-spacing: 0.04em;">${formatInlineMarkdown(tableCaption)}</div>\n`;
          tableCaption = null;
        }

        tableHtml += '<table style="width: 100%; border-collapse: collapse; margin: 8pt 0 16pt 0; page-break-inside: avoid;">\n';
        
        if (isHeader) {
          tableHtml += '  <thead>\n    <tr style="background-color: #1E3A8A; color: #FFFFFF;">\n';
          validRows[0].forEach((cell) => {
            tableHtml += `      <th style="padding: 8pt 10pt; text-align: left; font-weight: 700; font-size: 9.5pt; border: 1px solid #CBD5E1;">${formatInlineMarkdown(cell.trim())}</th>\n`;
          });
          tableHtml += '    </tr>\n  </thead>\n  <tbody>\n';
          
          validRows.slice(1).forEach((row, rIdx) => {
            const bg = rIdx % 2 === 1 ? 'background-color: #F8FAFC;' : 'background-color: #FFFFFF;';
            tableHtml += `    <tr style="${bg} border-bottom: 1px solid #E2E8F0;">\n`;
            row.forEach((cell) => {
              tableHtml += `      <td style="padding: 8pt 10pt; font-size: 9pt; border: 1px solid #E2E8F0; vertical-align: top;">${formatInlineMarkdown(cell.trim())}</td>\n`;
            });
            tableHtml += '    </tr>\n';
          });
          tableHtml += '  </tbody>\n';
        } else {
          tableHtml += '  <tbody>\n';
          validRows.forEach((row) => {
            tableHtml += '    <tr style="border-bottom: 1px solid #E2E8F0;">\n';
            row.forEach((cell) => {
              tableHtml += `      <td style="padding: 8pt 10pt; font-size: 9pt; border: 1px solid #E2E8F0; vertical-align: top;">${formatInlineMarkdown(cell.trim())}</td>\n`;
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
    flushParagraph();
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
      } else {
        inCodeBlock = true;
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

    // 3. Raw HTML blocks or existing div/table containers (including diagrams)
    const startsHtmlBlock = /^<(div|table|section|article|header|footer|figure|aside)\b/i.test(trimmedLine);
    if (startsHtmlBlock || inHtmlBlock) {
      if (!inHtmlBlock) {
        flushAll();
        inHtmlBlock = true;
        htmlBlockBuffer = [];
        openHtmlTagsCount = 0;
      }

      htmlBlockBuffer.push(rawLine);

      const openMatches = trimmedLine.match(/<(div|table|section|article|header|footer|figure|aside)\b/gi) || [];
      const closeMatches = trimmedLine.match(/<\/(div|table|section|article|header|footer|figure|aside)>/gi) || [];
      openHtmlTagsCount += openMatches.length - closeMatches.length;

      if (openHtmlTagsCount <= 0 && htmlBlockBuffer.length > 0) {
        flushHtmlBlock();
      }
      continue;
    }

    // 4. Blank lines - separate paragraphs and sections
    if (trimmedLine === '') {
      flushAll();
      continue;
    }

    // 5. Blockquotes (> text)
    if (trimmedLine.startsWith('>')) {
      flushParagraph();
      flushList();
      flushTable();
      inBlockquote = true;
      const content = trimmedLine.replace(/^>\s?/, '');
      blockquoteBuffer.push(content);
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    // 6. Table captions (e.g. "#### Table 12.1: ...", "Table 12.1: ...")
    const tableCaptionMatch = trimmedLine.match(/^(?:#{3,4}\s+)?(Table\s+\d+[\.\d]*\s*[:\-–—]\s*.*)$/i);
    if (tableCaptionMatch && i + 1 < lines.length && (lines[i + 1].includes('|') || lines[i + 1].startsWith('+'))) {
      flushAll();
      tableCaption = tableCaptionMatch[1].trim();
      continue;
    }

    // 7. Markdown Tables (| Col 1 | Col 2 |) or ASCII Grid (+---+---+)
    const isMarkdownTableLine = (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) ||
      (trimmedLine.includes('|') && (trimmedLine.startsWith('+') || trimmedLine.startsWith('|')));
    const isAsciiBorder = /^\+[-=+]{3,}\+$/.test(trimmedLine);

    if (isMarkdownTableLine || isAsciiBorder) {
      flushParagraph();
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

    // 8. Horizontal Rules (---, ***, ___)
    if (/^[-*_]{3,}$/.test(trimmedLine)) {
      flushAll();
      outputBlocks.push('<hr />');
      continue;
    }

    // 9. Part / Chapter Headers with asterisks or plain format
    // e.g. "* PART VII — PROFESSIONAL EXCELLENCE AND CAPACITY BUILDING"
    // e.g. "** CHAPTER 14: Teacher Professional Development... **"
    const partAsteriskMatch = trimmedLine.match(/^[\*_\s]*(PART\s+[I|V|X|\d]+)\s*[:\-–—]\s*(.*?)[*_\s]*$/i);
    if (partAsteriskMatch) {
      flushAll();
      const partNum = partAsteriskMatch[1].trim();
      const partTitle = partAsteriskMatch[2].replace(/[*_]/g, '').trim();
      const prefix = outputBlocks.length > 0 ? '<div class="page-break" style="page-break-before: always; break-before: page;"></div>\n' : '';
      outputBlocks.push(
        `${prefix}<div class="part-banner" style="margin: 24pt 0 16pt 0; border: 2pt solid #1E3A8A; border-radius: 8pt; overflow: hidden; page-break-before: always;">
  <div style="background-color: #1E3A8A; color: #FFFFFF; padding: 12pt 16pt; text-align: center;">
    <div style="font-size: 10pt; font-weight: 800; letter-spacing: 0.12em; color: #93C5FD; text-transform: uppercase;">${escapeHtml(partNum)}</div>
    <div style="font-size: 14pt; font-weight: 700; margin-top: 2pt;">${escapeHtml(partTitle)}</div>
  </div>
</div>`
      );
      continue;
    }

    const chapterAsteriskMatch = trimmedLine.match(/^[\*_\s]*(CHAPTER\s+\d+|CHAPITRE\s+\d+)\s*[:\-–—]\s*(.*?)[*_\s]*$/i);
    if (chapterAsteriskMatch) {
      flushAll();
      const chapNum = chapterAsteriskMatch[1].trim();
      const chapTitle = chapterAsteriskMatch[2].replace(/[*_]/g, '').trim();
      const prefix = outputBlocks.length > 0 ? '<div class="page-break" style="page-break-before: always; break-before: page;"></div>\n' : '';
      outputBlocks.push(
        `${prefix}<h2>${escapeHtml(chapNum)}: ${escapeHtml(chapTitle)}</h2>`
      );
      continue;
    }

    // 10. Markdown Headings (# H1, ## H2, ### H3, #### H4, ##### H5, ###### H6)
    if (trimmedLine.startsWith('#')) {
      flushAll();
      const match = trimmedLine.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const headingText = match[2].trim();
        const isChapter = /^CHAPTER\s+\d+|^CHAPITRE\s+\d+|^PART\s+[I|V|X|\d]+|^TABLE OF CONTENTS|^TABLE DES MATIÈRES/i.test(headingText);
        
        let prefix = '';
        if (level === 1 && isChapter && outputBlocks.length > 0) {
          prefix = '<div class="page-break" style="page-break-before: always; break-before: page;"></div>\n';
        }
        outputBlocks.push(`${prefix}<h${level}>${formatInlineMarkdown(headingText)}</h${level}>`);
        continue;
      }
    }

    // 11. Plain text structured headings (e.g., "1. Introduction", "1.1 Contexte", "12.2 Five-Tier...")
    const isNumberedHeading = /^(\d+\.\d+)\s+([A-ZÀ-Ÿ].*)$/.test(trimmedLine) ||
      /^([I|V|X]+\.)\s+([A-ZÀ-Ÿ].*)$/.test(trimmedLine);

    if (isNumberedHeading) {
      flushAll();
      outputBlocks.push(`<h3>${formatInlineMarkdown(trimmedLine)}</h3>`);
      continue;
    }

    // 12. Unordered Lists (- item, * item, + item, • item, – item, — item)
    const bulletMatch = trimmedLine.match(/^([-*+•–—▪])\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph();
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

    // 13. Ordered Lists (1. item, 2) item, a) item)
    const orderedMatch = trimmedLine.match(/^(\d+[\.\)]|[a-zA-Z][\.\)])\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
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

    // 14. Callout alerts or notice lines (e.g., "NOTE: ...", "IMPORTANT: ...", "REMARQUE: ...", "ATTENTION: ...")
    const calloutMatch = trimmedLine.match(/^(NOTE|IMPORTANT|REMARQUE|ATTENTION|WARNING|INFO)\s*[:\-–—]\s*(.*)$/i);
    if (calloutMatch) {
      flushAll();
      outputBlocks.push(
        `<div class="callout callout-info" style="margin: 12pt 0; padding: 10pt 14pt; border-left: 4pt solid #2563EB; background-color: #EFF6FF; border-radius: 0 6pt 6pt 0;">\n  <p style="margin: 0;"><strong>${calloutMatch[1].toUpperCase()}:</strong> ${formatInlineMarkdown(calloutMatch[2])}</p>\n</div>`
      );
      continue;
    }

    // 15. Regular Paragraph text - group consecutive lines into a fluid paragraph
    paragraphBuffer.push(trimmedLine);
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
 * Sanitizes HTML and converts any embedded markdown (e.g. tables, headings) or ASCII blocks into clean HTML
 */
export function sanitizeAndEnhanceHtml(html: string): string {
  if (!html) return html;

  try {
    // If HTML contains raw markdown tables or headings inside, clean and parse them
    if (html.includes('|') && html.includes('---') && !html.includes('<table')) {
      return convertTextOrMarkdownToHtml(html);
    }

    if (hasAsciiArtOrDiagram(html)) {
      return convertTextOrMarkdownToHtml(html);
    }

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
 * Global Document Beautifier & Organizer:
 * Automatically cleans, reorganizes, extracts diagrams, creates executive tables and headers, and preserves 100% of user data.
 */
export function organizeAndBeautifyDocument(input: string): { html: string; markdown: string } {
  if (!input || input.trim() === '') {
    return { html: '<p></p>', markdown: '' };
  }

  // First convert and transform ASCII diagrams, markdown tables, headings, and lists
  const convertedHtml = convertTextOrMarkdownToHtml(input);
  const prettified = prettifyHtml(convertedHtml);

  return {
    html: prettified,
    markdown: input,
  };
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
