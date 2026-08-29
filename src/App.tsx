import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EditorPane } from './components/EditorPane';
import { SettingsSidebar } from './components/SettingsSidebar';
import { PreviewPane } from './components/PreviewPane';
import { ExportModal } from './components/ExportModal';
import { DocumentSettings, InputMode, TemplateDoc } from './types';
import { PRESET_THEMES } from './data/themes';
import { DOCUMENT_TEMPLATES } from './data/templates';
import { downloadDocx } from './utils/docxGenerator';
import { downloadPdf } from './utils/pdfGenerator';
import { extractDocumentTitle } from './utils/htmlParser';
import { CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

const DEFAULT_SETTINGS: DocumentSettings = {
  title: "Annual Activity Report",
  fileName: "Annual_Activity_Report_2026",
  pageSize: 'A4',
  orientation: 'portrait',
  margins: {
    top: 25,
    bottom: 25,
    left: 25,
    right: 25,
    preset: 'standard',
  },
  typography: {
    bodyFont: 'Calibri',
    headingFont: 'Calibri',
    baseFontSizePt: 11,
    h1SizePt: 22,
    h2SizePt: 15,
    h3SizePt: 12.5,
    lineSpacing: 1.15,
    paragraphSpacingAfterPt: 6,
  },
  theme: PRESET_THEMES[0],
  tables: {
    style: 'striped',
    headerBgColor: PRESET_THEMES[0].tableHeaderBg,
    headerTextColor: PRESET_THEMES[0].tableHeaderText,
    headerBold: true,
    zebraStriping: true,
    zebraBgColor: PRESET_THEMES[0].tableZebraBg,
    borderColor: PRESET_THEMES[0].tableBorder,
    borderWidthPt: 1,
    cellPaddingMm: 2.5,
    alignCenter: true,
    fullWidth: true,
  },
  headerFooter: {
    enableHeader: true,
    headerLeft: 'ANNUAL ACTIVITY REPORT',
    headerCenter: '',
    headerRight: 'EXECUTIVE MANAGEMENT',
    headerShowDivider: true,
    headerDividerColor: '#CBD5E1',

    enableFooter: true,
    footerLeft: 'Confidential Document — Internal Use Only',
    footerCenter: '',
    footerRightType: 'page-x-of-y',
    footerCustomRight: '',
    footerShowDivider: true,
    footerDividerColor: '#CBD5E1',

    differentFirstPage: false,
  },
  pageBreaks: {
    breakBeforeH1: true,
    breakBeforePart: true,
    breakAfterToc: true,
    showVisualPageBreaks: true,
  },
};

export default function App() {
  const [settings, setSettings] = useState<DocumentSettings>(DEFAULT_SETTINGS);
  const [inputMode, setInputMode] = useState<InputMode>('html');
  const [htmlContent, setHtmlContent] = useState<string>(DOCUMENT_TEMPLATES[0].htmlContent);
  const [rawTextContent, setRawTextContent] = useState<string>('');
  
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  
  const [isGeneratingDocx, setIsGeneratingDocx] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleUpdateSettings = (newPartial: Partial<DocumentSettings>) => {
    setSettings((prev) => ({ ...prev, ...newPartial }));
  };

  const handleLoadTemplate = (template: TemplateDoc) => {
    setHtmlContent(template.htmlContent);
    const themeFound = PRESET_THEMES.find((t) => t.id === template.defaultThemeId) || PRESET_THEMES[0];
    const extractedTitle = extractDocumentTitle(template.htmlContent, template.title);
    
    setSettings((prev) => ({
      ...prev,
      title: extractedTitle,
      fileName: template.id.replace(/-/g, '_'),
      theme: themeFound,
      tables: {
        ...prev.tables,
        headerBgColor: themeFound.tableHeaderBg,
        headerTextColor: themeFound.tableHeaderText,
        zebraBgColor: themeFound.tableZebraBg,
        borderColor: themeFound.tableBorder,
      },
      headerFooter: {
        ...prev.headerFooter,
        headerLeft: extractedTitle.toUpperCase(),
        headerDividerColor: themeFound.tableBorder,
        footerDividerColor: themeFound.tableBorder,
      },
    }));
    setInputMode('html');
    showToast(`Template "${template.title}" loaded successfully!`);
  };

  const handleExportDocx = async () => {
    try {
      setIsGeneratingDocx(true);
      await downloadDocx(htmlContent, settings);
      showToast(`Word document "${settings.fileName}.docx" exported successfully!`);
    } catch (error) {
      console.error('Error generating DOCX:', error);
      showToast('Error generating Word document.', 'error');
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  const handleExportPdf = async () => {
    if (!previewContainerRef.current) {
      showToast("Document preview is not ready.", 'error');
      return;
    }
    try {
      setIsGeneratingPdf(true);
      await downloadPdf(previewContainerRef.current, settings);
      showToast(`PDF document "${settings.fileName}.pdf" exported successfully!`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Error generating PDF document.', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onLoadTemplate={handleLoadTemplate}
        onExportDocx={handleExportDocx}
        onExportPdf={handleExportPdf}
        isGeneratingDocx={isGeneratingDocx}
        isGeneratingPdf={isGeneratingPdf}
        activeSidebarTab="theme"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left / Center Split: Editor & Live A4 Preview */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 h-full overflow-hidden">
          {/* Column 1: HTML / Text / File Editor */}
          <div className="h-full overflow-hidden border-r border-slate-800">
            <EditorPane
              inputMode={inputMode}
              onChangeInputMode={setInputMode}
              htmlContent={htmlContent}
              rawTextContent={rawTextContent}
              onChangeHtml={setHtmlContent}
              onChangeRawText={setRawTextContent}
            />
          </div>

          {/* Column 2: Live A4 WYSIWYG Sheet Preview */}
          <div className="h-full overflow-hidden bg-slate-950">
            <PreviewPane
              htmlContent={htmlContent}
              settings={settings}
              previewRef={previewContainerRef}
              onExportDocx={handleExportDocx}
              onExportPdf={handleExportPdf}
              isGeneratingDocx={isGeneratingDocx}
              isGeneratingPdf={isGeneratingPdf}
            />
          </div>
        </div>

        {/* Right Settings Sidebar */}
        <SettingsSidebar
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Export Options Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        settings={settings}
        onUpdateFileName={(name) => handleUpdateSettings({ fileName: name })}
        onExportDocx={handleExportDocx}
        onExportPdf={handleExportPdf}
        isGeneratingDocx={isGeneratingDocx}
        isGeneratingPdf={isGeneratingPdf}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold border ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-emerald-300 border-emerald-500/40 shadow-emerald-950/50'
                : 'bg-slate-900 text-rose-300 border-rose-500/40 shadow-rose-950/50'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
