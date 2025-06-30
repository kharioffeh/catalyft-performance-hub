
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

export const toCsv = (rows: any[], filename: string = 'metrics') => {
  if (!rows.length) return '';
  
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const timestamp = new Date().toISOString().split('T')[0];
  saveAs(blob, `${filename}-${timestamp}.csv`);
};

export const capturePng = async (node: HTMLElement): Promise<string> => {
  const canvas = await html2canvas(node, {
    backgroundColor: null,
    scale: 2, // 2x DPR for crisp quality
    useCORS: true,
    allowTaint: true,
    logging: false,
  });
  return canvas.toDataURL('image/png');
};

export const makePdf = async (pngDataUrl: string, title: string): Promise<Blob> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Add logo placeholder (top-left)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Catalyft', 20, 20);
  
  // Add title (center)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const pageWidth = doc.internal.pageSize.getWidth();
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, 35);
  
  // Add chart image
  try {
    doc.addImage(pngDataUrl, 'PNG', 10, 50, 190, 120);
  } catch (error) {
    console.error('Error adding image to PDF:', error);
  }
  
  // Add footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Generated via Catalyft AI • aria', 20, 280);
  
  return doc.output('blob');
};
