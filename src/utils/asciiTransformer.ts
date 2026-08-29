/**
 * Safe, Non-Destructive ASCII Art, Box Tables, Flowcharts, and Diagram Transformer
 * Formats ASCII tables and diagrams into executive styled HTML without dropping any content.
 */

export interface DiagramConversionResult {
  hasConverted: boolean;
  html: string;
}

/**
 * Checks if a string or block contains ASCII table/box/diagram structures or multi-stage processes
 */
export function hasAsciiArtOrDiagram(text: string): boolean {
  if (!text) return false;
  const hasBoxBorders = /^\+[-=]{3,}\+/m.test(text);
  const hasPipesAndDashes = /\|.*\|/.test(text) && /[-=]{4,}/.test(text);
  const hasFlowArrows = /(\\\s*\/|\/\s*\\|===>|<===|--->|<---|-->|<--|───>|<───)/.test(text);
  const hasConvergingPattern = text.includes('\\') && text.includes('/') && (text.includes('--->') || text.includes('<---') || text.includes('===>') || text.includes('ECOSYSTEM') || text.includes('INTEGRATED'));
  const hasTierPattern = /(?:3-TIER|MULTI-TIER|TIER 1|TIER 2|TIER 3)/i.test(text) && (text.includes('TIER 1') || text.includes('TIER 2'));
  const hasStagePattern = /(?:STAGE 1|STAGE 2|STAGE 3|STAGE 4|COACHING CYCLE|INSTRUCTIONAL COACHING)/i.test(text) && (text.includes('STAGE 1') || text.includes('STAGE 2'));
  return hasBoxBorders || hasPipesAndDashes || hasFlowArrows || hasConvergingPattern || hasTierPattern || hasStagePattern;
}

/**
 * Transforms ASCII diagrams and multi-tier / multi-stage processes while strictly preserving all surrounding text,
 * paragraphs, and headings in their exact natural order.
 */
export function transformAsciiAndDiagramsToHtml(rawText: string): string {
  if (!rawText) return rawText;

  const lines = rawText.split(/\r?\n/);
  const totalLines = lines.length;
  const processedBlocks: string[] = [];

  let i = 0;
  while (i < totalLines) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Check if line starts a Converging Diagram (lookahead check)
    const convergingRange = detectConvergingDiagramRange(lines, i);
    if (convergingRange) {
      const diagramLines = lines.slice(convergingRange.start, convergingRange.end + 1);
      const html = transformConvergingDiagram(diagramLines.join('\n'));
      processedBlocks.push(html);
      i = convergingRange.end + 1;
      continue;
    }

    // 2. Check for 3-Tier Data Engine / Tiered Architecture
    const tierRange = detectTierEngineRange(lines, i);
    if (tierRange) {
      const tierLines = lines.slice(tierRange.start, tierRange.end + 1);
      processedBlocks.push(transformTierEngineDiagram(tierLines.join('\n')));
      i = tierRange.end + 1;
      continue;
    }

    // 3. Check for 4-Stage Instructional Coaching Cycle / Process Flow
    const stageRange = detectStageCycleRange(lines, i);
    if (stageRange) {
      const stageLines = lines.slice(stageRange.start, stageRange.end + 1);
      processedBlocks.push(transformStageCycleDiagram(stageLines.join('\n')));
      i = stageRange.end + 1;
      continue;
    }

    // 4. Check if line starts a Spanning Header Matrix / Box (Image 2 - Audit Streams)
    const boxMatrixRange = detectBoxTableRange(lines, i);
    if (boxMatrixRange) {
      const matrixLines = lines.slice(boxMatrixRange.start, boxMatrixRange.end + 1);
      const blockText = matrixLines.join('\n');
      if (isSpanningHeaderMatrix(blockText)) {
        processedBlocks.push(transformSpanningHeaderMatrix(blockText));
      } else if (isComparisonDiagram(blockText)) {
        processedBlocks.push(transformComparisonDiagram(blockText));
      } else if (isGridTable(blockText)) {
        processedBlocks.push(transformGridTable(blockText));
      } else {
        processedBlocks.push(transformGenericAsciiTable(blockText));
      }
      i = boxMatrixRange.end + 1;
      continue;
    }

    // 5. Check for standalone Comparison Diagram (e.g. Historic Paradigm ===> 21st Century)
    if (trimmed.includes('===>') || trimmed.includes('<===') || (trimmed.includes('-->') && trimmed.includes('|'))) {
      const compRange = detectComparisonDiagramRange(lines, i);
      if (compRange) {
        const compLines = lines.slice(compRange.start, compRange.end + 1);
        processedBlocks.push(transformComparisonDiagram(compLines.join('\n')));
        i = compRange.end + 1;
        continue;
      }
    }

    // Normal line - pass through
    processedBlocks.push(line);
    i++;
  }

  return processedBlocks.join('\n');
}

/**
 * Detects 3-Tier Data Engine / Multi-Tier Framework range
 */
function detectTierEngineRange(lines: string[], currentIdx: number): { start: number; end: number } | null {
  const line = lines[currentIdx].trim();
  const isTierTitle = /(?:3-TIER|MULTI-TIER|DATA MONITORING ENGINE|TIERED DATA ARCHITECTURE)/i.test(line);
  const isTier1 = /^TIER\s+1\b/i.test(line) || /\|\s*TIER\s+1\b/i.test(line);

  if (!isTierTitle && !isTier1) return null;

  let startIdx = currentIdx;
  let endIdx = currentIdx;
  let hasFoundTiers = isTier1;

  for (let k = currentIdx; k < Math.min(lines.length, currentIdx + 15); k++) {
    const l = lines[k].trim();
    if (l === '' && hasFoundTiers) {
      // Allow one blank line
      if (k + 1 < lines.length && /(?:TIER\s+\d+|###|\*\*|####)/i.test(lines[k + 1])) {
        continue;
      }
      break;
    }
    if (l.startsWith('#') && !l.toLowerCase().includes('tier')) break;
    if (/(?:TIER\s+1|TIER\s+2|TIER\s+3)/i.test(l)) {
      hasFoundTiers = true;
      endIdx = k;
    } else if (hasFoundTiers && l.length > 0 && !l.startsWith('---') && !l.startsWith('###')) {
      endIdx = k;
    }
  }

  return hasFoundTiers ? { start: startIdx, end: endIdx } : null;
}

/**
 * Transforms Multi-Tier Data Monitoring Engine into an executive hierarchical card stack
 */
function transformTierEngineDiagram(text: string): string {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let mainTitle = '3-TIER DATA MONITORING ENGINE';

  const tiers: { level: string; label: string; desc: string }[] = [];
  let currentTier: { level: string; label: string; desc: string } | null = null;

  for (const line of lines) {
    if (/(?:3-TIER|MULTI-TIER|DATA MONITORING ENGINE)/i.test(line) && !/TIER\s+\d/i.test(line)) {
      mainTitle = line.replace(/^[#\*\-+|]+|[#\*\-+|]+$/g, '').trim();
      continue;
    }

    const tierMatch = line.match(/(?:\||\*\*)?\s*(TIER\s+\d+)\s*[:\-–—]\s*([^(\n]+)(?:\((.*)\)|:\s*(.*))?/i);
    if (tierMatch) {
      if (currentTier) tiers.push(currentTier);
      const level = tierMatch[1].trim();
      const label = tierMatch[2].replace(/[\*\-+|]/g, '').trim();
      const desc = (tierMatch[3] || tierMatch[4] || '').replace(/[\*\)\|]/g, '').trim();
      currentTier = { level, label, desc };
    } else if (currentTier && !line.startsWith('+') && !line.startsWith('---')) {
      const cleanLine = line.replace(/^[|*]+|[|*)]+$/g, '').trim();
      if (cleanLine) {
        currentTier.desc += (currentTier.desc ? ' ' : '') + cleanLine;
      }
    }
  }

  if (currentTier) tiers.push(currentTier);

  if (tiers.length === 0) {
    return transformGenericAsciiTable(text);
  }

  const tierColors = [
    { bg: '#EFF6FF', border: '#3B82F6', badge: '#1E40AF', badgeBg: '#DBEAFE', text: '#1E3A8A' },
    { bg: '#F8FAFC', border: '#64748B', badge: '#334155', badgeBg: '#E2E8F0', text: '#0F172A' },
    { bg: '#FAF5FF', border: '#A855F7', badge: '#6B21A8', badgeBg: '#F3E8FF', text: '#581C87' },
  ];

  return `
<div class="diagram-tier-engine" style="margin: 18pt 0; width: 100%; border: 1.5pt solid #1E3A8A; border-radius: 8pt; overflow: hidden; page-break-inside: avoid;">
  <div style="background-color: #1E3A8A; color: #FFFFFF; padding: 10pt 16pt; font-size: 11pt; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; text-align: center;">
    ${escapeHtml(mainTitle)}
  </div>
  <div style="padding: 12pt; background-color: #FFFFFF; display: flex; flex-direction: column; gap: 10pt;">
    ${tiers
      .map((t, idx) => {
        const theme = tierColors[idx % tierColors.length];
        return `
    <div style="border: 1.5pt solid ${theme.border}; border-radius: 6pt; background-color: ${theme.bg}; padding: 10pt 14pt; margin-bottom: 8pt;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6pt; border-bottom: 1px solid rgba(0,0,0,0.08); padding-bottom: 4pt;">
        <span style="background-color: ${theme.badgeBg}; color: ${theme.badge}; font-weight: 800; font-size: 9pt; padding: 2pt 8pt; border-radius: 4pt; text-transform: uppercase; letter-spacing: 0.05em;">
          ${escapeHtml(t.level)}
        </span>
        <span style="font-size: 10pt; font-weight: 700; color: ${theme.text}; text-transform: uppercase;">
          ${escapeHtml(t.label)}
        </span>
      </div>
      <div style="font-size: 9pt; color: #334155; line-height: 1.55;">
        ${escapeHtml(t.desc)}
      </div>
    </div>`;
      })
      .join('')}
  </div>
</div>`;
}

/**
 * Detects 4-Stage Coaching Cycle / Process Flow range
 */
function detectStageCycleRange(lines: string[], currentIdx: number): { start: number; end: number } | null {
  const line = lines[currentIdx].trim();
  const isStageTitle = /(?:COACHING CYCLE|INSTRUCTIONAL COACHING|4-STAGE|CYCLE DE COACHING)/i.test(line);
  const isStage1 = /^STAGE\s+1\b/i.test(line) || /\|\s*STAGE\s+1\b/i.test(line);

  if (!isStageTitle && !isStage1) return null;

  let startIdx = currentIdx;
  let endIdx = currentIdx;
  let hasFoundStages = isStage1;

  for (let k = currentIdx; k < Math.min(lines.length, currentIdx + 18); k++) {
    const l = lines[k].trim();
    if (l === '' && hasFoundStages) {
      if (k + 1 < lines.length && /(?:STAGE\s+\d+|###|\*\*|####)/i.test(lines[k + 1])) {
        continue;
      }
      break;
    }
    if (l.startsWith('#') && !l.toLowerCase().includes('stage')) break;
    if (/(?:STAGE\s+1|STAGE\s+2|STAGE\s+3|STAGE\s+4)/i.test(l)) {
      hasFoundStages = true;
      endIdx = k;
    } else if (hasFoundStages && l.length > 0 && !l.startsWith('---') && !l.startsWith('###')) {
      endIdx = k;
    }
  }

  return hasFoundStages ? { start: startIdx, end: endIdx } : null;
}

/**
 * Transforms 4-Stage Coaching Cycle into a horizontal / stacked process flow
 */
function transformStageCycleDiagram(text: string): string {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let cycleTitle = 'THE INSTRUCTIONAL COACHING CYCLE';

  const stages: { stageNum: string; title: string; desc: string }[] = [];
  let currentStage: { stageNum: string; title: string; desc: string } | null = null;

  for (const line of lines) {
    if (/(?:COACHING CYCLE|INSTRUCTIONAL COACHING|PROCESS FLOW)/i.test(line) && !/STAGE\s+\d/i.test(line)) {
      cycleTitle = line.replace(/^[#\*\-+|]+|[#\*\-+|]+$/g, '').trim();
      continue;
    }

    const stageMatch = line.match(/(?:\||\*\*)?\s*(STAGE\s+\d+)\s*[:\-–—]\s*([^(\n]+)(?:\((.*)\)|:\s*(.*))?/i);
    if (stageMatch) {
      if (currentStage) stages.push(currentStage);
      const stageNum = stageMatch[1].trim();
      const title = stageMatch[2].replace(/[\*\-+|]/g, '').trim();
      const desc = (stageMatch[3] || stageMatch[4] || '').replace(/[\*\)\|]/g, '').trim();
      currentStage = { stageNum, title, desc };
    } else if (currentStage && !line.startsWith('+') && !line.startsWith('---')) {
      const cleanLine = line.replace(/^[|*]+|[|*)]+$/g, '').trim();
      if (cleanLine) {
        currentStage.desc += (currentStage.desc ? ' ' : '') + cleanLine;
      }
    }
  }

  if (currentStage) stages.push(currentStage);

  if (stages.length === 0) {
    return transformGenericAsciiTable(text);
  }

  return `
<div class="diagram-stage-cycle" style="margin: 18pt 0; width: 100%; border: 1.5pt solid #1E3A8A; border-radius: 8pt; overflow: hidden; page-break-inside: avoid;">
  <div style="background-color: #1E3A8A; color: #FFFFFF; padding: 10pt 16pt; font-size: 11pt; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; text-align: center;">
    ${escapeHtml(cycleTitle)}
  </div>
  <table style="width: 100%; border-collapse: collapse; border: none; background-color: #FFFFFF;">
    ${stages
      .map((s, idx) => {
        const bg = idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF';
        return `
    <tr style="background-color: ${bg}; border-bottom: 1px solid #E2E8F0;">
      <td style="width: 160px; vertical-align: middle; padding: 12pt 14pt; border-right: 1.5pt solid #DBEAFE; background-color: #EFF6FF; text-align: center;">
        <div style="font-size: 8.5pt; font-weight: 800; color: #1E40AF; text-transform: uppercase; letter-spacing: 0.08em;">
          ${escapeHtml(s.stageNum)}
        </div>
        <div style="font-size: 9.5pt; font-weight: 700; color: #0F172A; margin-top: 2pt;">
          ${escapeHtml(s.title)}
        </div>
      </td>
      <td style="padding: 12pt 16pt; vertical-align: middle; font-size: 9pt; color: #334155; line-height: 1.55;">
        ${escapeHtml(s.desc)}
      </td>
    </tr>`;
      })
      .join('')}
  </table>
</div>`;
}

/**
 * Detects the full range (start to end line index) of a Converging Diagram
 * including preceding titles (e.g., SAUDI NATIONAL CURRICULUM ... INTERNATIONAL BENCHMARK)
 */
function detectConvergingDiagramRange(lines: string[], currentIdx: number): { start: number; end: number } | null {
  const line = lines[currentIdx];

  const hasConnectors = /(\\\s*\/|\/\s*\\|--->|<---|===>|<===|-->|<--)/.test(line) && (line.includes('\\') || line.includes('/'));

  let startIdx = currentIdx;
  let isPotentialPillars = false;

  if (!hasConnectors) {
    const parts = line.split(/\s{3,}/).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2 && currentIdx + 1 < lines.length) {
      const next1 = lines[currentIdx + 1];
      const next2 = currentIdx + 2 < lines.length ? lines[currentIdx + 2] : '';
      if ((next1.includes('\\') && next1.includes('/')) || (next2.includes('\\') && next2.includes('/'))) {
        isPotentialPillars = true;
      }
    }
  }

  if (!hasConnectors && !isPotentialPillars) {
    return null;
  }

  if (hasConnectors) {
    let lookBack = currentIdx - 1;
    while (lookBack >= 0 && lookBack >= currentIdx - 3) {
      const prevLine = lines[lookBack].trim();
      if (prevLine === '' || prevLine.startsWith('#') || prevLine.startsWith('+')) {
        break;
      }
      startIdx = lookBack;
      lookBack--;
    }
  }

  let endIdx = currentIdx;
  let foundEcosystem = false;

  for (let k = currentIdx; k < Math.min(lines.length, currentIdx + 12); k++) {
    const forwardLine = lines[k].trim();
    if (forwardLine === '') {
      if (foundEcosystem) break;
      continue;
    }
    if (forwardLine.startsWith('#') || forwardLine.startsWith('---') || forwardLine.startsWith('+===')) {
      break;
    }
    if (/(ECOSYSTEM|CURRICULUM|FRAMEWORK|INTEGRATED|APPROACH|SYSTEM|PROGRAM)/i.test(forwardLine)) {
      foundEcosystem = true;
    }
    endIdx = k;
  }

  return { start: startIdx, end: endIdx };
}

/**
 * Detects the full range of an ASCII box / grid table
 */
function detectBoxTableRange(lines: string[], currentIdx: number): { start: number; end: number } | null {
  const line = lines[currentIdx].trim();
  const isTopBorder = /^\+[-=+]{3,}\+$/.test(line);

  if (!isTopBorder) return null;

  let endIdx = currentIdx;
  for (let k = currentIdx + 1; k < lines.length; k++) {
    const l = lines[k].trim();
    if (l === '') break;
    if (/^\+[-=+]{3,}\+$/.test(l)) {
      endIdx = k;
      if (k + 1 < lines.length && lines[k + 1].trim().startsWith('|')) {
        continue;
      } else {
        break;
      }
    } else if (l.startsWith('|') && l.endsWith('|')) {
      endIdx = k;
    } else {
      break;
    }
  }

  return endIdx > currentIdx ? { start: currentIdx, end: endIdx } : null;
}

/**
 * Detects range for comparison diagram
 */
function detectComparisonDiagramRange(lines: string[], currentIdx: number): { start: number; end: number } | null {
  let startIdx = currentIdx;
  let endIdx = currentIdx;

  for (let k = currentIdx; k < Math.min(lines.length, currentIdx + 15); k++) {
    const l = lines[k].trim();
    if (l === '' || l.startsWith('#')) break;
    if (l.includes('|') || l.includes('===>') || l.includes('--->')) {
      endIdx = k;
    }
  }

  return endIdx >= startIdx ? { start: startIdx, end: endIdx } : null;
}

/**
 * Transforms Converging Diagram into an executive architectural component
 */
function transformConvergingDiagram(text: string): string {
  const lines = text.split('\n');
  const topLines: string[] = [];
  const bottomLines: string[] = [];
  let hitConnectors = false;

  for (const line of lines) {
    if (/^\s*(\\|\/|\s)+(--->|<---|===>|<===)?/.test(line) && (line.includes('\\') || line.includes('/') || line.includes('--->') || line.includes('<---'))) {
      hitConnectors = true;
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

  let leftTitle = 'SAUDI NATIONAL CURRICULUM';
  let leftSub = 'Statutory Core & Identity';
  let rightTitle = 'INTERNATIONAL BENCHMARK FRAMEWORK';
  let rightSub = 'Pedagogy, Progression & Rigour';

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

  let targetTitle = 'ALKAWTHAR INTEGRATED CURRICULUM ECOSYSTEM';
  let targetSub = 'Academically Rigorous, Culturally Grounded, and Globally Competitive KG-Y6';

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
        ${leftSub ? `<div style="font-size: 8.5pt; color: #475569; font-weight: 500; line-height: 1.4;">(${escapeHtml(leftSub)})</div>` : ''}
      </td>

      <!-- Right Pillar -->
      <td style="width: 48%; background-color: #F0FDF4; border: 1.5pt solid #22C55E; border-radius: 6pt; padding: 12pt; vertical-align: top; text-align: center;">
        <div style="font-size: 10.5pt; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4pt;">
          ${escapeHtml(rightTitle)}
        </div>
        ${rightSub ? `<div style="font-size: 8.5pt; color: #475569; font-weight: 500; line-height: 1.4;">(${escapeHtml(rightSub)})</div>` : ''}
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
            (${escapeHtml(targetSub)})
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
  let titleLeft = 'Current State / Baseline';
  let titleRight = 'Target State / Future';

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
