import jsPDF from 'jspdf';
import { toCanvas } from 'html-to-image';
import { DocumentSettings } from '../types';

/**
 * Exports the rendered document preview to high-resolution A4/Letter PDF
 * Uses html-to-image to support modern CSS (oklch, custom fonts, flexbox) without parser errors
 */
export async function downloadPdf(
  previewContainerElement: HTMLElement,
  settings: DocumentSettings
): Promise<void> {
  const fileName = settings.fileName.endsWith('.pdf')
    ? settings.fileName
    : `${settings.fileName}.pdf`;

  const isLandscape = settings.orientation === 'landscape';
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: settings.pageSize.toLowerCase() as 'a4' | 'letter' | 'legal',
  });

  const pageWidthMm = isLandscape ? 297 : 210;
  const pageHeightMm = isLandscape ? 210 : 297;

  // Generate high-resolution canvas with html-to-image
  const canvas = await toCanvas(previewContainerElement, {
    pixelRatio: 2, // 2x for sharp print resolution (approx 192-300 DPI)
    backgroundColor: '#FFFFFF',
    skipFonts: false,
    cacheBust: true,
  });

  const imgWidth = pageWidthMm;
  const totalImgHeight = (canvas.height * imgWidth) / canvas.width;

  // Single page document
  if (totalImgHeight <= pageHeightMm + 1) {
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(totalImgHeight, pageHeightMm), undefined, 'FAST');
  } else {
    // Multi-page document with exact page slicing
    const pxPageHeight = Math.floor((pageHeightMm / imgWidth) * canvas.width);
    let currentY = 0;
    let pageIndex = 0;

    while (currentY < canvas.height) {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      const sliceHeight = Math.min(pxPageHeight, canvas.height - currentY);
      sliceCanvas.height = sliceHeight;

      const ctx = sliceCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          currentY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );

        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.98);
        const sliceHeightMm = (sliceHeight * imgWidth) / canvas.width;
        pdf.addImage(sliceData, 'JPEG', 0, 0, imgWidth, sliceHeightMm, undefined, 'FAST');
      }

      currentY += pxPageHeight;
      pageIndex++;
    }
  }

  pdf.save(fileName);
}

