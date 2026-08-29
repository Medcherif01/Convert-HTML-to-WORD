import React, { useRef, useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileDown,
  Printer,
  FileCheck,
  Eye,
  Columns,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { DocumentSettings } from '../types';
import { sanitizeAndEnhanceHtml } from '../utils/htmlParser';

interface PreviewPaneProps {
  htmlContent: string;
  settings: DocumentSettings;
  previewRef: React.RefObject<HTMLDivElement | null>;
  onExportDocx: () => void;
  onExportPdf: () => void;
  isGeneratingDocx: boolean;
  isGeneratingPdf: boolean;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  htmlContent,
  settings,
  previewRef,
  onExportDocx,
  onExportPdf,
  isGeneratingDocx,
  isGeneratingPdf,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLandscape = settings.orientation === 'landscape';

  // Dynamic CSS variables derived from user settings
  const dynamicPreviewStyle: React.CSSProperties = {
    fontFamily: `"${settings.typography.bodyFont}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
    color: settings.theme.text,
    lineHeight: settings.typography.lineSpacing,
    fontSize: `${settings.typography.baseFontSizePt}pt`,
    paddingTop: `${settings.margins.top}mm`,
    paddingBottom: `${settings.margins.bottom}mm`,
    paddingLeft: `${settings.margins.left}mm`,
    paddingRight: `${settings.margins.right}mm`,
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Top Preview Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Eye className="w-4 h-4 text-blue-400" />
            <span>Document Live Preview ({settings.pageSize} format)</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
            {isLandscape ? '297 × 210 mm' : '210 × 297 mm'}
          </span>
        </div>

        {/* Zoom & Quick Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
              title="Zoom out"
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-300 min-w-[44px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))))}
              title="Zoom in"
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(0.85)}
              title="Reset zoom"
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={onExportDocx}
            disabled={isGeneratingDocx}
            title="Download directly as Word (.docx)"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Word .docx</span>
          </button>

          <button
            onClick={onExportPdf}
            disabled={isGeneratingPdf}
            title="Download directly as PDF"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Main Sheet Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-slate-950/90 scrollbar-thin"
      >
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="pb-12"
        >
          {/* Real A4 Paper Simulation Canvas */}
          <div
            id="a4-document-sheet"
            ref={previewRef}
            style={{
              width: isLandscape ? '297mm' : '210mm',
              minHeight: isLandscape ? '210mm' : '297mm',
              backgroundColor: '#FFFFFF',
              ...dynamicPreviewStyle,
            }}
            className="shadow-2xl rounded-xs flex flex-col justify-between relative text-slate-900 print:shadow-none print:m-0"
          >
            {/* Embedded Dynamic Style Tag to style HTML elements (Headings, Tables, Lists, Callouts, Diagrams, Page Breaks) matching Word output */}
            <style>{`
              #a4-document-sheet h1 {
                font-family: "${settings.typography.headingFont}", sans-serif;
                font-size: ${settings.typography.h1SizePt}pt;
                font-weight: 700;
                color: ${settings.theme.primary};
                margin-top: 24pt;
                margin-bottom: 12pt;
                line-height: 1.25;
                letter-spacing: -0.015em;
              }
              #a4-document-sheet h1:not(:first-of-type) {
                ${settings.pageBreaks?.breakBeforeH1 !== false ? 'break-before: page; page-break-before: always;' : ''}
              }
              #a4-document-sheet > h1:first-child,
              #a4-document-sheet > div:first-child h1:first-child {
                margin-top: 0 !important;
                break-before: auto !important;
                page-break-before: auto !important;
              }
              #a4-document-sheet h2 {
                font-family: "${settings.typography.headingFont}", sans-serif;
                font-size: ${settings.typography.h2SizePt}pt;
                font-weight: 700;
                color: ${settings.theme.secondary};
                margin-top: 18pt;
                margin-bottom: 8pt;
                line-height: 1.3;
              }
              #a4-document-sheet h3 {
                font-family: "${settings.typography.headingFont}", sans-serif;
                font-size: ${settings.typography.h3SizePt}pt;
                font-weight: 600;
                color: ${settings.theme.headingColor};
                margin-top: 12pt;
                margin-bottom: 6pt;
                line-height: 1.35;
              }
              #a4-document-sheet p {
                margin-bottom: ${settings.typography.paragraphSpacingAfterPt}pt;
                color: ${settings.theme.text};
              }
              #a4-document-sheet strong, #a4-document-sheet b {
                font-weight: 700;
                color: ${settings.theme.headingColor};
              }
              #a4-document-sheet em, #a4-document-sheet i {
                font-style: italic;
              }
              #a4-document-sheet a {
                color: ${settings.theme.secondary};
                text-decoration: underline;
              }
              #a4-document-sheet hr {
                border: 0;
                height: 1.5pt;
                background-color: ${settings.theme.accent};
                margin: 14pt 0 16pt 0;
              }
              #a4-document-sheet blockquote {
                margin: 12pt 0;
                padding: 8pt 12pt;
                border-left: 3.5pt solid ${settings.theme.primary};
                background-color: ${settings.theme.calloutInfoBg};
                font-style: italic;
                color: ${settings.theme.textMuted};
                border-radius: 0 4pt 4pt 0;
              }
              #a4-document-sheet .callout, #a4-document-sheet .alert {
                margin: 12pt 0;
                padding: 10pt 14pt;
                border-left: 4pt solid ${settings.theme.calloutInfoBorder};
                border-top: 1px solid ${settings.theme.tableBorder};
                border-right: 1px solid ${settings.theme.tableBorder};
                border-bottom: 1px solid ${settings.theme.tableBorder};
                background-color: ${settings.theme.calloutInfoBg};
                border-radius: 0 6pt 6pt 0;
              }

              /* Page Breaks */
              #a4-document-sheet .page-break {
                break-before: page;
                page-break-before: always;
              }

              /* Visual divider line only for empty page break divider tags */
              #a4-document-sheet div.page-break:empty,
              #a4-document-sheet hr.page-break,
              #a4-document-sheet .page-break-divider {
                break-before: page;
                page-break-before: always;
                margin: 20pt 0 16pt 0;
                position: relative;
                height: 1px;
                border-top: 1.5px dashed #94A3B8;
                display: block;
                clear: both;
              }
              #a4-document-sheet div.page-break:empty::after,
              #a4-document-sheet hr.page-break::after,
              #a4-document-sheet .page-break-divider::after {
                content: "✂ PAGE BREAK — NEW PAGE";
                position: absolute;
                top: -8pt;
                left: 50%;
                transform: translateX(-50%);
                background-color: #F8FAFC;
                color: #64748B;
                padding: 1px 8px;
                font-size: 7.5pt;
                font-weight: 700;
                letter-spacing: 0.08em;
                border-radius: 9999px;
                border: 1px solid #CBD5E1;
                white-space: nowrap;
              }

              @media print {
                #a4-document-sheet div.page-break:empty,
                #a4-document-sheet hr.page-break,
                #a4-document-sheet .page-break-divider {
                  border: none !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  height: 0 !important;
                }
                #a4-document-sheet div.page-break:empty::after,
                #a4-document-sheet hr.page-break::after,
                #a4-document-sheet .page-break-divider::after {
                  display: none !important;
                }
              }

              /* Part / Chapter Banners */
              #a4-document-sheet .part-banner {
                break-before: page;
                page-break-before: always;
                margin: 20pt 0 16pt 0;
                border: 2pt solid ${settings.theme.primary};
                border-radius: 8pt;
                overflow: hidden;
              }

              /* Executive Diagrams & Figures */
              #a4-document-sheet .diagram-converging,
              #a4-document-sheet .diagram-streams-matrix,
              #a4-document-sheet .diagram-tier-engine,
              #a4-document-sheet .diagram-stage-cycle,
              #a4-document-sheet .comparison-diagram,
              #a4-document-sheet .priority-box {
                break-inside: avoid;
                page-break-inside: avoid;
                margin: 18pt 0;
                clear: both;
              }

              #a4-document-sheet .diagram-converging table,
              #a4-document-sheet .diagram-streams-matrix table,
              #a4-document-sheet .diagram-stage-cycle table,
              #a4-document-sheet .comparison-diagram table {
                margin: 0 !important;
                border: none !important;
              }

              #a4-document-sheet .diagram-converging table td,
              #a4-document-sheet .diagram-converging table th,
              #a4-document-sheet .diagram-streams-matrix table td,
              #a4-document-sheet .diagram-streams-matrix table th,
              #a4-document-sheet .diagram-stage-cycle table td,
              #a4-document-sheet .diagram-stage-cycle table th,
              #a4-document-sheet .comparison-diagram table td,
              #a4-document-sheet .comparison-diagram table th {
                border-color: inherit;
              }

              #a4-document-sheet ul {
                list-style-type: disc;
                margin-left: 18pt;
                margin-bottom: ${settings.typography.paragraphSpacingAfterPt}pt;
              }
              #a4-document-sheet ol {
                list-style-type: decimal;
                margin-left: 18pt;
                margin-bottom: ${settings.typography.paragraphSpacingAfterPt}pt;
              }
              #a4-document-sheet li {
                margin-bottom: 4pt;
              }
              #a4-document-sheet table {
                width: 100%;
                border-collapse: collapse;
                margin: 14pt 0;
                font-size: ${settings.typography.baseFontSizePt - 1}pt;
              }
              #a4-document-sheet th {
                background-color: ${settings.tables.headerBgColor};
                color: ${settings.tables.headerTextColor};
                font-weight: ${settings.tables.headerBold ? '700' : '500'};
                padding: ${settings.tables.cellPaddingMm}mm;
                border: ${settings.tables.borderWidthPt}pt solid ${settings.tables.borderColor};
                text-align: left;
              }
              #a4-document-sheet td {
                padding: ${settings.tables.cellPaddingMm}mm;
                border: ${settings.tables.borderWidthPt}pt solid ${settings.tables.borderColor};
                color: ${settings.theme.text};
              }
              ${
                settings.tables.zebraStriping
                  ? `#a4-document-sheet tbody tr:nth-child(even) {
                      background-color: ${settings.tables.zebraBgColor};
                    }`
                  : ''
              }
              ${
                settings.tables.style === 'minimal'
                  ? `#a4-document-sheet th, #a4-document-sheet td {
                      border-left: none !important;
                      border-right: none !important;
                    }`
                  : ''
              }
              #a4-document-sheet pre, #a4-document-sheet code {
                font-family: "Courier New", Courier, monospace;
                background-color: #F1F5F9;
                border-radius: 3pt;
              }
              #a4-document-sheet code {
                padding: 1pt 4pt;
                font-size: 0.9em;
                color: ${settings.theme.primary};
              }
              #a4-document-sheet pre {
                padding: 8pt 10pt;
                margin: 8pt 0;
                overflow-x: auto;
                font-size: 0.85em;
              }
            `}</style>

            {/* Document Header Section */}
            {settings.headerFooter.enableHeader ? (
              <div
                style={{
                  borderBottom: settings.headerFooter.headerShowDivider
                    ? `1px solid ${settings.headerFooter.headerDividerColor}`
                    : 'none',
                  paddingBottom: '4mm',
                  marginBottom: '6mm',
                }}
                className="flex items-center justify-between text-[9pt] text-slate-500 font-medium"
              >
                <div className="text-left truncate max-w-[35%]">
                  {settings.headerFooter.headerLeft}
                </div>
                <div className="text-center truncate max-w-[30%]">
                  {settings.headerFooter.headerCenter}
                </div>
                <div className="text-right truncate max-w-[35%]">
                  {settings.headerFooter.headerRight}
                </div>
              </div>
            ) : (
              <div />
            )}

            {/* Document Body (Rendered HTML) */}
            <div
              className="flex-1 w-full"
              dangerouslySetInnerHTML={{
                __html: sanitizeAndEnhanceHtml(htmlContent) || '<p><em>Empty document.</em></p>',
              }}
            />

            {/* Document Footer Section */}
            {settings.headerFooter.enableFooter ? (
              <div
                style={{
                  borderTop: settings.headerFooter.footerShowDivider
                    ? `1px solid ${settings.headerFooter.footerDividerColor}`
                    : 'none',
                  paddingTop: '4mm',
                  marginTop: '8mm',
                }}
                className="flex items-center justify-between text-[9pt] text-slate-500 font-medium"
              >
                <div className="text-left truncate max-w-[45%]">
                  {settings.headerFooter.footerLeft}
                </div>
                <div className="text-center truncate max-w-[20%]">
                  {settings.headerFooter.footerCenter}
                </div>
                <div className="text-right truncate max-w-[35%] font-mono text-[8.5pt]">
                  {settings.headerFooter.footerRightType === 'page-x-of-y' && 'Page 1 of 1'}
                  {settings.headerFooter.footerRightType === 'page-x' && 'Page 1'}
                  {settings.headerFooter.footerRightType === 'custom' &&
                    settings.headerFooter.footerCustomRight}
                  {settings.headerFooter.footerRightType === 'none' && ''}
                </div>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
