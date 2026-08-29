export type InputMode = 'html' | 'text' | 'file';

export type PageOrientation = 'portrait' | 'landscape';

export type PageSize = 'A4' | 'Letter' | 'Legal';

export interface MarginSettings {
  top: number; // in mm
  bottom: number; // in mm
  left: number; // in mm
  right: number; // in mm
  preset: 'standard' | 'narrow' | 'wide' | 'custom';
}

export interface TypographySettings {
  bodyFont: string;
  headingFont: string;
  baseFontSizePt: number; // e.g. 11
  h1SizePt: number; // e.g. 22
  h2SizePt: number; // e.g. 16
  h3SizePt: number; // e.g. 13
  lineSpacing: number; // 1.0, 1.15, 1.25, 1.5, 2.0
  paragraphSpacingAfterPt: number; // e.g. 6
}

export interface ColorTheme {
  id: string;
  name: string;
  primary: string; // e.g. '#1E3A8A'
  secondary: string; // e.g. '#3B82F6'
  accent: string; // e.g. '#60A5FA'
  text: string; // e.g. '#1E293B'
  textMuted: string; // e.g. '#64748B'
  headingColor: string; // e.g. '#0F172A'
  tableHeaderBg: string; // e.g. '#1E3A8A'
  tableHeaderText: string; // e.g. '#FFFFFF'
  tableZebraBg: string; // e.g. '#F8FAFC'
  tableBorder: string; // e.g. '#E2E8F0'
  calloutInfoBg: string; // e.g. '#EFF6FF'
  calloutInfoBorder: string; // e.g. '#3B82F6'
}

export interface TableSettings {
  style: 'striped' | 'bordered' | 'minimal' | 'modern' | 'corporate';
  headerBgColor: string;
  headerTextColor: string;
  headerBold: boolean;
  zebraStriping: boolean;
  zebraBgColor: string;
  borderColor: string;
  borderWidthPt: number;
  cellPaddingMm: number;
  alignCenter: boolean;
  fullWidth: boolean;
}

export interface HeaderFooterSettings {
  enableHeader: boolean;
  headerLeft: string;
  headerCenter: string;
  headerRight: string;
  headerShowDivider: boolean;
  headerDividerColor: string;
  
  enableFooter: boolean;
  footerLeft: string;
  footerCenter: string;
  footerRightType: 'page-x-of-y' | 'page-x' | 'custom' | 'none';
  footerCustomRight: string;
  footerShowDivider: boolean;
  footerDividerColor: string;
  
  differentFirstPage: boolean;
}

export interface DocumentSettings {
  title: string;
  fileName: string;
  pageSize: PageSize;
  orientation: PageOrientation;
  margins: MarginSettings;
  typography: TypographySettings;
  theme: ColorTheme;
  tables: TableSettings;
  headerFooter: HeaderFooterSettings;
}

export interface TemplateDoc {
  id: string;
  title: string;
  category: string;
  description: string;
  defaultThemeId: string;
  htmlContent: string;
}
