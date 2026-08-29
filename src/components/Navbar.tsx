import React from 'react';
import {
  FileText,
  Download,
  FileCode,
  FileCheck,
  Palette,
  Sparkles,
  Printer,
  ChevronDown,
  Layout,
  Maximize2,
  Sliders,
} from 'lucide-react';
import { DocumentSettings, TemplateDoc } from '../types';
import { DOCUMENT_TEMPLATES } from '../data/templates';

interface NavbarProps {
  settings: DocumentSettings;
  onUpdateSettings: (newSettings: Partial<DocumentSettings>) => void;
  onLoadTemplate: (template: TemplateDoc) => void;
  onExportDocx: () => void;
  onExportPdf: () => void;
  isGeneratingDocx: boolean;
  isGeneratingPdf: boolean;
  activeSidebarTab: string;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onUpdateSettings,
  onLoadTemplate,
  onExportDocx,
  onExportPdf,
  isGeneratingDocx,
  isGeneratingPdf,
  onToggleSidebar,
}) => {
  const [templateMenuOpen, setTemplateMenuOpen] = React.useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-inner shadow-blue-400/30 flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg tracking-tight text-white leading-tight">
                Docx &amp; PDF Studio
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                A4 Word Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              HTML, Markdown &amp; Text &rarr; Formatted .docx &amp; .pdf documents
            </p>
          </div>
        </div>

        {/* Middle Quick Actions & Template Picker */}
        <div className="flex items-center gap-2">
          {/* Templates Dropdown */}
          <div className="relative">
            <button
              id="template-dropdown-btn"
              onClick={() => setTemplateMenuOpen(!templateMenuOpen)}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Document Templates</span>
              <span className="sm:hidden">Templates</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {templateMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setTemplateMenuOpen(false)}
                />
                <div className="absolute right-0 sm:left-0 mt-2 w-72 sm:w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 py-2 overflow-hidden">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-700">
                    Choose a ready-to-use template
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/50">
                    {DOCUMENT_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        onClick={() => {
                          onLoadTemplate(tmpl);
                          setTemplateMenuOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-700/60 transition group flex flex-col gap-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium text-slate-100 group-hover:text-blue-300">
                            {tmpl.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                            {tmpl.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {tmpl.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Page Orientation Toggle */}
          <div className="hidden lg:flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => onUpdateSettings({ orientation: 'portrait' })}
              className={`px-2.5 py-1 rounded font-medium transition ${
                settings.orientation === 'portrait'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Portrait
            </button>
            <button
              onClick={() => onUpdateSettings({ orientation: 'landscape' })}
              className={`px-2.5 py-1 rounded font-medium transition ${
                settings.orientation === 'landscape'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Landscape
            </button>
          </div>
        </div>

        {/* Right Download Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* DOCX Download Button */}
          <button
            id="download-docx-btn"
            onClick={onExportDocx}
            disabled={isGeneratingDocx}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileCheck className="w-4 h-4 text-blue-100" />
            <span className="hidden sm:inline">Download</span>
            <span className="font-mono text-[11px] sm:text-xs bg-blue-700 px-1.5 py-0.5 rounded text-blue-100">
              .DOCX
            </span>
          </button>

          {/* PDF Download Button */}
          <button
            id="download-pdf-btn"
            onClick={onExportPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-rose-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4 text-rose-100" />
            <span className="hidden sm:inline">Export</span>
            <span className="font-mono text-[11px] sm:text-xs bg-rose-700 px-1.5 py-0.5 rounded text-rose-100">
              .PDF
            </span>
          </button>

          {/* Settings Sidebar Toggle on Mobile/Tablet */}
          <button
            onClick={onToggleSidebar}
            title="Formatting and document settings"
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
          >
            <Sliders className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
