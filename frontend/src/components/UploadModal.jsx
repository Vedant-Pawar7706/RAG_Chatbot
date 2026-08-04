import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import Loader from './Loader';

export default function UploadModal({ isOpen, onClose, onUpload, isUploading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const allowedExtensions = ['.pdf', '.docx', '.txt'];
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB

  const validateAndSetFile = (file) => {
    setErrorMessage(null);
    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setErrorMessage(`Invalid file format "${ext}". Supported formats: PDF, DOCX, TXT.`);
      return;
    }

    if (file.size > maxSizeBytes) {
      setErrorMessage(`File size exceeds limit of 10MB.`);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || isUploading) return;
    const success = await onUpload(selectedFile);
    if (success) {
      setSelectedFile(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-light-green border border-emerald-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-emerald-500/20 flex items-center justify-between bg-emerald-950/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-300">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-100">Upload Document</h3>
              <p className="text-[11px] text-emerald-300/70">PDF, DOCX, or TXT (Max 10MB)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300/70 hover:text-emerald-100 hover:bg-emerald-800/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-emerald-400 bg-emerald-500/20'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-500/10'
                : 'border-emerald-500/30 hover:border-emerald-400/60 bg-emerald-950/40 hover:bg-emerald-900/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                <p className="text-xs font-bold text-emerald-100 truncate">{selectedFile.name}</p>
                <p className="text-[11px] text-emerald-300/70">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <span className="inline-block text-[11px] text-emerald-400 font-semibold underline">
                  Click to change file
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="w-10 h-10 mx-auto text-emerald-400/70 group-hover:text-emerald-300" />
                <p className="text-xs font-medium text-emerald-200">
                  Drag & drop file here, or <span className="text-emerald-400 font-semibold">browse</span>
                </p>
                <p className="text-[11px] text-emerald-400/60">Supports PDF, DOCX, TXT</p>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-emerald-300/80 hover:text-emerald-100 hover:bg-emerald-800/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/25 transition-all flex items-center space-x-2"
            >
              {isUploading ? (
                <Loader size="sm" text="Processing & Indexing..." />
              ) : (
                <span>Process & Index</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
