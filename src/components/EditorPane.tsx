import React, { useRef } from 'react';
import {
  Code,
  FileText,
  Upload,
  Table as TableIcon,
  Heading1,
  Heading2,
  List,
  Quote,
  AlertCircle,
  Sparkles,
  Trash2,
  Copy,
  Check,
  FileCode,
  Layers,
} from 'lucide-react';
import { InputMode } from '../types';
import { prettifyHtml, convertTextOrMarkdownToHtml } from '../utils/htmlParser';

interface EditorPaneProps {
  inputMode: InputMode;
  onChangeInputMode: (mode: InputMode) => void;
  htmlContent: string;
  rawTextContent: string;
  onChangeHtml: (html: string) => void;
  onChangeRawText: (text: string) => void;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  inputMode,
  onChangeInputMode,
  htmlContent,
  rawTextContent,
  onChangeHtml,
  onChangeRawText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);

  // Statistics
  const textContent = inputMode === 'html' ? htmlContent.replace(/<[^>]*>/g, ' ') : rawTextContent;
  const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
  const chars = textContent.length;
  const estPages = Math.max(1, Math.ceil(words / 350));

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inputMode === 'html' ? htmlContent : rawTextContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormatCode = () => {
    if (inputMode === 'html') {
      onChangeHtml(prettifyHtml(htmlContent));
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the current content?')) {
      onChangeHtml('<p></p>');
      onChangeRawText('');
    }
  };

  const handleInsertTag = (snippet: string) => {
    if (inputMode === 'html') {
      onChangeHtml(htmlContent + '\n\n' + snippet);
    } else {
      onChangeRawText(rawTextContent + '\n\n' + snippet);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'html' || ext === 'htm') {
        onChangeHtml(result);
        onChangeInputMode('html');
      } else if (ext === 'md' || ext === 'txt' || ext === 'csv') {
        onChangeRawText(result);
        onChangeHtml(convertTextOrMarkdownToHtml(result));
        onChangeInputMode('text');
      } else {
        // Default treat as text
        onChangeRawText(result);
        onChangeHtml(convertTextOrMarkdownToHtml(result));
        onChangeInputMode('text');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100">
      {/* Top Mode Selector Tabs */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 gap-1 text-xs">
          <button
            id="tab-mode-html"
            onClick={() => onChangeInputMode('html')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
              inputMode === 'html'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>HTML Code</span>
          </button>

          <button
            id="tab-mode-text"
            onClick={() => onChangeInputMode('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
              inputMode === 'text'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Text / Markdown</span>
          </button>

          <button
            id="tab-mode-file"
            onClick={() => onChangeInputMode('file')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
              inputMode === 'file'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import File</span>
          </button>
        </div>

        {/* Quick Toolbar Actions */}
        <div className="flex items-center gap-1.5">
          {inputMode === 'html' && (
            <button
              onClick={handleFormatCode}
              title="Indent and format HTML"
              className="p-1.5 text-xs text-slate-400 hover:text-blue-300 hover:bg-slate-800 rounded-md transition"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleCopyCode}
            title="Copy content"
            className="p-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleClear}
            title="Clear all"
            className="p-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Snippet Insertion Bar (only when in HTML or Text mode) */}
      {inputMode !== 'file' && (
        <div className="flex items-center gap-1 px-4 py-1.5 border-b border-slate-800 bg-slate-900/90 overflow-x-auto scrollbar-thin text-xs text-slate-400">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1 shrink-0">
            Insert:
          </span>

          <button
            onClick={() =>
              handleInsertTag(
                inputMode === 'html'
                  ? '<h2>New Section Heading</h2>'
                  : '## New Section Heading'
              )
            }
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white transition shrink-0 flex items-center gap-1"
          >
            <Heading2 className="w-3 h-3 text-blue-400" />
            <span>Heading H2</span>
          </button>

          <button
            onClick={() =>
              handleInsertTag(
                inputMode === 'html'
                  ? `<table>\n  <thead>\n    <tr>\n      <th style="width: 35%;">Item Description</th>\n      <th style="width: 35%;">Category</th>\n      <th style="width: 30%;">Amount ($)</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Product Phase 1</td>\n      <td>Consulting &amp; Strategy</td>\n      <td>$1,500.00</td>\n    </tr>\n    <tr>\n      <td>Product Phase 2</td>\n      <td>Engineering &amp; SLA</td>\n      <td>$3,200.00</td>\n    </tr>\n  </tbody>\n</table>`
                  : `| Item Description | Category | Amount ($) |\n|---|---|---|\n| Product Phase 1 | Consulting & Strategy | $1,500.00 |\n| Product Phase 2 | Engineering & SLA | $3,200.00 |`
              )
            }
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white transition shrink-0 flex items-center gap-1"
          >
            <TableIcon className="w-3 h-3 text-emerald-400" />
            <span>Table 3x3</span>
          </button>

          <button
            onClick={() =>
              handleInsertTag(
                inputMode === 'html'
                  ? `<div class="callout callout-info">\n  <p><strong>Important Note:</strong> This is a high-visibility information callout box styled with accent borders.</p>\n</div>`
                  : `> **Important Note:** This is a styled informative callout box.`
              )
            }
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white transition shrink-0 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Callout Box</span>
          </button>

          <button
            onClick={() =>
              handleInsertTag(
                inputMode === 'html'
                  ? `<blockquote>\n  <p>« Simplicity is the ultimate sophistication. » — Leonardo da Vinci</p>\n</blockquote>`
                  : `> « Simplicity is the ultimate sophistication. » — Leonardo da Vinci`
              )
            }
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white transition shrink-0 flex items-center gap-1"
          >
            <Quote className="w-3 h-3 text-purple-400" />
            <span>Quote</span>
          </button>

          <button
            onClick={() =>
              handleInsertTag(
                inputMode === 'html'
                  ? `<ul>\n  <li><strong>Milestone 1:</strong> Initial delivery and setup.</li>\n  <li><strong>Milestone 2:</strong> Scalability and quality verification.</li>\n</ul>`
                  : `- **Milestone 1:** Initial delivery and setup.\n- **Milestone 2:** Scalability and quality verification.`
              )
            }
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white transition shrink-0 flex items-center gap-1"
          >
            <List className="w-3 h-3 text-cyan-400" />
            <span>Bullet List</span>
          </button>

          <button
            onClick={() =>
              handleInsertTag(inputMode === 'html' ? `<hr />` : `---`)
            }
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white transition shrink-0"
          >
            Divider Line
          </button>
        </div>
      )}

      {/* Editor Body */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {inputMode === 'html' && (
          <textarea
            id="html-source-input"
            value={htmlContent}
            onChange={(e) => onChangeHtml(e.target.value)}
            placeholder="Paste or type your HTML code here (e.g. <h1>Title</h1>, <table>...</table>, <p>Paragraph...</p>)"
            className="w-full h-full p-4 bg-slate-900 text-slate-200 font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 selection:bg-blue-600/40"
            spellCheck={false}
          />
        )}

        {inputMode === 'text' && (
          <div className="w-full h-full flex flex-col">
            <textarea
              id="raw-text-input"
              value={rawTextContent}
              onChange={(e) => {
                const val = e.target.value;
                onChangeRawText(val);
                onChangeHtml(convertTextOrMarkdownToHtml(val));
              }}
              placeholder="Freely type your notes, markdown, or plain text here (# Title, ## Subtitle, | Table | Col |, - lists, **bold**)... It will be automatically formatted into an elegant Word & PDF layout!"
              className="w-full h-full p-4 bg-slate-900 text-slate-200 font-sans text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 selection:bg-blue-600/40"
              spellCheck={true}
            />
          </div>
        )}

        {inputMode === 'file' && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex-1 m-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition ${
              dragOver
                ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                : 'border-slate-700 bg-slate-950/40 text-slate-400 hover:border-slate-600'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".html,.htm,.txt,.md,.markdown,.csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8" />
            </div>

            <h3 className="text-base font-semibold text-slate-200 mb-1">
              Drag &amp; drop your document here
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Supports <strong>HTML (.html, .htm)</strong>, <strong>Plain Text (.txt)</strong>, <strong>Markdown (.md)</strong>, and CSV tables.
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-medium shadow transition"
            >
              Browse Files from Computer
            </button>
          </div>
        )}
      </div>

      {/* Editor Footer Stats */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <span>{words} words</span>
          <span>{chars} characters</span>
          <span className="hidden sm:inline">~{estPages} page{estPages > 1 ? 's' : ''} A4</span>
        </div>
        <div className="text-[11px] text-slate-500">
          Active format: <span className="text-blue-400 font-semibold uppercase">{inputMode}</span>
        </div>
      </div>
    </div>
  );
};
