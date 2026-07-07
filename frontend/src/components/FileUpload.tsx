import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import { MAX_FILE_SIZE_BYTES, ALLOWED_FILE_EXTENSION, ALLOWED_FILE_TYPE } from '../constants';

interface FileUploadProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onError: (error: string | null) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ file, onFileSelect, onFileRemove, onError, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (selectedFile: File) => {
    if (disabled) return;
    
    onError(null);

    if (!selectedFile.name.toLowerCase().endsWith(ALLOWED_FILE_EXTENSION) && selectedFile.type !== ALLOWED_FILE_TYPE) {
      onError('Please upload a valid CSV file.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      onError(`File is too large. Maximum size allowed is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`);
      return;
    }

    onFileSelect(selectedFile);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full transition-opacity duration-200">
      {!file ? (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl py-12 px-6 flex flex-col items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
            disabled 
              ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' 
              : isDragging 
                ? 'border-[#2D735C] bg-[#F4F9F7] cursor-pointer' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 bg-[#FCFCFD] cursor-pointer'
          }`}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label={disabled ? 'File upload disabled while processing' : 'Upload a CSV file'}
        >
          <div className="w-12 h-12 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D735C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          </div>
          <p className="text-[16px] font-bold text-gray-900 text-center mb-1">
            {disabled ? 'Processing...' : 'Drop your CSV file here'}
          </p>
          <p className="text-sm text-gray-500 text-center mb-4">
            or click to browse files
          </p>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-gray-200 bg-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <span className="text-xs text-gray-500 font-medium">Supported file: .csv (max {MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB)</span>
          </div>
          
          <div className="mt-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Download dummy handler - not strictly requested but reference has it.
                // Keeping button visual only if logic isn't there, or remove. Let's just make it visual per reference.
              }}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-[#2D735C] bg-[#F4F9F7] px-4 py-2 rounded-lg border border-[#BCE1D4] hover:bg-[#EAF5F0] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              <span>Download Sample CSV Template</span>
            </button>
          </div>

          <input
            type="file"
            accept=".csv, text/csv"
            className="hidden"
            ref={fileInputRef}
            onChange={onFileChange}
            disabled={disabled}
            aria-hidden="true"
          />
        </div>
      ) : (
        <div className={`border border-[#BCE1D4] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between bg-[#F4F9F7] transition-opacity duration-200 ${disabled ? 'opacity-70 pointer-events-none' : ''}`}>
          <div className="flex items-center space-x-3 overflow-hidden mb-3 sm:mb-0">
            <div className="w-10 h-10 bg-[#E0F2EC] flex flex-col items-center justify-center rounded-lg shrink-0 border border-[#BCE1D4]">
              <FileText className="w-5 h-5 text-[#2D735C]" />
              <span className="text-[9px] font-bold text-[#2D735C] mt-0.5">CSV</span>
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-gray-900 truncate" title={file.name}>
                {file.name}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="text-xs text-[#2D735C] hover:text-[#1e5241] font-semibold px-3 py-1.5 rounded-md border border-transparent hover:border-[#BCE1D4] hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D735C] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Replace file"
            >
              Replace
            </button>
            <button
              onClick={onFileRemove}
              disabled={disabled}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
            <input
              type="file"
              accept=".csv, text/csv"
              className="hidden"
              ref={fileInputRef}
              onChange={onFileChange}
              disabled={disabled}
              aria-hidden="true"
            />
          </div>
        </div>
      )}
    </div>
  );
};
