import React, { useState } from 'react';
import {
  Download,
  FileCheck,
  Printer,
  FileText,
  CheckCircle2,
  Sliders,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { DocumentSettings } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DocumentSettings;
  onUpdateFileName: (name: string) => void;
  onExportDocx: () => void;
  onExportPdf: () => void;
  isGeneratingDocx: boolean;
  isGeneratingPdf: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateFileName,
  onExportDocx,
  onExportPdf,
  isGeneratingDocx,
  isGeneratingPdf,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Export Document</h3>
            <p className="text-xs text-slate-400">
              High-fidelity generation for Word (.docx) and A4 PDF
            </p>
          </div>
        </div>

        {/* File Name Configuration */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            File Name
          </label>
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm">
            <input
              type="text"
              value={settings.fileName}
              onChange={(e) => onUpdateFileName(e.target.value)}
              placeholder="My-Professional-Document"
              className="bg-transparent text-white w-full focus:outline-none font-medium"
            />
            <span className="text-xs text-slate-500 font-mono">.docx / .pdf</span>
          </div>
        </div>

        {/* Summary of formatting applied */}
        <div className="bg-slate-950/70 rounded-xl border border-slate-800 p-3.5 mb-6 text-xs space-y-2">
          <div className="font-semibold text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Applied Document Settings:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-400">
            <div>
              • Format: <strong className="text-slate-200">{settings.pageSize} {settings.orientation}</strong>
            </div>
            <div>
              • Margins: <strong className="text-slate-200">{settings.margins.top}mm / {settings.margins.left}mm</strong>
            </div>
            <div>
              • Font: <strong className="text-slate-200">{settings.typography.bodyFont} ({settings.typography.baseFontSizePt}pt)</strong>
            </div>
            <div>
              • Theme: <strong className="text-slate-200">{settings.theme.name}</strong>
            </div>
            <div>
              • Header: <strong className="text-slate-200">{settings.headerFooter.enableHeader ? 'Enabled' : 'Disabled'}</strong>
            </div>
            <div>
              • Numbering: <strong className="text-slate-200">{settings.headerFooter.footerRightType}</strong>
            </div>
          </div>
        </div>

        {/* Export Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              onExportDocx();
              onClose();
            }}
            disabled={isGeneratingDocx}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
          >
            <FileCheck className="w-4 h-4" />
            <span>Download .DOCX</span>
          </button>

          <button
            onClick={() => {
              onExportPdf();
              onClose();
            }}
            disabled={isGeneratingPdf}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-semibold text-sm shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
