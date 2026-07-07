'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { FileUpload } from '../components/FileUpload';
import { DataTable } from '../components/DataTable';
import { ResultsTable } from '../components/ResultsTable';
import { api } from '../lib/api';
import type { ImportResponse } from '../types/crm';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Phase 10 State
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  
  // Tracks if there's currently an error to prevent proceeding
  const [hasError, setHasError] = useState<boolean>(false);

  // Phase 11 State
  const [loading, setLoading] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);

  const handleError = (msg: string) => {
    setHasError(true);
    toast.error(msg, { id: msg }); // id prevents duplicate toasts with the exact same message
  };

  const parseFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          handleError(`Parsing error: ${results.errors[0].message}`);
          setHeaders([]);
          setPreviewData([]);
          return;
        }

        if (results.meta && results.meta.fields) {
          setHeaders(results.meta.fields);
          setPreviewData(results.data as Record<string, unknown>[]);
        }
      },
      error: (err: Error) => {
        handleError(`Failed to parse CSV: ${err.message}`);
        setHeaders([]);
        setPreviewData([]);
      }
    });
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setHasError(false);
    setImportResult(null);
    parseFile(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setHasError(false);
    setHeaders([]);
    setPreviewData([]);
    setImportResult(null);
  };

  const handleFileUploadError = (msg: string | null) => {
    if (msg) {
      handleError(msg);
    } else {
      setHasError(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setHasError(false);
    
    try {
      const response = await api.importCsv(selectedFile);
      setImportResult(response);
      toast.success(`Import completed successfully!`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        handleError(err.message || 'An unexpected error occurred during import.');
      } else {
        handleError('An unexpected error occurred during import.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

      {/* Reusable Modal Container */}
      <div className="bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] border border-gray-200/60 w-full max-w-[720px] flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between px-7 py-6 border-b border-gray-100 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">Import Leads via CSV</h2>
            <p className="text-[14px] text-gray-500 mt-1.5 font-medium">
              Upload a CSV file to bulk import leads into your CRM.
            </p>
          </div>
          <button className="text-gray-400 hover:text-gray-700 transition-all duration-200 rounded-lg p-2 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-7 py-7 custom-scrollbar bg-[#FCFCFD]">
          <FileUpload 
            file={selectedFile} 
            onFileSelect={handleFileSelect} 
            onFileRemove={handleFileRemove} 
            onError={handleFileUploadError} 
            disabled={loading}
          />

          {selectedFile && !hasError && headers.length > 0 && !importResult && (
            <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <DataTable headers={headers} rows={previewData} />
            </div>
          )}

          {importResult && (
            <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-2 gap-5 mb-8">
                <div className="bg-[#F4F9F7] border border-[#D1EAE0] rounded-xl p-5 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
                  <div className="w-10 h-10 rounded-full bg-[#E0F2EC] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D735C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <p className="text-[11px] font-bold text-[#2D735C] uppercase tracking-wider mb-1">Imported Records</p>
                  <p className="text-3xl font-black text-gray-900">{importResult.data.total_imported}</p>
                </div>
                <div className="bg-[#FFF4F2] border border-[#FEE2E2] rounded-xl p-5 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
                  <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  </div>
                  <p className="text-[11px] font-bold text-[#EF4444] uppercase tracking-wider mb-1">Skipped Records</p>
                  <p className="text-3xl font-black text-gray-900">{importResult.data.total_skipped}</p>
                </div>
              </div>
              
              <ResultsTable 
                title="Imported Records" 
                records={importResult.data.imported_records as unknown as Record<string, unknown>[]} 
              />
              
              <div className="mt-8">
                <ResultsTable 
                  title="Skipped Records" 
                  records={importResult.data.skipped_records as unknown as Record<string, unknown>[]} 
                />
              </div>

              {/* CRM Lead Preview Bonus Section */}
              {importResult.data.imported_records && importResult.data.imported_records.length > 0 && (
                <div className="mt-12 pt-10 border-t border-gray-200">
                  <div className="mb-6">
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">CRM Lead Preview</h2>
                    <p className="text-sm text-gray-500 mt-1 font-medium">This is how your imported leads would appear in the CRM dashboard.</p>
                  </div>
                  
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-black/5">
                    <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                          <tr>
                            {['Lead Name', 'Email', 'Contact', 'Status', 'Actions'].map((header, idx) => (
                              <th key={idx} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap border-b border-gray-200/80">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {importResult.data.imported_records.map((record, idx) => (
                            <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors group cursor-default">
                              <td className="px-5 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mr-3">
                                    {(record.name || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                                    {record.name || '-'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500 font-medium truncate max-w-[150px]">
                                {record.email || '-'}
                              </td>
                              <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500 font-medium">
                                {record.mobile_without_country_code || '-'}
                              </td>
                              <td className="px-5 py-3 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#E0F2EC] text-[#2D735C]">
                                  {record.crm_status || 'GOOD_LEAD_FOLLOW_UP'}
                                </span>
                              </td>
                              <td className="px-5 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <button className="text-blue-600 hover:text-blue-800 transition-colors opacity-0 group-hover:opacity-100 pointer-events-none px-2 py-1 bg-blue-50 rounded-md">View</button>
                                <button className="text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100 pointer-events-none px-2 py-1 hover:bg-gray-100 rounded-md">Edit</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer / Action Bar */}
        <div className="px-7 py-5 border-t border-gray-100 bg-white flex items-center justify-between shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] relative z-20">
          <button
            onClick={() => {
              handleFileRemove();
            }}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirmImport}
            disabled={loading || !selectedFile || hasError || importResult !== null}
            className={`inline-flex items-center justify-center px-7 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F1734A]/30 shadow-sm hover:shadow-md active:scale-95 ${
              (loading || !selectedFile || hasError || importResult !== null)
                ? 'bg-orange-300/60 cursor-not-allowed shadow-none' 
                : 'bg-[#F1734A] hover:bg-[#E5633C]'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Upload File'
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
