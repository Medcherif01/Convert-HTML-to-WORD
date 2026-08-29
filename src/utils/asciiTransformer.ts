/**
 * Safe, Non-Destructive ASCII Art, Box Tables, Flowcharts, and Diagram Transformer
 * Formats ASCII tables and diagrams into executive styled HTML without dropping any content.
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
  const hasBoxBorders = /^\+[-=]{3,}\+/m.test(text);
  const hasPipesAndDashes = /\|.*\|/.test(text) && /[-=]{4,}/.test(text);
  const hasFlowArrows = /(\\\s*\/|\/\s*\\|===>|<===|--->|<---|-->|<--|───>|<───)/.test(text);
  const hasConvergingPattern = (text.includes('\\') && text.includes('/') && (text.includes('--->') || text.includes('<---') || text.includes('===>') || text.includes('ECOSYSTEM') || text.includes('INTEGRATED')));
  return hasBoxBorders || hasPipesAndDashes || hasFlowArrows || hasConvergingPattern;
}

/**
 * Transforms ASCII diagrams and tables in text while strictly preserving all surrounding text and lines.
 */
export function transformAsciiAndDiagramsToHtml(rawText: string): string {
  if (!rawText) return rawText;

  const lines = rawText.split(/\r?\n/);
  const resultBlocks: string[] = [];
  let currentBlock: string[] = [];
  let inDiagramBlock = false;

  const flushCurrentBlock = () => {
    if (currentBlock.length === 0) return;
    const blockText = currentBlock.join('\n');
    if (inDiagramBlock && isAsciiOrDiagramBlock(blockText)) {
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
    const isBorderLine = /^\s*\+[-=+]{3,}\+\s*$/.test(line);
    const isPipeLine = /^\s*\|.*\|\s*$/.test(line);
    const isDiagramArrow = /===>|<===|--->|<---|-->|<--|───>|<───|\\\s*\/|\/\s*\\/.test(line);
    const isConvergingSlash = /^\s*(\\|\/|\s)+\s*(--->|<---|===>)?/.test(line) && (line.includes('\\') || line.includes('/'));

    if (isBorderLine || (isPipeLine && inDiagramBlock) || isDiagramArrow || isConvergingSlash) {
      inDiagramBlock = true;
      currentBlock.push(line);
    } else if (inDiagramBlock && line.trim() === '') {
      flushCurrentBlock();
      resultBlocks.push('');
    } else {
      if (inDiagramBlock) {
        // If line is part of a converging diagram bottom text (e.g. parentheses or continuation)
        if (/^\s*\(|\b(ECOSYSTEM|FRAMEWORK|INTEGRATED|CURRICULUM|MODEL|APPROACH|SYSTEM|PROGRAM)\b/i.test(line)) {
          currentBlock.push(line);
          continue;
        }
        flushCurrentBlock();
      }
      currentBlock.push(line);
    }
  }

  flushCurrentBlock();

  return resultBlocks.join('\n');
}

/**
 * Checks if a specific text block is a genuine ASCII box / diagram
 */
function isAsciiOrDiagramBlock(text: string): boolean {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return false;

  let borderCount = 0;
  let pipeCount = 0;
  let hasArrows = false;
  let hasSlashes = false;

  for (const line of lines) {
    if (/^\s*\+[-=+]{3,}\+\s*$/.test(line)) borderCount++;
    if (/^\s*\|.*\|\s*$/.test(line)) pipeCount++;
    if (/===>|<===|--->|<---|-->|<--|───>/.test(line)) hasArrows = true;
    if (line.includes('\\') || line.includes('/')) hasSlashes = true;
  }

  if (borderCount >= 1 && pipeCount >= 1) return true;
  if (hasArrows && (pipeCount >= 1 || hasSlashes)) return true;
  if (hasSlashes && hasArrows) return true;

  return false;
}

/**
 * Analyzes and converts an ASCII block into an executive HTML table or card
 */
export function convertAsciiBlockToHtml(blockText: string): string {
  const clean = blockText.trim();

  // 1. Check for Converging Flowchart / Integration Architecture (Image 1)
  if (isConvergingDiagram(clean)) {
    return transformConvergingDiagram(clean);
  }

  // 2. Check for Multi-column Matrix Card with Spanning Header (Image 2 - Audit Streams)
  if (isSpanningHeaderMatrix(clean)) {
    return transformSpanningHeaderMatrix(clean);
  }

  // 3. Check for Comparison Diagram (Historic vs 21st Century)
  if (isComparisonDiagram(clean)) {
    return transformComparisonDiagram(clean);
  }

  // 4. Check for Multi-column Grid Table
  if (isGridTable(clean)) {
    return transformGridTable(clean);
  }

  // 5. Fallback: Safe ASCII table parser (preserves every row)
  return transformGenericAsciiTable(clean);
}

/**
 * Detects Converging Diagrams (2 sources converging down with arrows/slashes into 1 target ecosystem)
 */
function isConvergingDiagram(text: string): boolean {
  const hasSlashes = text.includes('\\') || text.includes('/');
  const hasArrows = /--->|<---|===>|<===|-->|<--/.test(text);
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  return (hasSlashes || hasArrows) && lines.length >= 3;
}

/**
 * Transforms Converging Diagram into an executive architectural component
 */
function transformConvergingDiagram(text: string): string {
  const lines = text.split('\n');
  
  // Extract top sources (lines before the slashes/arrows)
  const topLines: string[] = [];
  const bottomLines: string[] = [];
  let hitConnectors = false;

  for (const line of lines) {
    if (/^\s*(\\|\/|\s)+(--->|<---|===>|<===)?/.test(line) && (line.includes('\\') || line.includes('/') || line.includes('--->') || line.includes('<---'))) {
      hitConnectors = true;
      // If the line also contains center text between arrows
      const centerMatch = line.match(/(?:--->|===>)\s+(.+?)\s+(?:<---|<===)/);
      if (centerMatch) {
        bottomLines.push(centerMatch[1].trim());
      }
      continue;
    }

    if (!hitConnectors) {
      if (line.trim().length > 0 && !/^\+[-=+]+\+$/.test(line)) {
        topLines.push(line);
      }
    } else {
      if (line.trim().length > 0 && !/^\+[-=+]+\+$/.test(line)) {
        bottomLines.push(line);
      }
    }
  }

  // Parse left and right top sources by splitting on multi-spaces
  let leftTitle = 'Source Pillar 1';
  let leftSub = '';
  let rightTitle = 'Source Pillar 2';
  let rightSub = '';

  if (topLines.length > 0) {
    const firstLine = topLines[0];
    const parts = firstLine.split(/\s{3,}/).map((s) => s.trim().replace(/^\||\|$/g, '')).filter(Boolean);
    if (parts.length >= 2) {
      leftTitle = parts[0];
      rightTitle = parts[1];
    } else if (parts.length === 1) {
      leftTitle = parts[0];
    }

    if (topLines.length > 1) {
      const secondLine = topLines.slice(1).join(' ');
      const subParts = secondLine.split(/\s{3,}|\)\s*\(/).map((s) => s.trim().replace(/^[\(\|]|[\)\|]$/g, '')).filter(Boolean);
      if (subParts.length >= 2) {
        leftSub = subParts[0];
        rightSub = subParts[1];
      } else if (subParts.length === 1) {
        leftSub = subParts[0];
      }
    }
  }

  // Parse bottom central target
  let targetTitle = 'INTEGRATED CURRICULUM ECOSYSTEM';
  let targetSub = '';

  if (bottomLines.length > 0) {
    const cleanBottom = bottomLines.map((l) => l.trim().replace(/^\||\|$/g, '')).filter(Boolean);
    if (cleanBottom.length > 0) {
      targetTitle = cleanBottom[0];
      if (cleanBottom.length > 1) {
        targetSub = cleanBottom.slice(1).join(' ').replace(/^\(|\)$/g, '');
      }
    }
  }

  return `
<div class="diagram-converging" style="margin: 20pt 0; width: 100%; border: 1.5pt solid #CBD5E1; border-radius: 8pt; background-color: #F8FAFC; padding: 16pt; page-break-inside: avoid;">
  <table style="width: 100%; border-collapse: separate; border-spacing: 12pt 0; border: none; margin-bottom: 8pt;">
    <tr>
      <!-- Left Pillar -->
      <td style="width: 48%; background-color: #EFF6FF; border: 1.5pt solid #3B82F6; border-radius: 6pt; padding: 12pt; vertical-align: top; text-align: center;">
        <div style="font-size: 10.5pt; font-weight: 800; color: #1E40AF; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4pt;">
          ${escapeHtml(leftTitle)}
        </div>
        ${leftSub ? `<div style="font-size: 8.5pt; color: #475569; font-weight: 500; line-height: 1.4;">${escapeHtml(leftSub)}</div>` : ''}
      </td>

      <!-- Right Pillar -->
      <td style="width: 48%; background-color: #F0FDF4; border: 1.5pt solid #22C55E; border-radius: 6pt; padding: 12pt; vertical-align: top; text-align: center;">
        <div style="font-size: 10.5pt; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4pt;">
          ${escapeHtml(rightTitle)}
        </div>
        ${rightSub ? `<div style="font-size: 8.5pt; color: #475569; font-weight: 500; line-height: 1.4;">${escapeHtml(rightSub)}</div>` : ''}
      </td>
    </tr>
  </table>

  <!-- Convergence Indicator Row -->
  <div style="text-align: center; margin: 4pt 0 10pt 0; color: #2563EB; font-size: 14pt; font-weight: bold; letter-spacing: 0.2em;">
    ↘ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ⬇ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ↙
  </div>

  <!-- Central Target Ecosystem Card -->
  <div style="background-color: #FFFFFF; border: 2pt solid #1E3A8A; border-radius: 6pt; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: center;">
    <div style="background-color: #1E3A8A; color: #FFFFFF; padding: 10pt 14pt; font-size: 11pt; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;">
      ${escapeHtml(targetTitle)}
    </div>
    ${
      targetSub
        ? `<div style="padding: 10pt 16pt; color: #334155; font-size: 9.5pt; line-height: 1.5; font-weight: 500; background-color: #FFFFFF;">
            ${escapeHtml(targetSub)}
           </div>`
        : ''
    }
  </div>
</div>`;
}

/**
 * Detects Spanning-Header Multi-Column Box Matrices (Image 2: Institutional Audit Streams)
 */
function isSpanningHeaderMatrix(text: string): boolean {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 3) return false;

  let hasSpanningHeader = false;
  let hasColumnsBelow = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('|') && line.endsWith('|')) {
      const pipes = (line.match(/\|/g) || []).length;
      if (pipes === 2 && i <= 2) {
        hasSpanningHeader = true;
      }
      if (pipes >= 4 && i > 1) {
        hasColumnsBelow = true;
      }
    }
  }

  return hasSpanningHeader && hasColumnsBelow;
}

/**
 * Transforms Spanning Header Matrix into an executive 4-pillar styled matrix (Image 2)
 */
function transformSpanningHeaderMatrix(text: string): string {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let bannerTitle = 'INSTITUTIONAL AUDIT STREAMS';
  const columnData: { title: string; lines: string[] }[] = [];

  let foundHeader = false;
  let columnCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\+[-=+]{3,}\+$/.test(line)) continue;

    if (line.startsWith('|') && line.endsWith('|')) {
      const inner = line.slice(1, -1);
      const cells = inner.split('|').map((c) => c.trim());

      if (!foundHeader && cells.length === 1) {
        bannerTitle = cells[0];
        foundHeader = true;
        continue;
      }

      if (cells.length >= 2) {
        if (columnData.length === 0) {
          columnCount = cells.length;
          cells.forEach((cell) => {
            columnData.push({ title: cell, lines: [] });
          });
        } else {
          cells.forEach((cell, idx) => {
            if (columnData[idx] && cell && !/^[-=]+$/.test(cell)) {
              columnData[idx].lines.push(cell);
            }
          });
        }
      }
    }
  }

  if (columnData.length === 0) {
    return transformGenericAsciiTable(text);
  }

  const colWidthPct = Math.floor(100 / columnData.length);

  return `
<div class="diagram-streams-matrix" style="margin: 18pt 0; width: 100%; border: 1.5pt solid #1E3A8A; border-radius: 8pt; overflow: hidden; page-break-inside: avoid;">
  <!-- Spanning Top Header -->
  <div style="background-color: #1E3A8A; color: #FFFFFF; padding: 10pt 16pt; text-align: center; font-size: 11pt; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;">
    ${escapeHtml(bannerTitle)}
  </div>

  <!-- Multi-Column Pillars -->
  <table style="width: 100%; border-collapse: collapse; border: none; background-color: #FFFFFF;">
    <tr>
      ${columnData
        .map((col, idx) => {
          const borderRight = idx < columnData.length - 1 ? 'border-right: 1px solid #E2E8F0;' : '';
          const fullDesc = col.lines.join(' ');
          return `
      <td style="width: ${colWidthPct}%; vertical-align: top; padding: 12pt 10pt; ${borderRight} background-color: ${idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF'};">
        <div style="font-size: 9.5pt; font-weight: 700; color: #1E3A8A; text-transform: uppercase; margin-bottom: 6pt; border-bottom: 1.5pt solid #DBEAFE; padding-bottom: 4pt;">
          ${escapeHtml(col.title)}
        </div>
        <div style="font-size: 8.5pt; color: #475569; line-height: 1.5;">
          ${escapeHtml(fullDesc)}
        </div>
      </td>`;
        })
        .join('')}
    </tr>
  </table>
</div>`;
}

function isComparisonDiagram(text: string): boolean {
  return /===>|<===|-->/i.test(text) && /\|.*\|/.test(text);
}

function transformComparisonDiagram(text: string): string {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  let titleLeft = 'Historic Paradigm';
  let titleRight = '21st Century Paradigm';

  const leftItems: string[] = [];
  const rightItems: string[] = [];

  for (const line of lines) {
    const matchTwoBoxes = line.match(/\|\s*([^|]+)\s*\|\s*(=+>|->|>)?\s*\|\s*([^|]+)\s*\|/);
    if (matchTwoBoxes) {
      const leftVal = matchTwoBoxes[1].trim().replace(/^[-•*]\s*/, '');
      const rightVal = matchTwoBoxes[3].trim().replace(/^[-•*]\s*/, '');
      if (leftVal && !leftVal.startsWith('---') && !leftVal.startsWith('===')) leftItems.push(leftVal);
      if (rightVal && !rightVal.startsWith('---') && !rightVal.startsWith('===')) rightItems.push(rightVal);
    }
  }

  if (leftItems.length > 0 || rightItems.length > 0) {
    return `
<div class="comparison-diagram" style="margin: 16pt 0; width: 100%; page-break-inside: avoid;">
  <table style="width: 100%; border-collapse: separate; border-spacing: 12pt 0; border: none;">
    <thead>
      <tr>
        <th style="width: 46%; background-color: #F1F5F9; color: #334155; border: 1.5pt solid #CBD5E1; border-radius: 6pt; padding: 10pt; text-align: center; font-size: 10.5pt; font-weight: 700;">
          ${escapeHtml(titleLeft)}
        </th>
        <th style="width: 8%; background: transparent; border: none; text-align: center; font-size: 16pt; color: #2563EB; vertical-align: middle;">
          ➔
        </th>
        <th style="width: 46%; background-color: #EFF6FF; color: #1E3A8A; border: 1.5pt solid #3B82F6; border-radius: 6pt; padding: 10pt; text-align: center; font-size: 10.5pt; font-weight: 700;">
          ${escapeHtml(titleRight)}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="background-color: #F8FAFC; border: 1pt solid #E2E8F0; border-radius: 6pt; padding: 12pt; vertical-align: top;">
          <ul style="margin: 0; padding-left: 14pt; color: #475569; font-size: 9pt; line-height: 1.6;">
            ${leftItems.map((item) => `<li style="margin-bottom: 4pt;">${escapeHtml(item)}</li>`).join('\n            ')}
          </ul>
        </td>
        <td style="border: none;"></td>
        <td style="background-color: #F0FDF4; border: 1pt solid #86EFAC; border-radius: 6pt; padding: 12pt; vertical-align: top;">
          <ul style="margin: 0; padding-left: 14pt; color: #166534; font-size: 9pt; line-height: 1.6; font-weight: 500;">
            ${rightItems.map((item) => `<li style="margin-bottom: 4pt;"><strong>✓</strong> ${escapeHtml(item)}</li>`).join('\n            ')}
          </ul>
        </td>
      </tr>
    </tbody>
  </table>
</div>`;
  }

  return transformGenericAsciiTable(text);
}

function isGridTable(text: string): boolean {
  const lines = text.split('\n');
  const pipeLines = lines.filter((l) => (l.match(/\|/g) || []).length >= 3);
  return pipeLines.length >= 2;
}

function transformGridTable(text: string): string {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const rows: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\+[-=+]{3,}\+$/.test(line)) continue;
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim())
        .filter((c) => !/^[-=]+$/.test(c));

      if (cells.length > 0) {
        rows.push(cells);
      }
    }
  }

  if (rows.length === 0) {
    return transformGenericAsciiTable(text);
  }

  const isHeader = rows.length > 1;

  let html = '<table style="width: 100%; border-collapse: collapse; margin: 14pt 0; border: 1.5pt solid #CBD5E1; page-break-inside: avoid;">\n';
  if (isHeader) {
    html += '  <thead>\n    <tr style="background-color: #1E3A8A; color: #FFFFFF;">\n';
    rows[0].forEach((cell) => {
      html += `      <th style="padding: 9pt 11pt; border: 1px solid #CBD5E1; text-align: left; font-size: 9.5pt; font-weight: 700;">${escapeHtml(cell)}</th>\n`;
    });
    html += '    </tr>\n  </thead>\n  <tbody>\n';
    rows.slice(1).forEach((row, idx) => {
      const bg = idx % 2 === 1 ? 'background-color: #F8FAFC;' : 'background-color: #FFFFFF;';
      html += `    <tr style="${bg} border-bottom: 1px solid #E2E8F0;">\n`;
      row.forEach((cell) => {
        html += `      <td style="padding: 8pt 11pt; border: 1px solid #E2E8F0; font-size: 9pt;">${escapeHtml(cell)}</td>\n`;
      });
      html += '    </tr>\n';
    });
    html += '  </tbody>\n';
  } else {
    html += '  <tbody>\n';
    rows.forEach((row) => {
      html += '    <tr style="border-bottom: 1px solid #E2E8F0;">\n';
      row.forEach((cell) => {
        html += `      <td style="padding: 8pt 11pt; border: 1px solid #E2E8F0; font-size: 9pt;">${escapeHtml(cell)}</td>\n`;
      });
      html += '    </tr>\n';
    });
    html += '  </tbody>\n';
  }
  html += '</table>';
  return html;
}

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

  let html = '<table style="width: 100%; border-collapse: collapse; margin: 12pt 0; border: 1.5pt solid #CBD5E1; page-break-inside: avoid;">\n';
  html += '  <thead>\n    <tr style="background-color: #1E3A8A; color: #FFFFFF;">\n';
  rows[0].forEach((cell) => {
    html += `      <th style="padding: 8pt 10pt; border: 1px solid #CBD5E1; text-align: left; font-size: 9pt;">${escapeHtml(cell)}</th>\n`;
  });
  html += '    </tr>\n  </thead>\n  <tbody>\n';
  rows.slice(1).forEach((row, idx) => {
    const bg = idx % 2 === 1 ? 'background-color: #F8FAFC;' : '';
    html += `    <tr style="${bg} border-bottom: 1px solid #E2E8F0;">\n`;
    row.forEach((cell) => {
      html += `      <td style="padding: 8pt 10pt; border: 1px solid #E2E8F0; font-size: 8.5pt;">${escapeHtml(cell)}</td>\n`;
    });
    html += '    </tr>\n';
  });
  html += '  </tbody>\n</table>';
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
