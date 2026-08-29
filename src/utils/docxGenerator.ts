import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  PageNumber,
  PageBreak,
  AlignmentType,
  HeadingLevel,
  UnderlineType,
  BorderStyle,
  WidthType,
  convertMillimetersToTwip,
  ExternalHyperlink,
  Packer,
  TabStopType,
  TabStopPosition,
  PageOrientation as DocxPageOrientation,
} from 'docx';
import { saveAs } from 'file-saver';
import { DocumentSettings } from '../types';

/**
 * Strips leading hash and normalizes hex color code for docx (e.g. #1E3A8A -> 1E3A8A)
 */
function cleanHex(color?: string, fallback: string = '000000'): string {
  if (!color) return fallback.replace(/^#/, '');
  const c = color.trim().replace(/^#/, '');
  if (c.length === 3) {
    return c
      .split('')
      .map((x) => x + x)
      .join('');
  }
  return c || fallback;
}

/**
 * Main DOCX Generator from HTML and Settings
 */
export async function generateDocxBlob(htmlContent: string, settings: DocumentSettings): Promise<Blob> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const body = doc.body;

  // Page Dimensions
  // A4: 210mm x 297mm
  let pageW = 210;
  let pageH = 297;
  if (settings.pageSize === 'Letter') {
    pageW = 215.9;
    pageH = 279.4;
  } else if (settings.pageSize === 'Legal') {
    pageW = 215.9;
    pageH = 355.6;
  }

  const isLandscape = settings.orientation === 'landscape';
  const widthTwip = convertMillimetersToTwip(isLandscape ? pageH : pageW);
  const heightTwip = convertMillimetersToTwip(isLandscape ? pageW : pageH);

  const marginTopTwip = convertMillimetersToTwip(settings.margins.top);
  const marginBottomTwip = convertMillimetersToTwip(settings.margins.bottom);
  const marginLeftTwip = convertMillimetersToTwip(settings.margins.left);
  const marginRightTwip = convertMillimetersToTwip(settings.margins.right);

  // Available page width between margins in twip
  const printableWidthTwip = widthTwip - marginLeftTwip - marginRightTwip;

  // Parse HTML elements into docx elements
  const childrenElements: (Paragraph | Table)[] = [];

  for (let i = 0; i < body.childNodes.length; i++) {
    const node = body.childNodes[i];
    const isFirst = childrenElements.length === 0;
    const parsed = parseNode(node, settings, printableWidthTwip, isFirst);
    if (parsed) {
      if (Array.isArray(parsed)) {
        childrenElements.push(...parsed);
      } else {
        childrenElements.push(parsed);
      }
    }
  }

  // If no content parsed, add at least one empty paragraph to avoid docx corruption
  if (childrenElements.length === 0) {
    childrenElements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Empty document.',
            font: settings.typography.bodyFont,
          }),
        ],
      })
    );
  }

  // Construct Header
  const headersConfig: Record<string, Header> = {};
  if (settings.headerFooter.enableHeader) {
    const headerChildren: Paragraph[] = [];
    const leftText = settings.headerFooter.headerLeft.trim();
    const rightText = settings.headerFooter.headerRight.trim();
    const centerText = settings.headerFooter.headerCenter.trim();

    const runs: TextRun[] = [];

    if (leftText) {
      runs.push(
        new TextRun({
          text: leftText,
          font: settings.typography.bodyFont,
          size: 18, // 9pt
          color: cleanHex(settings.theme.textMuted, '64748B'),
        })
      );
    }

    if (centerText) {
      runs.push(
        new TextRun({
          text: '\t' + centerText,
          font: settings.typography.bodyFont,
          size: 18,
          color: cleanHex(settings.theme.textMuted, '64748B'),
        })
      );
    }

    if (rightText) {
      runs.push(
        new TextRun({
          text: '\t' + rightText,
          font: settings.typography.bodyFont,
          size: 18,
          color: cleanHex(settings.theme.textMuted, '64748B'),
        })
      );
    }

    headerChildren.push(
      new Paragraph({
        children: runs.length > 0 ? (runs as TextRun[]) : [new TextRun({ text: ' ' })],
        tabStops: [
          {
            type: TabStopType.CENTER,
            position: Math.round(printableWidthTwip / 2),
          },
          {
            type: TabStopType.RIGHT,
            position: printableWidthTwip,
          },
        ],
        border: settings.headerFooter.headerShowDivider
          ? {
              bottom: {
                color: cleanHex(settings.headerFooter.headerDividerColor, 'CBD5E1'),
                size: 6,
                style: BorderStyle.SINGLE,
                space: 4,
              },
            }
          : undefined,
        spacing: {
          after: 140,
        },
      })
    );

    headersConfig.default = new Header({
      children: headerChildren,
    });
  }

  // Construct Footer with Dynamic Page Numbers
  const footersConfig: Record<string, Footer> = {};
  if (settings.headerFooter.enableFooter) {
    const footerChildren: Paragraph[] = [];
    const leftText = settings.headerFooter.footerLeft.trim();
    const centerText = settings.headerFooter.footerCenter.trim();

    const footerRuns: TextRun[] = [];

    if (leftText) {
      footerRuns.push(
        new TextRun({
          text: leftText,
          font: settings.typography.bodyFont,
          size: 18, // 9pt
          color: cleanHex(settings.theme.textMuted, '64748B'),
        })
      );
    }

    if (centerText) {
      footerRuns.push(
        new TextRun({
          text: '\t' + centerText,
          font: settings.typography.bodyFont,
          size: 18,
          color: cleanHex(settings.theme.textMuted, '64748B'),
        })
      );
    }

    // Right side: dynamic page numbering
    const rightType = settings.headerFooter.footerRightType;
    if (rightType === 'page-x-of-y') {
      footerRuns.push(
        new TextRun({
          text: '\tPage ',
          font: settings.typography.bodyFont,
          size: 18,
          color: cleanHex(settings.theme.textMuted, '64748B'),
        }),
        new TextRun({
          children: [PageNumber.CURRENT],
          font: settings.typography.bodyFont,
          size: 18,
          color: cleanHex(settings.theme.textMuted, '64748B'),
        }),
        new TextRun({
          text: ' of ',
          font: settings.typography.bodyFont,
          size: 18,
          color: cleanHex(settings.theme.textMuted, '64748B'),
        }),
        new TextRun({
          children: [PageNumber.TOTAL_PAGES],
          font: settings.typography.bodyFont,
          size: 18,
          color: cleanHex(settings.theme.textMuted, '64748B'),
        })
      );
    } else if (rightType === 'page-x') {
      footerRuns.push(
        new TextRun({
          text: '\tPage ',
          font: settings.typography.bodyFont,
          size: 18,
          color: cleanHex(settings.theme.textMuted, '64748B'),
        }),
        new TextRun({
          children: [PageNumber.CURRENT],
          font: settings.typography.bodyFont,
          size: 18,
          color: cleanHex(settings.theme.textMuted, '64748B'),
        })
      );
    } else if (rightType === 'custom' && settings.headerFooter.footerCustomRight) {
      footerRuns.push(
        new TextRun({
          text: '\t' + settings.headerFooter.footerCustomRight,
          font: settings.typography.bodyFont,
          size: 18,
          color: cleanHex(settings.theme.textMuted, '64748B'),
        })
      );
    }

    footerChildren.push(
      new Paragraph({
        children: footerRuns as TextRun[],
        tabStops: [
          {
            type: TabStopType.CENTER,
            position: Math.round(printableWidthTwip / 2),
          },
          {
            type: TabStopType.RIGHT,
            position: printableWidthTwip,
          },
        ],
        border: settings.headerFooter.footerShowDivider
          ? {
              top: {
                color: cleanHex(settings.headerFooter.footerDividerColor, 'CBD5E1'),
                size: 6,
                style: BorderStyle.SINGLE,
                space: 4,
              },
            }
          : undefined,
        spacing: {
          before: 140,
        },
      })
    );

    footersConfig.default = new Footer({
      children: footerChildren,
    });
  }

  // Create docx Document
  const docxDocument = new Document({
    title: settings.title || 'Document',
    creator: 'Docx & PDF Studio Converter',
    description: 'Generated with Docx & PDF Studio Converter',
    sections: [
      {
        properties: {
          page: {
            size: {
              width: widthTwip,
              height: heightTwip,
              orientation: isLandscape ? DocxPageOrientation.LANDSCAPE : DocxPageOrientation.PORTRAIT,
            },
            margin: {
              top: marginTopTwip,
              bottom: marginBottomTwip,
              left: marginLeftTwip,
              right: marginRightTwip,
            },
          },
          titlePage: settings.headerFooter.differentFirstPage,
        },
        headers: headersConfig,
        footers: footersConfig,
        children: childrenElements,
      },
    ],
  });

  return await Packer.toBlob(docxDocument);
}

/**
 * Downloads the generated document as a .docx file
 */
export async function downloadDocx(htmlContent: string, settings: DocumentSettings): Promise<void> {
  const blob = await generateDocxBlob(htmlContent, settings);
  const fileName = settings.fileName.endsWith('.docx') ? settings.fileName : `${settings.fileName}.docx`;
  saveAs(blob, fileName);
}

const BLOCK_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'ul', 'ol', 'blockquote', 'pre', 'hr']);

function hasBlockDescendant(element: HTMLElement): boolean {
  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i] as HTMLElement;
    const tag = child.tagName.toLowerCase();
    if (BLOCK_TAGS.has(tag) || (tag === 'div' && hasBlockDescendant(child))) {
      return true;
    }
  }
  return false;
}

/**
 * Parser for DOM Node to docx elements
 */
function parseNode(
  node: Node,
  settings: DocumentSettings,
  printableWidthTwip: number,
  isFirstElement: boolean = false
): Paragraph | Table | (Paragraph | Table)[] | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (!text) return null;
    return new Paragraph({
      children: [
        new TextRun({
          text: node.textContent || '',
          font: settings.typography.bodyFont,
          size: settings.typography.baseFontSizePt * 2,
          color: cleanHex(settings.theme.text),
        }),
      ],
      spacing: {
        after: settings.typography.paragraphSpacingAfterPt * 20,
        line: Math.round(settings.typography.lineSpacing * 240),
      },
    });
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const element = node as HTMLElement;
  const tagName = element.tagName.toLowerCase();

  // Explicit Page Break (.page-break or style="page-break-before: always")
  if (
    element.classList.contains('page-break') ||
    element.getAttribute('style')?.includes('page-break') ||
    element.getAttribute('style')?.includes('break-before')
  ) {
    // If it's the very first element in the document, don't insert a blank leading page
    if (isFirstElement) {
      return null;
    }
    if (element.children.length === 0) {
      return new Paragraph({
        children: [new PageBreak()],
      });
    }
  }

  // Headings
  if (/^h[1-6]$/.test(tagName)) {
    const level = parseInt(tagName[1], 10);
    const textRuns = parseInlineFormatting(element, settings);
    const headingText = element.textContent?.trim() || '';

    let fontSizePt = settings.typography.baseFontSizePt;
    let headingLevel: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1;
    let spacingBefore = 240;
    let spacingAfter = 120;
    let headingColor = settings.theme.headingColor;

    if (level === 1) {
      fontSizePt = settings.typography.h1SizePt;
      headingLevel = HeadingLevel.HEADING_1;
      spacingBefore = 360;
      spacingAfter = 180;
      headingColor = settings.theme.primary;
    } else if (level === 2) {
      fontSizePt = settings.typography.h2SizePt;
      headingLevel = HeadingLevel.HEADING_2;
      spacingBefore = 280;
      spacingAfter = 140;
      headingColor = settings.theme.secondary;
    } else if (level === 3) {
      fontSizePt = settings.typography.h3SizePt;
      headingLevel = HeadingLevel.HEADING_3;
      spacingBefore = 200;
      spacingAfter = 100;
      headingColor = settings.theme.headingColor;
    } else {
      fontSizePt = settings.typography.baseFontSizePt + 1;
      headingLevel = HeadingLevel.HEADING_4;
      spacingBefore = 160;
      spacingAfter = 80;
    }

    // Apply heading font and heading color
    const runsWithHeadingFont = textRuns.map((r) => {
      if (r instanceof TextRun) {
        return new TextRun({
          ...r,
          font: settings.typography.headingFont,
          size: fontSizePt * 2,
          color: cleanHex(headingColor),
          bold: true,
        });
      }
      return r;
    });

    // Check if heading should start on a new page (Chapter / Part / H1)
    const isChapter = /^CHAPTER\s+\d+|^CHAPITRE\s+\d+|^PART\s+[I|V|X|\d]+|^TABLE OF CONTENTS|^TABLE DES MATIÈRES/i.test(headingText);
    const shouldBreakBefore =
      !isFirstElement &&
      (element.classList.contains('page-break') ||
        element.getAttribute('style')?.includes('page-break') ||
        (level === 1 && settings.pageBreaks?.breakBeforeH1 !== false) ||
        (isChapter && settings.pageBreaks?.breakBeforePart !== false));

    return new Paragraph({
      heading: headingLevel,
      pageBreakBefore: shouldBreakBefore,
      children: runsWithHeadingFont,
      spacing: {
        before: isFirstElement ? 0 : spacingBefore,
        after: spacingAfter,
        line: 280,
      },
    });
  }

  // Paragraph
  if (tagName === 'p') {
    const textRuns = parseInlineFormatting(element, settings);
    const align = getElementAlignment(element);

    return new Paragraph({
      children: textRuns,
      alignment: align,
      spacing: {
        after: settings.typography.paragraphSpacingAfterPt * 20,
        line: Math.round(settings.typography.lineSpacing * 240),
      },
    });
  }

  // Horizontal Rule <hr>
  if (tagName === 'hr') {
    return new Paragraph({
      border: {
        bottom: {
          color: cleanHex(settings.theme.accent, 'CBD5E1'),
          size: 12,
          style: BorderStyle.SINGLE,
          space: 6,
        },
      },
      spacing: {
        before: 180,
        after: 240,
      },
    });
  }

  // Blockquote
  if (tagName === 'blockquote') {
    const textRuns = parseInlineFormatting(element, settings, { italics: true, color: settings.theme.textMuted });
    return new Paragraph({
      children: textRuns,
      indent: {
        left: convertMillimetersToTwip(6),
      },
      border: {
        left: {
          color: cleanHex(settings.theme.primary, '3B82F6'),
          size: 24,
          style: BorderStyle.SINGLE,
          space: 12,
        },
      },
      shading: {
        fill: cleanHex(settings.theme.calloutInfoBg, 'F8FAFC'),
      },
      spacing: {
        before: 160,
        after: 160,
        line: Math.round(settings.typography.lineSpacing * 240),
      },
    });
  }

  // Callouts / Alert boxes (<div class="callout ...">)
  if (tagName === 'div' && (element.classList.contains('callout') || element.classList.contains('alert') || element.classList.contains('box'))) {
    const textRuns = parseInlineFormatting(element, settings);
    return new Paragraph({
      children: textRuns,
      indent: {
        left: convertMillimetersToTwip(5),
        right: convertMillimetersToTwip(5),
      },
      border: {
        left: {
          color: cleanHex(settings.theme.calloutInfoBorder, '3B82F6'),
          size: 28,
          style: BorderStyle.SINGLE,
          space: 10,
        },
        top: {
          color: cleanHex(settings.theme.tableBorder, 'E2E8F0'),
          size: 4,
          style: BorderStyle.SINGLE,
          space: 6,
        },
        bottom: {
          color: cleanHex(settings.theme.tableBorder, 'E2E8F0'),
          size: 4,
          style: BorderStyle.SINGLE,
          space: 6,
        },
        right: {
          color: cleanHex(settings.theme.tableBorder, 'E2E8F0'),
          size: 4,
          style: BorderStyle.SINGLE,
          space: 6,
        },
      },
      shading: {
        fill: cleanHex(settings.theme.calloutInfoBg, 'EFF6FF'),
      },
      spacing: {
        before: 180,
        after: 180,
        line: Math.round(settings.typography.lineSpacing * 240),
      },
    });
  }

  // Lists (UL & OL)
  if (tagName === 'ul' || tagName === 'ol') {
    const listItems = Array.from(element.children).filter((c) => c.tagName.toLowerCase() === 'li');
    const paragraphs: Paragraph[] = [];

    listItems.forEach((li, idx) => {
      const runs = parseInlineFormatting(li as HTMLElement, settings);
      const isOrdered = tagName === 'ol';

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: isOrdered ? `${idx + 1}.  ` : '•   ',
              bold: isOrdered,
              font: settings.typography.bodyFont,
              size: settings.typography.baseFontSizePt * 2,
              color: cleanHex(settings.theme.primary),
            }),
            ...runs,
          ],
          indent: {
            left: convertMillimetersToTwip(7),
            hanging: convertMillimetersToTwip(4),
          },
          spacing: {
            after: 80,
            line: Math.round(settings.typography.lineSpacing * 240),
          },
        })
      );
    });

    return paragraphs;
  }

  // Pre / Code block
  if (tagName === 'pre') {
    const codeText = element.textContent || '';
    const lines = codeText.split('\n');
    const codeParagraphs = lines.map((line) => {
      return new Paragraph({
        children: [
          new TextRun({
            text: line || ' ',
            font: 'Courier New',
            size: (settings.typography.baseFontSizePt - 1.5) * 2,
            color: cleanHex(settings.theme.text),
          }),
        ],
        shading: {
          fill: 'F1F5F9',
        },
        spacing: {
          line: 220,
          after: 20,
        },
        indent: {
          left: convertMillimetersToTwip(4),
        },
      });
    });

    return codeParagraphs;
  }

  // Table
  if (tagName === 'table') {
    return parseTableElement(element, settings, printableWidthTwip);
  }

  // Generic Container (div, section, article, header, footer, aside, main)
  if (tagName === 'div' || tagName === 'section' || tagName === 'article' || tagName === 'header' || tagName === 'footer' || tagName === 'aside' || tagName === 'main') {
    // If container has NO block children (only text, spans, formatting), parse as a single coherent paragraph!
    if (!hasBlockDescendant(element)) {
      const runs = parseInlineFormatting(element, settings);
      if (runs.length > 0) {
        return new Paragraph({
          children: runs,
          alignment: getElementAlignment(element),
          spacing: {
            after: settings.typography.paragraphSpacingAfterPt * 20,
            line: Math.round(settings.typography.lineSpacing * 240),
          },
        });
      }
      return null;
    }

    const elements: (Paragraph | Table)[] = [];
    let currentInlineNodes: Node[] = [];

    const flushInline = () => {
      if (currentInlineNodes.length > 0) {
        const dummy = document.createElement('div');
        currentInlineNodes.forEach((n) => dummy.appendChild(n.cloneNode(true)));
        const runs = parseInlineFormatting(dummy, settings);
        if (runs.length > 0) {
          elements.push(
            new Paragraph({
              children: runs,
              spacing: {
                after: settings.typography.paragraphSpacingAfterPt * 20,
                line: Math.round(settings.typography.lineSpacing * 240),
              },
            })
          );
        }
        currentInlineNodes = [];
      }
    };

    for (let i = 0; i < element.childNodes.length; i++) {
      const childNode = element.childNodes[i];
      if (childNode.nodeType === Node.TEXT_NODE) {
        if (childNode.textContent?.trim()) {
          currentInlineNodes.push(childNode);
        }
      } else if (childNode.nodeType === Node.ELEMENT_NODE) {
        const childEl = childNode as HTMLElement;
        const childTag = childEl.tagName.toLowerCase();
        if (BLOCK_TAGS.has(childTag) || (childTag === 'div' && hasBlockDescendant(childEl))) {
          flushInline();
          const childParsed = parseNode(childEl, settings, printableWidthTwip, isFirstElement && elements.length === 0);
          if (childParsed) {
            if (Array.isArray(childParsed)) {
              elements.push(...childParsed);
            } else {
              elements.push(childParsed);
            }
          }
        } else {
          currentInlineNodes.push(childEl);
        }
      }
    }

    flushInline();
    return elements;
  }

  // Fallback for other elements: parse inline and wrap in paragraph
  const runs = parseInlineFormatting(element, settings);
  if (runs.length > 0) {
    return new Paragraph({
      children: runs,
      spacing: {
        after: settings.typography.paragraphSpacingAfterPt * 20,
        line: Math.round(settings.typography.lineSpacing * 240),
      },
    });
  }

  return null;
}

/**
 * Parses HTML <table> element into a rich docx Table with themes, borders, paddings & zebra shading
 */
function parseTableElement(tableElem: HTMLElement, settings: DocumentSettings, printableWidthTwip: number): Table {
  const rows: TableRow[] = [];
  const rawRows = Array.from(tableElem.querySelectorAll('tr'));

  // Calculate table width & column widths
  const maxCols = Math.max(
    1,
    ...rawRows.map((r) => {
      let count = 0;
      r.querySelectorAll('th, td').forEach((cell) => {
        const span = parseInt((cell as HTMLTableCellElement).getAttribute('colspan') || '1', 10);
        count += span;
      });
      return count;
    })
  );

  // Check if columns or cells in the first row or header specify widths (e.g. style="width: 30%", width="30%", or <col>)
  const detectedWidthFractions: number[] = new Array(maxCols).fill(0);
  let totalExplicitFractions = 0;
  let explicitCount = 0;

  // Check <col> tags first
  const colElements = Array.from(tableElem.querySelectorAll('colgroup > col, col'));
  if (colElements.length > 0) {
    colElements.forEach((col, idx) => {
      if (idx < maxCols) {
        const wAttr = col.getAttribute('width') || '';
        const wStyle = (col as HTMLElement).style?.width || '';
        const rawW = wStyle || wAttr;
        if (rawW) {
          const num = parseFloat(rawW);
          if (rawW.includes('%')) {
            detectedWidthFractions[idx] = num / 100;
            totalExplicitFractions += num / 100;
            explicitCount++;
          }
        }
      }
    });
  }

  // If no colgroup, check the first row's cells (or the thead cells)
  if (explicitCount === 0 && rawRows.length > 0) {
    const firstRowCells = Array.from(rawRows[0].querySelectorAll('th, td'));
    let colIdx = 0;
    firstRowCells.forEach((cell) => {
      const htmlCell = cell as HTMLTableCellElement;
      const span = parseInt(htmlCell.getAttribute('colspan') || '1', 10);
      const wAttr = htmlCell.getAttribute('width') || '';
      const wStyle = htmlCell.style?.width || '';
      const rawW = wStyle || wAttr;
      if (rawW && colIdx < maxCols) {
        const num = parseFloat(rawW);
        if (rawW.includes('%')) {
          const frac = num / 100 / span;
          for (let s = 0; s < span; s++) {
            if (colIdx + s < maxCols) {
              detectedWidthFractions[colIdx + s] = frac;
              totalExplicitFractions += frac;
              explicitCount++;
            }
          }
        }
      }
      colIdx += span;
    });
  }

  // Calculate final column widths in twips
  const colWidthsTwip: number[] = [];
  if (explicitCount > 0 && totalExplicitFractions > 0) {
    // Normalize fractions to sum to 1
    const defaultFracForRemaining = (1 - Math.min(0.95, totalExplicitFractions)) / Math.max(1, maxCols - explicitCount);
    let remainingTwip = printableWidthTwip;
    for (let c = 0; c < maxCols; c++) {
      const frac = detectedWidthFractions[c] > 0
        ? (detectedWidthFractions[c] / (totalExplicitFractions > 1 ? totalExplicitFractions : 1))
        : defaultFracForRemaining;
      const w = Math.max(convertMillimetersToTwip(10), Math.floor(printableWidthTwip * frac));
      colWidthsTwip.push(w);
      remainingTwip -= w;
    }
  } else {
    // Equal distribution
    const evenColWidthTwip = Math.floor(printableWidthTwip / maxCols);
    for (let c = 0; c < maxCols; c++) {
      colWidthsTwip.push(evenColWidthTwip);
    }
  }

  const cellPaddingTwip = convertMillimetersToTwip(settings.tables.cellPaddingMm || 2.5);

  const tableBorderColor = cleanHex(settings.tables.borderColor || settings.theme.tableBorder, 'CBD5E1');
  const tableBorderSize = Math.max(2, Math.round((settings.tables.borderWidthPt || 1) * 6));

  const standardBorders = {
    top: { style: BorderStyle.SINGLE, size: tableBorderSize, color: tableBorderColor },
    bottom: { style: BorderStyle.SINGLE, size: tableBorderSize, color: tableBorderColor },
    left: { style: BorderStyle.SINGLE, size: tableBorderSize, color: tableBorderColor },
    right: { style: BorderStyle.SINGLE, size: tableBorderSize, color: tableBorderColor },
  };

  const minimalBorders = {
    top: { style: BorderStyle.SINGLE, size: tableBorderSize, color: tableBorderColor },
    bottom: { style: BorderStyle.SINGLE, size: tableBorderSize, color: tableBorderColor },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  };

  const cellBorderConfig = settings.tables.style === 'minimal' ? minimalBorders : standardBorders;

  let bodyRowIndex = 0;

  rawRows.forEach((tr) => {
    const cells: TableCell[] = [];
    const isHeaderRow = tr.closest('thead') !== null || (tr.querySelector('th') !== null && bodyRowIndex === 0);
    const trBgColor = tr.style?.backgroundColor || tr.getAttribute('bgcolor') || '';

    let currentColumnIndex = 0;

    tr.querySelectorAll('th, td').forEach((cellNode) => {
      const cell = cellNode as HTMLTableCellElement;
      const isTh = cell.tagName.toLowerCase() === 'th' || isHeaderRow;
      const colSpan = parseInt(cell.getAttribute('colspan') || '1', 10);
      const rowSpan = parseInt(cell.getAttribute('rowspan') || '1', 10);

      // Check inline background color on cell or row
      const cellBgStyle = cell.style?.backgroundColor || cell.getAttribute('bgcolor') || trBgColor;

      // Determine background color
      let bgHex = 'FFFFFF';
      if (cellBgStyle && cellBgStyle !== 'transparent' && cellBgStyle !== 'inherit') {
        bgHex = parseCssColorToHex(cellBgStyle);
      } else if (isTh) {
        bgHex = cleanHex(settings.tables.headerBgColor || settings.theme.tableHeaderBg, '1E3A8A');
      } else if (settings.tables.zebraStriping && bodyRowIndex % 2 === 1) {
        bgHex = cleanHex(settings.tables.zebraBgColor || settings.theme.tableZebraBg, 'F8FAFC');
      }

      // Determine text color
      const defaultTextColor = isTh
        ? cleanHex(settings.tables.headerTextColor || settings.theme.tableHeaderText, 'FFFFFF')
        : cleanHex(settings.theme.text, '1E293B');

      // Cell alignment
      const align = getElementAlignment(cell);

      // Compute total width for this cell (including colspan)
      let cellWidth = 0;
      for (let s = 0; s < colSpan; s++) {
        const idx = currentColumnIndex + s;
        cellWidth += colWidthsTwip[idx] || Math.floor(printableWidthTwip / maxCols);
      }
      currentColumnIndex += colSpan;

      // Parse cell content
      const cellParagraphs: Paragraph[] = [];
      if (cell.children.length > 0 && Array.from(cell.children).some((c) => ['p', 'div', 'ul', 'ol'].includes(c.tagName.toLowerCase()))) {
        for (let i = 0; i < cell.childNodes.length; i++) {
          const childNode = cell.childNodes[i];
          if (childNode.nodeType === Node.TEXT_NODE && childNode.textContent?.trim()) {
            cellParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: childNode.textContent.trim(),
                    font: settings.typography.bodyFont,
                    size: (settings.typography.baseFontSizePt - 0.5) * 2,
                    color: defaultTextColor,
                    bold: isTh && settings.tables.headerBold,
                  }),
                ],
                alignment: align,
              })
            );
          } else if (childNode.nodeType === Node.ELEMENT_NODE) {
            const childElem = childNode as HTMLElement;
            const runs = parseInlineFormatting(childElem, settings, {
              color: defaultTextColor,
              bold: isTh && settings.tables.headerBold,
            });
            cellParagraphs.push(
              new Paragraph({
                children: runs,
                alignment: align,
                spacing: { after: 60, line: 220 },
              })
            );
          }
        }
      } else {
        const runs = parseInlineFormatting(cell, settings, {
          color: defaultTextColor,
          bold: isTh && settings.tables.headerBold,
        });
        cellParagraphs.push(
          new Paragraph({
            children: runs.length > 0 ? runs : [new TextRun({ text: ' ' })],
            alignment: align,
            spacing: {
              after: 40,
              line: 220,
            },
          })
        );
      }

      if (cellParagraphs.length === 0) {
        cellParagraphs.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }));
      }

      cells.push(
        new TableCell({
          children: cellParagraphs,
          columnSpan: colSpan > 1 ? colSpan : undefined,
          rowSpan: rowSpan > 1 ? rowSpan : undefined,
          width: {
            size: cellWidth,
            type: WidthType.DXA,
          },
          shading: {
            fill: bgHex,
          },
          margins: {
            top: cellPaddingTwip,
            bottom: cellPaddingTwip,
            left: cellPaddingTwip + 40,
            right: cellPaddingTwip + 40,
          },
          borders: cellBorderConfig,
        })
      );
    });

    if (!isHeaderRow) {
      bodyRowIndex++;
    }

    if (cells.length > 0) {
      rows.push(
        new TableRow({
          children: cells,
          tableHeader: isHeaderRow,
        })
      );
    }
  });

  return new Table({
    rows,
    width: {
      size: printableWidthTwip,
      type: WidthType.DXA,
    },
    alignment: AlignmentType.CENTER,
  });
}

/**
 * Converts CSS color string (rgb, rgba, hex, named) to clean hex string
 */
function parseCssColorToHex(colorStr: string): string {
  if (!colorStr) return 'FFFFFF';
  const c = colorStr.trim();
  if (c.startsWith('#')) {
    return cleanHex(c);
  }
  const rgbMatch = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, '0');
    return `${r}${g}${b}`;
  }
  return 'F1F5F9';
}

/**
 * Extracts and traverses inline formatting tags (strong, em, u, a, code, mark, span) into docx TextRuns
 */
function parseInlineFormatting(
  element: HTMLElement,
  settings: DocumentSettings,
  inheritedStyles?: {
    bold?: boolean;
    italics?: boolean;
    underline?: boolean;
    strike?: boolean;
    color?: string;
    font?: string;
    sizePt?: number;
    highlight?: string;
  }
): (TextRun | ExternalHyperlink)[] {
  const runs: (TextRun | ExternalHyperlink)[] = [];

  function traverse(node: Node, currentStyles: typeof inheritedStyles) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!text) return;

      runs.push(
        new TextRun({
          text: text,
          bold: currentStyles?.bold,
          italics: currentStyles?.italics,
          underline: currentStyles?.underline ? { type: UnderlineType.SINGLE } : undefined,
          strike: currentStyles?.strike,
          color: cleanHex(currentStyles?.color || settings.theme.text),
          font: currentStyles?.font || settings.typography.bodyFont,
          size: Math.round((currentStyles?.sizePt || settings.typography.baseFontSizePt) * 2),
        })
      );
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    // Hyperlinks
    if (tag === 'a') {
      const href = el.getAttribute('href') || '#';
      const linkText = el.textContent || href;
      runs.push(
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: linkText,
              style: 'Hyperlink',
              color: cleanHex(settings.theme.secondary, '2563EB'),
              underline: { type: UnderlineType.SINGLE },
              font: settings.typography.bodyFont,
              size: Math.round(settings.typography.baseFontSizePt * 2),
            }),
          ],
          link: href,
        })
      );
      return;
    }

    // Line break
    if (tag === 'br') {
      runs.push(new TextRun({ break: 1 }));
      return;
    }

    // Merge styles
    const newStyles = { ...currentStyles };

    if (tag === 'strong' || tag === 'b') {
      newStyles.bold = true;
    }
    if (tag === 'em' || tag === 'i') {
      newStyles.italics = true;
    }
    if (tag === 'u') {
      newStyles.underline = true;
    }
    if (tag === 's' || tag === 'del' || tag === 'strike') {
      newStyles.strike = true;
    }
    if (tag === 'code') {
      newStyles.font = 'Courier New';
      newStyles.color = settings.theme.primary;
      newStyles.sizePt = settings.typography.baseFontSizePt - 1;
    }
    if (tag === 'small') {
      newStyles.sizePt = settings.typography.baseFontSizePt - 2;
    }

    // Check inline style attribute
    const styleAttr = el.getAttribute('style') || '';
    if (styleAttr) {
      if (styleAttr.includes('font-weight: bold') || styleAttr.includes('font-weight: 700')) {
        newStyles.bold = true;
      }
      if (styleAttr.includes('font-style: italic')) {
        newStyles.italics = true;
      }
      const colorMatch = styleAttr.match(/color:\s*([^;]+)/i);
      if (colorMatch) {
        newStyles.color = colorMatch[1].trim();
      }
    }

    for (let i = 0; i < el.childNodes.length; i++) {
      traverse(el.childNodes[i], newStyles);
    }
  }

  for (let i = 0; i < element.childNodes.length; i++) {
    traverse(element.childNodes[i], inheritedStyles);
  }

  return runs;
}

/**
 * Returns Paragraph alignment from element styles or attributes
 */
function getElementAlignment(element: HTMLElement): (typeof AlignmentType)[keyof typeof AlignmentType] {
  const style = element.getAttribute('style') || '';
  const alignAttr = element.getAttribute('align') || '';

  if (style.includes('text-align: center') || alignAttr === 'center') {
    return AlignmentType.CENTER;
  }
  if (style.includes('text-align: right') || alignAttr === 'right') {
    return AlignmentType.RIGHT;
  }
  if (style.includes('text-align: justify') || alignAttr === 'justify') {
    return AlignmentType.JUSTIFIED;
  }
  return AlignmentType.LEFT;
}
