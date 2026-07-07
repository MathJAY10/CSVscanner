import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { FileText, X } from 'lucide-react';
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
    <div className="w-full transition-all duration-300">
      {!file ? (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl py-14 px-6 flex flex-col items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 ${
            disabled 
              ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' 
              : isDragging 
                ? 'border-[#2D735C] bg-[#F4F9F7] scale-[1.02] shadow-inner cursor-pointer' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50 bg-[#FCFCFD] hover:shadow-sm cursor-pointer hover:scale-[1.01]'
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
          <div className={`w-14 h-14 mb-5 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-center transition-transform duration-300 ${isDragging ? 'scale-110 shadow-md border-[#BCE1D4]' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={isDragging ? '#2D735C' : '#6B7280'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-300"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          </div>
          <p className="text-[17px] font-extrabold text-gray-900 text-center mb-1">
            {disabled ? 'Processing...' : 'Drop your CSV file here'}
          </p>
          <p className="text-sm text-gray-500 font-medium text-center mb-5">
            or click to browse files
          </p>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-gray-200/80 bg-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <span className="text-xs text-gray-500 font-bold tracking-wide">Supported file: .csv (max {MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB)</span>
          </div>
          
          <div className="mt-7">
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="inline-flex items-center space-x-2 text-xs font-bold text-[#2D735C] bg-[#F4F9F7] px-4 py-2.5 rounded-lg border border-[#BCE1D4] hover:bg-[#E0F2EC] hover:shadow-sm transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
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
        <div className={`border border-[#BCE1D4] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between bg-[#F4F9F7] shadow-sm transition-all duration-300 hover:shadow-md animate-in fade-in zoom-in-95 ${disabled ? 'opacity-70 pointer-events-none grayscale-[0.2]' : ''}`}>
          <div className="flex items-center space-x-4 overflow-hidden mb-3 sm:mb-0">
            <div className="w-12 h-12 bg-[#E0F2EC] flex flex-col items-center justify-center rounded-lg shrink-0 border border-[#BCE1D4] shadow-sm">
              <FileText className="w-5 h-5 text-[#2D735C] mb-0.5" strokeWidth={2.5} />
              <span className="text-[9px] font-black tracking-wider text-[#2D735C]">CSV</span>
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[15px] font-bold text-gray-900 truncate" title={file.name}>
                {file.name}
              </span>
              <span className="text-[13px] text-gray-500 font-semibold mt-0.5">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="text-[13px] text-[#2D735C] hover:text-[#1e5241] font-bold px-4 py-2 rounded-lg border border-[#BCE1D4] hover:bg-white bg-white/50 shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D735C] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Replace file"
            >
              Replace
            </button>
            <button
              onClick={onFileRemove}
              disabled={disabled}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Remove file"
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
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
