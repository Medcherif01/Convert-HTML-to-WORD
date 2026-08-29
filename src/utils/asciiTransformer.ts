/**
 * Comprehensive ASCII Art, Box Tables, Flowcharts, and Diagram Transformer
 * Converts raw plaintext ASCII art / diagrams into semantic, beautifully styled HTML & tables.
 */

export interface DiagramConversionResult {
  hasConverted: boolean;
  html: string;
}

/**
 * Checks if a string or block contains ASCII table/box/diagram structures
 */
export function hasAsciiArtOrDiagram(text: string): boolean {
  if (!text) return false;
  // Look for patterns like +---+---+, +===+===+, | ... |, \ / ===>, [===>], ->
  const hasBoxBorders = /\+[-=]{3,}\+/.test(text);
  const hasPipesAndDashes = /\|.*\|/.test(text) && /[-=]{4,}/.test(text);
  const hasFlowArrows = /(\\s*\/|\/s*\\|===>|<===|-->|->)/.test(text);
  return hasBoxBorders || (hasPipesAndDashes && text.includes('|')) || hasFlowArrows;
}

/**
 * Main function that inspects text (or preformatted code) and replaces ASCII art
 * with rich HTML tables, comparison cards, flowcharts, or part banners.
 */
export function transformAsciiAndDiagramsToHtml(rawText: string): string {
  if (!rawText) return rawText;

  // Split text into candidate blocks (by double newlines or lines starting with +--- or containing diagram symbols)
  const lines = rawText.split(/\r?\n/);
  const resultBlocks: string[] = [];
  let currentBlock: string[] = [];
  let inDiagramBlock = false;

  const flushCurrentBlock = () => {
    if (currentBlock.length === 0) return;
    const blockText = currentBlock.join('\n');
    if (inDiagramBlock || isAsciiBlock(blockText)) {
      const converted = convertAsciiBlockToHtml(blockText);
      resultBlocks.push(converted);
    } else {
      resultBlocks.push(blockText);
    }
    currentBlock = [];
    inDiagramBlock = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBorderLine = /^\s*\+[-=+]{3,}\+\s*$/.test(line) || /^\s*[-=]{6,}\s*$/.test(line);
    const isPipeLine = /^\s*\|.*\|\s*$/.test(line);
    const isDiagramLine = /(\\.*\/|\/.*\\|===>|<===|--->|HISTORIC.*PARADIGM|21ST CENTURY)/i.test(line);

    if (isBorderLine || isPipeLine || (inDiagramBlock && line.trim().length > 0) || isDiagramLine) {
      inDiagramBlock = true;
      currentBlock.push(line);
    } else if (inDiagramBlock && line.trim() === '') {
      // Empty line after diagram block - flush
      flushCurrentBlock();
    } else {
      if (inDiagramBlock) {
        flushCurrentBlock();
      }
      currentBlock.push(line);
    }
  }

  flushCurrentBlock();

  return resultBlocks.join('\n\n');
}

/**
 * Checks if a specific text block is an ASCII box / diagram
 */
function isAsciiBlock(text: string): boolean {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return false;

  let borderCount = 0;
  let pipeCount = 0;
  let arrowCount = 0;

  for (const line of lines) {
    if (/^\s*\+[-=+]{3,}\+\s*$/.test(line) || /^\s*[-=]{6,}\s*$/.test(line)) borderCount++;
    if (/^\s*\|.*\|\s*$/.test(line)) pipeCount++;
    if (/===>|<===|-->|->|\\|\//.test(line)) arrowCount++;
  }

  return borderCount >= 1 || (pipeCount >= 2) || (arrowCount >= 2 && lines.length >= 3);
}

/**
 * Analyzes and converts an ASCII block into the optimal HTML presentation
 */
export function convertAsciiBlockToHtml(blockText: string): string {
  const clean = blockText.trim();

  // 1. Check for Comparison Diagram (e.g. Historic Paradigm ===> 21st Century Paradigm)
  if (isComparisonDiagram(clean)) {
    return transformComparisonDiagram(clean);
  }

  // 2. Check for Branching / Converging Flowchart (e.g. Saudi National + International ===> Integrated Ecosystem)
  if (isBranchingFlowchart(clean)) {
    return transformBranchingFlowchart(clean);
  }

  // 3. Check for Part / Chapter / Section Banner (e.g. PART I ... Chapters)
  if (isPartBannerOrToc(clean)) {
    return transformPartBannerOrToc(clean);
  }

  // 4. Check for Priority List / Single Column Action Box (e.g. TOP 8 INSTITUTIONAL IMPROVEMENT PRIORITIES)
  if (isPriorityOrCalloutBox(clean)) {
    return transformPriorityOrCalloutBox(clean);
  }

  // 5. Check for Multi-column Grid Table (e.g. STRATEGIC BLUEPRINT OBJECTIVES)
  if (isGridTable(clean)) {
    return transformGridTable(clean);
  }

  // Fallback: standard ASCII table conversion
  return transformGenericAsciiTable(clean);
}

/**
 * 1. Comparison Diagram Transformer (e.g. Historic vs 21st Century)
 */
function isComparisonDiagram(text: string): boolean {
  return (
    /===>|<===|-->|->|vs|VS/i.test(text) &&
    (text.includes('PARADIGM') || text.includes('CURRENT') || text.includes('BEFORE') || text.includes('HISTORIC') || /\+[-=]{5,}\+.*\+[-=]{5,}\+/.test(text))
  );
}

function transformComparisonDiagram(text: string): string {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);

  // Extract titles
  let titleLeft = 'Traditional Paradigm';
  let titleRight = '21st Century Paradigm';

  const firstLine = lines[0];
  if (firstLine && !firstLine.includes('+') && !firstLine.includes('|')) {
    const parts = firstLine.split(/\s{4,}/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      titleLeft = parts[0];
      titleRight = parts[1];
    }
  }

  const leftItems: string[] = [];
  const rightItems: string[] = [];

  for (const line of lines) {
    // Match line with two boxes separated by arrow
    // e.g. | - Rote Memorization | ===> | - Deep Conceptual Understanding |
    const matchTwoBoxes = line.match(/\|\s*([^|]+)\s*\|\s*(=+>|->|>)?\s*\|\s*([^|]+)\s*\|/);
    if (matchTwoBoxes) {
      const leftVal = matchTwoBoxes[1].trim().replace(/^[-•*]\s*/, '');
      const rightVal = matchTwoBoxes[3].trim().replace(/^[-•*]\s*/, '');
      if (leftVal && !leftVal.startsWith('---') && !leftVal.startsWith('===')) leftItems.push(leftVal);
      if (rightVal && !rightVal.startsWith('---') && !rightVal.startsWith('===')) rightItems.push(rightVal);
    }
  }

  // If parsed items found, render as modern comparison table / card grid
  if (leftItems.length > 0 || rightItems.length > 0) {
    return `
<div class="comparison-diagram" style="margin: 16pt 0; width: 100%;">
  <table style="width: 100%; border-collapse: separate; border-spacing: 12pt 0; border: none;">
    <thead>
      <tr>
        <th style="width: 46%; background-color: #F1F5F9; color: #334155; border: 1.5pt solid #CBD5E1; border-radius: 6pt; padding: 10pt; text-align: center; font-size: 11pt; font-weight: 700;">
          ${escapeHtml(titleLeft)}
        </th>
        <th style="width: 8%; background: transparent; border: none; text-align: center; font-size: 16pt; color: #2563EB; vertical-align: middle;">
          ➔
        </th>
        <th style="width: 46%; background-color: #EFF6FF; color: #1E3A8A; border: 1.5pt solid #3B82F6; border-radius: 6pt; padding: 10pt; text-align: center; font-size: 11pt; font-weight: 700;">
          ${escapeHtml(titleRight)}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="background-color: #F8FAFC; border: 1pt solid #E2E8F0; border-radius: 6pt; padding: 12pt; vertical-align: top;">
          <ul style="margin: 0; padding-left: 14pt; color: #475569; font-size: 9.5pt; line-height: 1.6;">
            ${leftItems.map((item) => `<li style="margin-bottom: 6pt;">${escapeHtml(item)}</li>`).join('\n            ')}
          </ul>
        </td>
        <td style="border: none; text-align: center; vertical-align: middle; color: #64748B; font-weight: bold;">
        </td>
        <td style="background-color: #F0FDF4; border: 1pt solid #86EFAC; border-radius: 6pt; padding: 12pt; vertical-align: top;">
          <ul style="margin: 0; padding-left: 14pt; color: #166534; font-size: 9.5pt; line-height: 1.6; font-weight: 500;">
            ${rightItems.map((item) => `<li style="margin-bottom: 6pt;"><strong>✓</strong> ${escapeHtml(item)}</li>`).join('\n            ')}
          </ul>
        </td>
      </tr>
    </tbody>
  </table>
</div>`;
  }

  return transformGenericAsciiTable(text);
}

/**
 * 2. Branching / Converging Flowchart Transformer (Image 4)
 */
function isBranchingFlowchart(text: string): boolean {
  return (/\\|\//.test(text) && /===>|<===|--->/.test(text)) || (/CURRICULUM ECOSYSTEM|INTEGRATED|FRAMEWORK/i.test(text) && text.includes('===>'));
}

function transformBranchingFlowchart(text: string): string {
  // Extract text nodes
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  
  let leftSource = 'Source Stream A';
  let leftSubtitle = '';
  let rightSource = 'Source Stream B';
  let rightSubtitle = '';
  let targetTitle = 'Unified Strategic Ecosystem';
  let targetSubtitle = '';

  const nonPunctuation = lines.filter((l) => !/^[-=\\/+|> ]+$/.test(l));

  if (nonPunctuation.length >= 1) {
    const firstNonPunct = nonPunctuation[0];
    const parts = firstNonPunct.split(/\s{4,}/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      leftSource = parts[0];
      rightSource = parts[1];
    } else {
      leftSource = firstNonPunct;
    }
  }

  if (nonPunctuation.length >= 2) {
    const secondLine = nonPunctuation[1];
    if (secondLine.includes('(')) {
      const subParts = secondLine.split(/\s{4,}/).map((p) => p.trim()).filter(Boolean);
      if (subParts.length >= 2) {
        leftSubtitle = subParts[0];
        rightSubtitle = subParts[1];
      }
    }
  }

  // Find target node (usually preceded by ===> or at bottom)
  const targetLines = lines.filter((l) => l.includes('===>') || l.includes('INTEGRATED') || l.includes('ECOSYSTEM') || l.includes('CORE'));
  if (targetLines.length > 0) {
    targetTitle = targetLines[0].replace(/===>|<===|-->|->/g, '').trim() || targetTitle;
  }

  // Any remaining descriptive lines for target
  const trailingSubs = lines.slice(-2).filter((l) => l.startsWith('(') || l.includes('Rigorous') || l.includes('Competitive'));
  if (trailingSubs.length > 0) {
    targetSubtitle = trailingSubs.join(' ');
  }

  return `
<div class="flowchart-diagram" style="margin: 18pt 0; padding: 14pt; background-color: #F8FAFC; border: 1.5pt solid #E2E8F0; border-radius: 8pt; text-align: center;">
  <div style="display: flex; justify-content: space-between; gap: 16pt; margin-bottom: 12pt;">
    <div style="flex: 1; background-color: #FFFFFF; border: 1.5pt solid #93C5FD; border-radius: 6pt; padding: 10pt; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="font-weight: 700; color: #1E40AF; font-size: 10.5pt;">${escapeHtml(leftSource)}</div>
      ${leftSubtitle ? `<div style="font-size: 8.5pt; color: #64748B; margin-top: 3pt;">${escapeHtml(leftSubtitle)}</div>` : ''}
    </div>
    <div style="flex: 1; background-color: #FFFFFF; border: 1.5pt solid #93C5FD; border-radius: 6pt; padding: 10pt; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="font-weight: 700; color: #1E40AF; font-size: 10.5pt;">${escapeHtml(rightSource)}</div>
      ${rightSubtitle ? `<div style="font-size: 8.5pt; color: #64748B; margin-top: 3pt;">${escapeHtml(rightSubtitle)}</div>` : ''}
    </div>
  </div>
  
  <div style="font-size: 16pt; color: #3B82F6; margin: 4pt 0 8pt 0; font-weight: bold; line-height: 1;">
    ▼ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ▼
  </div>

  <div style="background: linear-gradient(135deg, #1E3A8A, #2563EB); color: #FFFFFF; border-radius: 6pt; padding: 12pt 16pt; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.2);">
    <div style="font-size: 12pt; font-weight: 800; letter-spacing: 0.02em; text-transform: uppercase;">
      ${escapeHtml(targetTitle)}
    </div>
    ${targetSubtitle ? `<div style="font-size: 9pt; color: #DBEAFE; margin-top: 4pt; font-weight: 400;">${escapeHtml(targetSubtitle)}</div>` : ''}
  </div>
</div>`;
}

/**
 * 3. Part Banner / Section / TOC Box Transformer (Image 2 top)
 */
function isPartBannerOrToc(text: string): boolean {
  return /PART\s+[I|V|X|\d]+|TABLE OF CONTENTS|SECTION\s+[I|V|X|\d]+/i.test(text);
}

function transformPartBannerOrToc(text: string): string {
  const lines = text.split('\n');
  let partNumber = 'PART I';
  let partTitle = 'STRATEGIC OVERVIEW';
  const chapters: string[] = [];

  for (const line of lines) {
    const cleanLine = line.replace(/^[+| -]+|[+| -]+$/g, '').trim();
    if (!cleanLine || cleanLine.startsWith('===') || cleanLine.startsWith('---')) continue;

    if (/^PART\s+[I|V|X|\d]+/i.test(cleanLine)) {
      partNumber = cleanLine;
    } else if (cleanLine.includes('STRATEGIC') || cleanLine.includes('REVIEW') || cleanLine.includes('CONTEXT') || cleanLine.includes('FOUNDATION')) {
      partTitle = cleanLine;
    } else if (/^Chapter\s+\d+:|^Section\s+\d+:/i.test(cleanLine) || cleanLine.startsWith('- ') || cleanLine.startsWith('• ')) {
      chapters.push(cleanLine.replace(/^[-•*]\s*/, ''));
    } else if (cleanLine.length > 5 && chapters.length === 0 && !partTitle) {
      partTitle = cleanLine;
    } else if (cleanLine.length > 5) {
      chapters.push(cleanLine);
    }
  }

  return `
<div class="part-banner page-break" style="page-break-before: always; break-before: page; margin: 24pt 0 18pt 0; border: 2pt solid #1E3A8A; border-radius: 8pt; overflow: hidden; background-color: #FFFFFF;">
  <div style="background-color: #1E3A8A; color: #FFFFFF; padding: 14pt 18pt; text-align: center;">
    <div style="font-size: 11pt; font-weight: 800; letter-spacing: 0.1em; color: #93C5FD; text-transform: uppercase; margin-bottom: 2pt;">
      ${escapeHtml(partNumber)}
    </div>
    <div style="font-size: 15pt; font-weight: 700; letter-spacing: -0.01em;">
      ${escapeHtml(partTitle)}
    </div>
  </div>
  ${
    chapters.length > 0
      ? `
  <div style="padding: 12pt 18pt; background-color: #F8FAFC;">
    <div style="font-size: 8.5pt; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8pt;">
      Included Chapters &amp; Key Modules
    </div>
    <table style="width: 100%; border-collapse: collapse; border: none;">
      <tbody>
        ${chapters
          .map(
            (ch, idx) => `
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 7pt 4pt; font-weight: 600; color: #1E3A8A; width: 28px; font-size: 9.5pt;">
            0${idx + 1}.
          </td>
          <td style="padding: 7pt 4pt; color: #1E293B; font-size: 9.5pt;">
            ${escapeHtml(ch)}
          </td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>
  </div>`
      : ''
  }
</div>`;
}

/**
 * 4. Priority / Objectives Single-Column Callout Box (Image 3)
 */
function isPriorityOrCalloutBox(text: string): boolean {
  return /PRIORITIES|IMPROVEMENT|ACTION ITEMS|EXECUTIVE SUMMARY/i.test(text) && /\d+\.\s+[A-Z\s]+:/.test(text);
}

function transformPriorityOrCalloutBox(text: string): string {
  const lines = text.split('\n');
  let title = 'Top Institutional Priorities';
  const items: { number: string; title: string; desc: string }[] = [];

  for (const line of lines) {
    const cleanLine = line.replace(/^[+| -]+|[+| -]+$/g, '').trim();
    if (!cleanLine || cleanLine.startsWith('===') || cleanLine.startsWith('---')) continue;

    if (cleanLine.includes('PRIORITIES') || cleanLine.includes('OBJECTIVES') || cleanLine.includes('ACTION ITEMS')) {
      title = cleanLine;
      continue;
    }

    const itemMatch = cleanLine.match(/^(\d+)\.\s*([A-Z\s&]+):\s*(.*)$/);
    if (itemMatch) {
      items.push({
        number: itemMatch[1],
        title: itemMatch[2].trim(),
        desc: itemMatch[3].trim(),
      });
    } else if (/^\d+\./.test(cleanLine)) {
      const rest = cleanLine.replace(/^\d+\.\s*/, '');
      const colonIdx = rest.indexOf(':');
      if (colonIdx > 0) {
        items.push({
          number: (items.length + 1).toString(),
          title: rest.substring(0, colonIdx).trim(),
          desc: rest.substring(colonIdx + 1).trim(),
        });
      } else {
        items.push({
          number: (items.length + 1).toString(),
          title: rest,
          desc: '',
        });
      }
    }
  }

  return `
<div class="priority-box" style="margin: 16pt 0; border: 1.5pt solid #2563EB; border-radius: 8pt; overflow: hidden; background-color: #FFFFFF; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
  <div style="background-color: #1E3A8A; color: #FFFFFF; padding: 10pt 14pt; font-weight: 700; font-size: 11pt; letter-spacing: 0.03em; text-transform: uppercase;">
    📌 ${escapeHtml(title)}
  </div>
  <div style="padding: 10pt 14pt;">
    <table style="width: 100%; border-collapse: collapse; border: none;">
      <tbody>
        ${items
          .map(
            (it) => `
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="width: 32px; vertical-align: top; padding: 8pt 4pt 8pt 0;">
            <span style="display: inline-block; width: 22px; height: 22px; line-height: 22px; text-align: center; border-radius: 50%; background-color: #DBEAFE; color: #1E40AF; font-size: 9pt; font-weight: 700;">
              ${it.number}
            </span>
          </td>
          <td style="vertical-align: top; padding: 8pt 4pt; font-size: 9.5pt; color: #1E293B;">
            <strong style="color: #0F172A; text-transform: uppercase; font-size: 9pt; letter-spacing: 0.02em;">${escapeHtml(it.title)}</strong>
            ${it.desc ? `<div style="color: #475569; margin-top: 2pt; line-height: 1.45;">${escapeHtml(it.desc)}</div>` : ''}
          </td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>
  </div>
</div>`;
}

/**
 * 5. Multi-Column Grid Table Transformer (Image 1)
 */
function isGridTable(text: string): boolean {
  const lines = text.split('\n');
  const pipeLines = lines.filter((l) => (l.match(/\|/g) || []).length >= 3);
  return pipeLines.length >= 2;
}

function transformGridTable(text: string): string {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  let bannerTitle = '';
  const rows: string[][] = [];
  let currentCells: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Spanning Title banner
    if (line.startsWith('|') && line.endsWith('|') && (line.match(/\|/g) || []).length === 2) {
      const candidate = line.replace(/\|/g, '').trim();
      if (candidate && !candidate.startsWith('---') && !candidate.startsWith('===')) {
        bannerTitle = candidate;
        continue;
      }
    }

    // Grid row divider +---+---+
    if (/^\+[-=+]{3,}\+$/.test(line)) {
      if (currentCells.length > 0) {
        rows.push([...currentCells]);
        currentCells = [];
      }
      continue;
    }

    // Pipe row with columns | col1 | col2 | col3 |
    if (line.startsWith('|') && line.endsWith('|')) {
      const rawCells = line
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      if (currentCells.length === 0) {
        currentCells = rawCells;
      } else {
        // Multi-line cell text continuation: concatenate with space or line break
        for (let c = 0; c < Math.max(currentCells.length, rawCells.length); c++) {
          const oldVal = currentCells[c] || '';
          const newVal = rawCells[c] || '';
          if (newVal) {
            currentCells[c] = oldVal ? `${oldVal} ${newVal}` : newVal;
          }
        }
      }
    }
  }

  if (currentCells.length > 0) {
    rows.push(currentCells);
  }

  if (rows.length === 0) {
    return transformGenericAsciiTable(text);
  }

  const maxCols = Math.max(...rows.map((r) => r.length));
  const colWidthPct = Math.floor(100 / maxCols);

  return `
<div class="grid-table-wrapper" style="margin: 16pt 0; width: 100%;">
  <table style="width: 100%; border-collapse: collapse; border: 1.5pt solid #1E3A8A; border-radius: 6pt; overflow: hidden;">
    ${
      bannerTitle
        ? `
    <thead>
      <tr>
        <th colspan="${maxCols}" style="background-color: #1E3A8A; color: #FFFFFF; padding: 10pt 14pt; text-align: center; font-size: 11pt; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
          ${escapeHtml(bannerTitle)}
        </th>
      </tr>
    </thead>`
        : ''
    }
    <tbody>
      ${rows
        .map((row, rIdx) => {
          const isEven = rIdx % 2 === 0;
          return `
      <tr style="background-color: ${isEven ? '#FFFFFF' : '#F8FAFC'}; border-bottom: 1pt solid #E2E8F0;">
        ${row
          .map((cell) => {
            // Check if cell starts with a title e.g. "1. CURRICULAR EXCELLENCE:" or "CURRICULAR EXCELLENCE"
            const titleMatch = cell.match(/^(\d+\.\s*)?([A-Z\s&]{3,}:?)\s*(.*)$/);
            let formattedCell = cell;
            if (titleMatch) {
              const num = titleMatch[1] || '';
              const heading = titleMatch[2] || '';
              const rest = titleMatch[3] || '';
              formattedCell = `<div style="font-weight: 700; color: #1E3A8A; font-size: 9.5pt; margin-bottom: 3pt;">${escapeHtml(num + heading)}</div><div style="font-size: 8.5pt; color: #475569; line-height: 1.45;">${escapeHtml(rest)}</div>`;
            } else {
              formattedCell = `<div style="font-size: 9pt; color: #1E293B; line-height: 1.45;">${escapeHtml(cell)}</div>`;
            }

            return `
        <td style="width: ${colWidthPct}%; padding: 10pt 12pt; vertical-align: top; border-right: 1pt solid #E2E8F0;">
          ${formattedCell}
        </td>`;
          })
          .join('')}
      </tr>`;
        })
        .join('')}
    </tbody>
  </table>
</div>`;
}

/**
 * 6. Fallback generic ASCII table parser
 */
function transformGenericAsciiTable(text: string): string {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const rows: string[][] = [];

  for (const line of lines) {
    if (/^\+[-=+]{3,}\+$/.test(line.trim())) continue;
    if (line.includes('|')) {
      const cells = line
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((c) => c.trim())
        .filter((c) => !/^[-=]+$/.test(c));

      if (cells.length > 0) {
        rows.push(cells);
      }
    }
  }

  if (rows.length === 0) {
    return `<pre><code>${escapeHtml(text)}</code></pre>`;
  }

  const maxCols = Math.max(...rows.map((r) => r.length));
  const isHeader = rows.length > 1;

  let html = '<table style="width: 100%; border-collapse: collapse; margin: 12pt 0;">\n';
  if (isHeader) {
    html += '  <thead>\n    <tr style="background-color: #1E3A8A; color: #FFFFFF;">\n';
    rows[0].forEach((cell) => {
      html += `      <th style="padding: 8pt 10pt; border: 1px solid #CBD5E1; text-align: left; font-size: 9.5pt;">${escapeHtml(cell)}</th>\n`;
    });
    html += '    </tr>\n  </thead>\n  <tbody>\n';
    rows.slice(1).forEach((row, idx) => {
      const bg = idx % 2 === 1 ? 'background-color: #F8FAFC;' : '';
      html += `    <tr style="${bg} border-bottom: 1px solid #E2E8F0;">\n`;
      row.forEach((cell) => {
        html += `      <td style="padding: 8pt 10pt; border: 1px solid #E2E8F0; font-size: 9pt;">${escapeHtml(cell)}</td>\n`;
      });
      html += '    </tr>\n';
    });
    html += '  </tbody>\n';
  } else {
    html += '  <tbody>\n';
    rows.forEach((row) => {
      html += '    <tr style="border-bottom: 1px solid #E2E8F0;">\n';
      row.forEach((cell) => {
        html += `      <td style="padding: 8pt 10pt; border: 1px solid #E2E8F0; font-size: 9pt;">${escapeHtml(cell)}</td>\n`;
      });
      html += '    </tr>\n';
    });
    html += '  </tbody>\n';
  }
  html += '</table>';
  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
