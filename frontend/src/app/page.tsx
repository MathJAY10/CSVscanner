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
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            AI-Powered CSV Importer
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-lg text-gray-500">
            Intelligently extract CRM leads from unstructured CSV files using AI.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
          <FileUpload 
            file={selectedFile} 
            onFileSelect={handleFileSelect} 
            onFileRemove={handleFileRemove} 
            onError={handleFileUploadError} 
            disabled={loading}
          />
          
          {importResult && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 flex justify-center space-x-12">
                <div className="text-center">
                  <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-1">Total Imported</p>
                  <p className="text-4xl font-bold text-blue-900">{importResult.data.total_imported}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-red-500 uppercase tracking-wider mb-1">Total Skipped</p>
                  <p className="text-4xl font-bold text-red-700">{importResult.data.total_skipped}</p>
                </div>
              </div>
              
              <ResultsTable 
                title="Imported Records" 
                records={importResult.data.imported_records} 
              />
              
              <ResultsTable 
                title="Skipped Records" 
                records={importResult.data.skipped_records} 
              />
            </div>
          )}

          {selectedFile && !hasError && headers.length > 0 && !importResult && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Preview Data</h2>
                  <p className="text-sm text-gray-500">Review your CSV data before importing.</p>
                </div>
                <button
                  onClick={handleConfirmImport}
                  disabled={loading}
                  className={`inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    loading 
                      ? 'bg-blue-400 cursor-not-allowed opacity-90' 
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-sm active:bg-blue-800'
                  }`}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Confirm Import'
                  )}
                </button>
              </div>
              
              <DataTable headers={headers} rows={previewData} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
