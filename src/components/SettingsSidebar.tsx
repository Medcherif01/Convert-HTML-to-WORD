import React, { useState } from 'react';
import {
  Palette,
  Sliders,
  Type,
  Table as TableIcon,
  BookOpen,
  Layout,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Check,
  AlignLeft,
  FileCheck,
  Hash,
} from 'lucide-react';
import { DocumentSettings, ColorTheme, MarginSettings } from '../types';
import { PRESET_THEMES, AVAILABLE_FONTS } from '../data/themes';

interface SettingsSidebarProps {
  settings: DocumentSettings;
  onUpdateSettings: (newSettings: Partial<DocumentSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'theme' | 'layout' | 'typography' | 'tables' | 'headerFooter';

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  settings,
  onUpdateSettings,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('theme');

  const handleSelectTheme = (theme: ColorTheme) => {
    onUpdateSettings({
      theme: { ...theme },
      tables: {
        ...settings.tables,
        headerBgColor: theme.tableHeaderBg,
        headerTextColor: theme.tableHeaderText,
        zebraBgColor: theme.tableZebraBg,
        borderColor: theme.tableBorder,
      },
      headerFooter: {
        ...settings.headerFooter,
        headerDividerColor: theme.tableBorder,
        footerDividerColor: theme.tableBorder,
      },
    });
  };

  const handleMarginPreset = (preset: 'standard' | 'narrow' | 'wide') => {
    let margins: MarginSettings;
    if (preset === 'standard') {
      margins = { top: 25, bottom: 25, left: 25, right: 25, preset: 'standard' };
    } else if (preset === 'narrow') {
      margins = { top: 12.7, bottom: 12.7, left: 12.7, right: 12.7, preset: 'narrow' };
    } else {
      margins = { top: 31.8, bottom: 31.8, left: 31.8, right: 31.8, preset: 'wide' };
    }
    onUpdateSettings({ margins });
  };

  return (
    <aside
      className={`fixed inset-y-0 right-0 z-40 w-80 sm:w-96 bg-slate-900 border-l border-slate-800 text-slate-200 flex flex-col shadow-2xl transition-transform duration-200 lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Sidebar Header with Tabs */}
      <div className="p-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold tracking-tight text-white">
            Word &amp; PDF Formatting
          </h2>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 text-slate-400 hover:text-white rounded"
        >
          ✕
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-5 p-1 bg-slate-950/80 border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex flex-col items-center py-2 px-1 rounded-lg transition font-medium ${
            activeTab === 'theme'
              ? 'bg-slate-800 text-blue-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Themes & Colors"
        >
          <Palette className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Themes</span>
        </button>

        <button
          onClick={() => setActiveTab('layout')}
          className={`flex flex-col items-center py-2 px-1 rounded-lg transition font-medium ${
            activeTab === 'layout'
              ? 'bg-slate-800 text-blue-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Page Size & Margins"
        >
          <Layout className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Layout</span>
        </button>

        <button
          onClick={() => setActiveTab('typography')}
          className={`flex flex-col items-center py-2 px-1 rounded-lg transition font-medium ${
            activeTab === 'typography'
              ? 'bg-slate-800 text-blue-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Typography & Fonts"
        >
          <Type className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Fonts</span>
        </button>

        <button
          onClick={() => setActiveTab('tables')}
          className={`flex flex-col items-center py-2 px-1 rounded-lg transition font-medium ${
            activeTab === 'tables'
              ? 'bg-slate-800 text-blue-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Tables & Borders"
        >
          <TableIcon className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Tables</span>
        </button>

        <button
          onClick={() => setActiveTab('headerFooter')}
          className={`flex flex-col items-center py-2 px-1 rounded-lg transition font-medium ${
            activeTab === 'headerFooter'
              ? 'bg-slate-800 text-blue-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Header & Footer"
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Header</span>
        </button>
      </div>

      {/* Tab Content Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-300 scrollbar-thin">
        {/* TAB 1: THEMES & COLORS */}
        {activeTab === 'theme' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-2">
                Preset Color Palettes
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PRESET_THEMES.map((t) => {
                  const isSelected = settings.theme.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTheme(t)}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-slate-800 bg-slate-800/60 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-900 shadow-sm"
                            style={{ backgroundColor: t.primary }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-slate-900 shadow-sm"
                            style={{ backgroundColor: t.secondary }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-slate-900 shadow-sm"
                            style={{ backgroundColor: t.accent }}
                          />
                        </div>
                        <span className="font-medium text-xs text-slate-100">{t.name}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Overrides */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-white uppercase tracking-wider">
                Manual Color Adjustments
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[11px] text-slate-400 mb-1">Primary Color</span>
                  <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
                    <input
                      type="color"
                      value={settings.theme.primary}
                      onChange={(e) =>
                        onUpdateSettings({
                          theme: { ...settings.theme, primary: e.target.value },
                        })
                      }
                      className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[11px] uppercase text-slate-300">
                      {settings.theme.primary}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] text-slate-400 mb-1">Secondary Color</span>
                  <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
                    <input
                      type="color"
                      value={settings.theme.secondary}
                      onChange={(e) =>
                        onUpdateSettings({
                          theme: { ...settings.theme, secondary: e.target.value },
                        })
                      }
                      className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[11px] uppercase text-slate-300">
                      {settings.theme.secondary}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] text-slate-400 mb-1">Text Color</span>
                  <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
                    <input
                      type="color"
                      value={settings.theme.text}
                      onChange={(e) =>
                        onUpdateSettings({
                          theme: { ...settings.theme, text: e.target.value },
                        })
                      }
                      className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[11px] uppercase text-slate-300">
                      {settings.theme.text}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] text-slate-400 mb-1">Heading Color</span>
                  <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
                    <input
                      type="color"
                      value={settings.theme.headingColor}
                      onChange={(e) =>
                        onUpdateSettings({
                          theme: { ...settings.theme, headingColor: e.target.value },
                        })
                      }
                      className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[11px] uppercase text-slate-300">
                      {settings.theme.headingColor}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FORMAT & MARGINS */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-2">
                Paper Size &amp; Orientation
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {(['A4', 'Letter', 'Legal'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => onUpdateSettings({ pageSize: size })}
                    className={`py-2 rounded-lg border text-center font-medium transition ${
                      settings.pageSize === size
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateSettings({ orientation: 'portrait' })}
                  className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-2 font-medium transition ${
                    settings.orientation === 'portrait'
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400'
                  }`}
                >
                  <span className="w-3 h-4 border border-current rounded-xs" />
                  <span>Portrait</span>
                </button>
                <button
                  onClick={() => onUpdateSettings({ orientation: 'landscape' })}
                  className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-2 font-medium transition ${
                    settings.orientation === 'landscape'
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400'
                  }`}
                >
                  <span className="w-4 h-3 border border-current rounded-xs" />
                  <span>Landscape</span>
                </button>
              </div>
            </div>

            {/* Margins */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-white uppercase tracking-wider">
                  Word Margins (in mm)
                </label>
              </div>

              {/* Preset buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleMarginPreset('standard')}
                  className={`py-1.5 rounded-lg border text-[11px] font-medium transition ${
                    settings.margins.preset === 'standard'
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400'
                  }`}
                >
                  Standard (25mm)
                </button>
                <button
                  onClick={() => handleMarginPreset('narrow')}
                  className={`py-1.5 rounded-lg border text-[11px] font-medium transition ${
                    settings.margins.preset === 'narrow'
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400'
                  }`}
                >
                  Narrow (12.7mm)
                </button>
                <button
                  onClick={() => handleMarginPreset('wide')}
                  className={`py-1.5 rounded-lg border text-[11px] font-medium transition ${
                    settings.margins.preset === 'wide'
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400'
                  }`}
                >
                  Wide (31.8mm)
                </button>
              </div>

              {/* Precision Millimeter Inputs */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="block text-[11px] text-slate-400 mb-1">Top Margin (mm)</span>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    step="1"
                    value={settings.margins.top}
                    onChange={(e) =>
                      onUpdateSettings({
                        margins: {
                          ...settings.margins,
                          top: parseFloat(e.target.value) || 20,
                          preset: 'custom',
                        },
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <span className="block text-[11px] text-slate-400 mb-1">Bottom Margin (mm)</span>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    step="1"
                    value={settings.margins.bottom}
                    onChange={(e) =>
                      onUpdateSettings({
                        margins: {
                          ...settings.margins,
                          bottom: parseFloat(e.target.value) || 20,
                          preset: 'custom',
                        },
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <span className="block text-[11px] text-slate-400 mb-1">Left Margin (mm)</span>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    step="1"
                    value={settings.margins.left}
                    onChange={(e) =>
                      onUpdateSettings({
                        margins: {
                          ...settings.margins,
                          left: parseFloat(e.target.value) || 20,
                          preset: 'custom',
                        },
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <span className="block text-[11px] text-slate-400 mb-1">Right Margin (mm)</span>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    step="1"
                    value={settings.margins.right}
                    onChange={(e) =>
                      onUpdateSettings({
                        margins: {
                          ...settings.margins,
                          right: parseFloat(e.target.value) || 20,
                          preset: 'custom',
                        },
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TYPOGRAPHY */}
        {activeTab === 'typography' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-2">
                Body Font Family
              </label>
              <select
                value={settings.typography.bodyFont}
                onChange={(e) =>
                  onUpdateSettings({
                    typography: {
                      ...settings.typography,
                      bodyFont: e.target.value,
                    },
                  })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-medium"
              >
                {AVAILABLE_FONTS.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name} ({f.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-2">
                Headings Font Family (H1, H2, H3)
              </label>
              <select
                value={settings.typography.headingFont}
                onChange={(e) =>
                  onUpdateSettings({
                    typography: {
                      ...settings.typography,
                      headingFont: e.target.value,
                    },
                  })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-medium"
              >
                {AVAILABLE_FONTS.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name} ({f.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Font Sizing & Spacing */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-white uppercase tracking-wider">
                Sizes &amp; Spacing
              </label>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Body Font Size:</span>
                  <span className="font-mono text-white font-semibold">
                    {settings.typography.baseFontSizePt} pt
                  </span>
                </div>
                <input
                  type="range"
                  min="9"
                  max="14"
                  step="0.5"
                  value={settings.typography.baseFontSizePt}
                  onChange={(e) =>
                    onUpdateSettings({
                      typography: {
                        ...settings.typography,
                        baseFontSizePt: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Line Spacing:</span>
                  <span className="font-mono text-white font-semibold">
                    {settings.typography.lineSpacing}x
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1.0, 1.15, 1.25, 1.5].map((ls) => (
                    <button
                      key={ls}
                      onClick={() =>
                        onUpdateSettings({
                          typography: {
                            ...settings.typography,
                            lineSpacing: ls,
                          },
                        })
                      }
                      className={`py-1 rounded border font-mono text-[11px] transition ${
                        settings.typography.lineSpacing === ls
                          ? 'border-blue-500 bg-blue-500/20 text-white'
                          : 'border-slate-800 bg-slate-800/60 text-slate-400'
                      }`}
                    >
                      {ls}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Paragraph Spacing After:</span>
                  <span className="font-mono text-white font-semibold">
                    {settings.typography.paragraphSpacingAfterPt} pt
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="14"
                  step="1"
                  value={settings.typography.paragraphSpacingAfterPt}
                  onChange={(e) =>
                    onUpdateSettings({
                      typography: {
                        ...settings.typography,
                        paragraphSpacingAfterPt: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TABLES */}
        {activeTab === 'tables' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-2">
                Table Overall Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'striped', name: 'Modern Striped' },
                  { id: 'bordered', name: 'Full Grid Border' },
                  { id: 'minimal', name: 'Clean Minimalist' },
                  { id: 'corporate', name: 'Dark Corporate' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() =>
                      onUpdateSettings({
                        tables: {
                          ...settings.tables,
                          style: s.id as any,
                          zebraStriping: s.id === 'striped' || s.id === 'corporate',
                        },
                      })
                    }
                    className={`p-2 rounded-lg border text-left font-medium transition ${
                      settings.tables.style === s.id
                        ? 'border-blue-500 bg-blue-500/20 text-white'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    <span className="text-xs">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Alternance Zebra */}
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="block font-medium text-slate-200">Alternate Rows (Zebra)</span>
                <span className="block text-[11px] text-slate-500">
                  Subtle soft shading on alternating rows
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.tables.zebraStriping}
                onChange={(e) =>
                  onUpdateSettings({
                    tables: {
                      ...settings.tables,
                      zebraStriping: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
              />
            </div>

            {/* Table Cell Padding */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Cell Internal Padding:</span>
                <span className="font-mono text-white font-semibold">
                  {settings.tables.cellPaddingMm} mm
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Compact', val: 1.5 },
                  { label: 'Normal', val: 2.5 },
                  { label: 'Spacious', val: 4.0 },
                ].map((pad) => (
                  <button
                    key={pad.label}
                    onClick={() =>
                      onUpdateSettings({
                        tables: {
                          ...settings.tables,
                          cellPaddingMm: pad.val,
                        },
                      })
                    }
                    className={`py-1.5 rounded-lg border text-center font-medium transition ${
                      settings.tables.cellPaddingMm === pad.val
                        ? 'border-blue-500 bg-blue-500/20 text-white'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    {pad.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Header row options */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="block text-xs font-semibold text-white uppercase tracking-wider">
                Table Header Background
              </span>
              <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
                <input
                  type="color"
                  value={settings.tables.headerBgColor}
                  onChange={(e) =>
                    onUpdateSettings({
                      tables: {
                        ...settings.tables,
                        headerBgColor: e.target.value,
                      },
                    })
                  }
                  className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="font-mono text-xs uppercase text-slate-300">
                  {settings.tables.headerBgColor}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: HEADER & FOOTER */}
        {activeTab === 'headerFooter' && (
          <div className="space-y-4">
            {/* Header Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-white uppercase tracking-wider">
                  Document Header
                </label>
                <input
                  type="checkbox"
                  checked={settings.headerFooter.enableHeader}
                  onChange={(e) =>
                    onUpdateSettings({
                      headerFooter: {
                        ...settings.headerFooter,
                        enableHeader: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
              </div>

              {settings.headerFooter.enableHeader && (
                <div className="space-y-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="block text-[11px] text-slate-400 mb-1">Left Header Text</span>
                    <input
                      type="text"
                      value={settings.headerFooter.headerLeft}
                      onChange={(e) =>
                        onUpdateSettings({
                          headerFooter: {
                            ...settings.headerFooter,
                            headerLeft: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Organization / Document Title"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] text-slate-400 mb-1">Right Header Text</span>
                    <input
                      type="text"
                      value={settings.headerFooter.headerRight}
                      onChange={(e) =>
                        onUpdateSettings({
                          headerFooter: {
                            ...settings.headerFooter,
                            headerRight: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Confidential / Date"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">Header divider line</span>
                    <input
                      type="checkbox"
                      checked={settings.headerFooter.headerShowDivider}
                      onChange={(e) =>
                        onUpdateSettings({
                          headerFooter: {
                            ...settings.headerFooter,
                            headerShowDivider: e.target.checked,
                          },
                        })
                      }
                      className="w-3.5 h-3.5 accent-blue-500 rounded"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Section */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-white uppercase tracking-wider">
                  Dynamic Document Footer
                </label>
                <input
                  type="checkbox"
                  checked={settings.headerFooter.enableFooter}
                  onChange={(e) =>
                    onUpdateSettings({
                      headerFooter: {
                        ...settings.headerFooter,
                        enableFooter: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
              </div>

              {settings.headerFooter.enableFooter && (
                <div className="space-y-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="block text-[11px] text-slate-400 mb-1">
                      Left Note (Author / Confidentiality)
                    </span>
                    <input
                      type="text"
                      value={settings.headerFooter.footerLeft}
                      onChange={(e) =>
                        onUpdateSettings({
                          headerFooter: {
                            ...settings.headerFooter,
                            footerLeft: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Confidential Document - All Rights Reserved"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] text-slate-400 mb-1">
                      Automatic Page Numbering (Word &amp; PDF)
                    </span>
                    <select
                      value={settings.headerFooter.footerRightType}
                      onChange={(e) =>
                        onUpdateSettings({
                          headerFooter: {
                            ...settings.headerFooter,
                            footerRightType: e.target.value as any,
                          },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-medium"
                    >
                      <option value="page-x-of-y">Full format: "Page X of Y"</option>
                      <option value="page-x">Short format: "Page X"</option>
                      <option value="custom">Custom text on right</option>
                      <option value="none">No page numbers</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      Top footer divider line
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.headerFooter.footerShowDivider}
                      onChange={(e) =>
                        onUpdateSettings({
                          headerFooter: {
                            ...settings.headerFooter,
                            footerShowDivider: e.target.checked,
                          },
                        })
                      }
                      className="w-3.5 h-3.5 accent-blue-500 rounded"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Different First Page */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="block font-medium text-slate-200 text-xs">
                  Different First Page
                </span>
                <span className="block text-[11px] text-slate-500">
                  Hide header / footer on the cover title page
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.headerFooter.differentFirstPage}
                onChange={(e) =>
                  onUpdateSettings({
                    headerFooter: {
                      ...settings.headerFooter,
                      differentFirstPage: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
        <span>Ready for DOCX conversion</span>
        <button
          onClick={() => {
            handleMarginPreset('standard');
            handleSelectTheme(PRESET_THEMES[0]);
          }}
          title="Reset to default settings"
          className="flex items-center gap-1 text-slate-400 hover:text-white transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Defaults</span>
        </button>
      </div>
    </aside>
  );
};
