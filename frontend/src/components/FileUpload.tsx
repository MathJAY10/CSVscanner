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
    <div className="w-full max-w-xl mx-auto transition-opacity duration-200">
      {!file ? (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
            disabled 
              ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' 
              : isDragging 
                ? 'border-blue-500 bg-blue-50 cursor-pointer' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 cursor-pointer'
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
          <UploadCloud className={`w-12 h-12 mb-4 transition-colors ${isDragging || disabled ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-lg font-medium text-gray-700 text-center">
            {disabled ? 'Processing...' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            CSV (Max. {MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB)
          </p>
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
        <div className={`border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between bg-white shadow-sm transition-opacity duration-200 ${disabled ? 'opacity-70 pointer-events-none' : ''}`}>
          <div className="flex items-center space-x-3 overflow-hidden mb-3 sm:mb-0">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                {file.name}
              </span>
              <span className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium px-3 py-2 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Replace file"
            >
              Replace
            </button>
            <button
              onClick={onFileRemove}
              disabled={disabled}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Remove file"
            >
              <X className="w-5 h-5" />
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
