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
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);
  
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
          setPreviewData(results.data as Record<string, any>[]);
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
    } catch (err: any) {
      handleError(err.message || 'An unexpected error occurred during import.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Reusable Modal Container */}
      <div className="bg-white rounded-[16px] shadow-xl w-full max-w-[700px] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Import Leads via CSV</h2>
            <p className="text-sm text-gray-500 mt-1">
              Upload a CSV file to bulk import leads into your system.
            </p>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors rounded-md p-1 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <FileUpload 
            file={selectedFile} 
            onFileSelect={handleFileSelect} 
            onFileRemove={handleFileRemove} 
            onError={handleFileUploadError} 
            disabled={loading}
          />

          {selectedFile && !hasError && headers.length > 0 && !importResult && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <DataTable headers={headers} rows={previewData} />
            </div>
          )}

          {importResult && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Imported</p>
                  <p className="text-3xl font-bold text-gray-900">{importResult.data.total_imported}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Skipped</p>
                  <p className="text-3xl font-bold text-gray-900">{importResult.data.total_skipped}</p>
                </div>
              </div>
              
              <ResultsTable 
                title="Imported Records" 
                records={importResult.data.imported_records} 
              />
              
              <div className="mt-6">
                <ResultsTable 
                  title="Skipped Records" 
                  records={importResult.data.skipped_records} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Action Bar */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              handleFileRemove();
            }}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirmImport}
            disabled={loading || !selectedFile || hasError || importResult !== null}
            className={`inline-flex items-center justify-center px-6 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F1734A] focus-visible:ring-offset-2 ${
              (loading || !selectedFile || hasError || importResult !== null)
                ? 'bg-[#F1734A]/60 cursor-not-allowed' 
                : 'bg-[#F1734A] hover:bg-[#E5633C] hover:shadow-sm active:bg-[#D45A36]'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
