'use client';

import React, { useState } from 'react';
import { 
  Printer, 
  FileDown, 
  Image as ImageIcon, 
  FileText, 
  Mail, 
  MessageCircle, 
  Share2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import InternalChat from './InternalChat';

interface GlobalActionsProps {
  pageTitle?: string;
  excludeSelectors?: string[]; // CSS selectors to exclude from capture
  customData?: Record<string, unknown>; // Custom data for CSV export
}

export default function GlobalActions({ 
  pageTitle = 'Dokument', 
  excludeSelectors = [],
  customData 
}: GlobalActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);

  // Print page
  const handlePrint = () => {
    window.print();
    setIsOpen(false);
  };

  // Generate and download PDF
  const handlePDF = async () => {
    try {
      setIsCapturing(true);
      
      // Hide the actions menu temporarily
      setIsOpen(false);
      
      // Wait a bit for the menu to disappear
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const element = document.body;
      const canvas = await html2canvas(element, {
        ignoreElements: (element: Element) => {
          return excludeSelectors.some(selector => element.matches?.(selector));
        },
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false, // Disable console warnings
        foreignObjectRendering: true,
        removeContainer: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${pageTitle}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Błąd podczas generowania PDF');
    } finally {
      setIsCapturing(false);
    }
  };

  // Generate and download image (PNG/JPG)
  const handleImageExport = async (format: 'png' | 'jpg') => {
    try {
      setIsCapturing(true);
      setIsOpen(false);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const element = document.body;
      const canvas = await html2canvas(element, {
        ignoreElements: (element: Element) => {
          return excludeSelectors.some(selector => element.matches?.(selector));
        },
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false, // Disable console warnings
        foreignObjectRendering: true,
        removeContainer: true
      });

      const link = document.createElement('a');
      link.download = `${pageTitle}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, format === 'jpg' ? 0.9 : undefined);
      link.click();
    } catch (error) {
      console.error(`Error generating ${format.toUpperCase()}:`, error);
      alert(`Błąd podczas generowania ${format.toUpperCase()}`);
    } finally {
      setIsCapturing(false);
    }
  };

  // Generate and download CSV
  const handleCSVExport = () => {
    try {
      let csvContent = '';
      
      if (customData) {
        // Use custom data if provided
        const headers = Object.keys(customData);
        csvContent += headers.join(',') + '\n';
        csvContent += Object.values(customData).join(',') + '\n';
      } else {
        // Extract data from tables on the page
        const tables = document.querySelectorAll('table');
        
        if (tables.length === 0) {
          alert('Nie znaleziono tabel do eksportu');
          return;
        }

        tables.forEach((table, tableIndex) => {
          if (tableIndex > 0) csvContent += '\n';
          
          const rows = table.querySelectorAll('tr');
          rows.forEach((row) => {
            const cells = row.querySelectorAll('th, td');
            const rowData = Array.from(cells).map(cell => {
              const text = cell.textContent?.trim() || '';
              // Escape commas and quotes
              return text.includes(',') || text.includes('"') ? `"${text.replace(/"/g, '""')}"` : text;
            });
            csvContent += rowData.join(',') + '\n';
          });
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${pageTitle}.csv`;
      link.click();
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Błąd podczas generowania CSV');
    }
  };

  // Email sharing
  const handleEmail = async () => {
    try {
      const subject = encodeURIComponent(`Udostępnienie: ${pageTitle}`);
      const body = encodeURIComponent(`Dzielę się z Tobą stroną: ${pageTitle}\n\nLink: ${window.location.href}`);
      
      window.open(`mailto:?subject=${subject}&body=${body}`);
      setIsOpen(false);
    } catch (error) {
      console.error('Error opening email:', error);
    }
  };

  // Internal chat (placeholder - would integrate with your chat system)
  const handleInternalChat = () => {
    setShowInternalChat(true);
    setIsOpen(false);
  };

  // Screenshot functionality removed due to technical issues

  return (
    <>
      {/* Main Action Button */}
      <div className="fixed bottom-6 right-6 z-50 global-actions">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
          title="Akcje eksportu i udostępniania"
        >
          <Share2 className="w-6 h-6" />
        </button>

        {/* Actions Menu */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[200px]">
            <div className="space-y-2">
              {/* Print */}
              <button
                onClick={handlePrint}
                className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Printer className="w-5 h-5" />
                <span>Drukuj</span>
              </button>

              {/* PDF */}
              <button
                onClick={handlePDF}
                disabled={isCapturing}
                className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <FileText className="w-5 h-5" />
                <span>Zapisz jako PDF</span>
              </button>

              {/* PNG */}
              <button
                onClick={() => handleImageExport('png')}
                disabled={isCapturing}
                className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <ImageIcon className="w-5 h-5" />
                <span>Zapisz jako PNG</span>
              </button>

              {/* JPG */}
              <button
                onClick={() => handleImageExport('jpg')}
                disabled={isCapturing}
                className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <ImageIcon className="w-5 h-5" />
                <span>Zapisz jako JPG</span>
              </button>

              {/* CSV */}
              <button
                onClick={handleCSVExport}
                className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FileDown className="w-5 h-5" />
                <span>Eksportuj CSV</span>
              </button>

              <hr className="my-2 border-gray-200" />

              {/* Email */}
              <button
                onClick={handleEmail}
                className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>Wyślij mailem</span>
              </button>

              {/* Internal Chat */}
              <button
                onClick={handleInternalChat}
                className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Wewnętrzny chat</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {isCapturing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Generowanie...</span>
            </div>
          </div>
        </div>
      )}

      {/* Internal Chat Modal */}
      <InternalChat
        isOpen={showInternalChat}
        onClose={() => setShowInternalChat(false)}
        pageUrl={typeof window !== 'undefined' ? window.location.href : undefined}
        pageTitle={pageTitle}
      />
    </>
  );
}
