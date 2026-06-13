import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, X, AlertCircle } from 'lucide-react';

export default function ResumeUploader({ onFileSelect, selectedFile, onClear }) {
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File too large. Maximum size is 10MB.');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Only PDF files are accepted.');
      } else {
        setError('Invalid file. Please upload a PDF resume.');
      }
      return;
    }
    if (acceptedFiles[0]) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? 'var(--border-active)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '48px 32px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragActive
                ? 'var(--bg-card-hover)'
                : 'var(--bg-secondary)',
              transition: 'var(--transition)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <input {...getInputProps()} id="resume-file-input" />

            <motion.div
              animate={isDragActive ? { scale: 1.05, y: -2 } : { scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{
                width: 56, height: 56,
                background: 'var(--bg-accent-light)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                border: '1px solid var(--border)',
              }}
            >
              <Upload
                size={24}
                color="var(--text-primary)"
                strokeWidth={1.8}
              />
            </motion.div>

            <h3 style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 8,
              fontFamily: 'Space Grotesk, sans-serif',
            }}>
              {isDragActive ? 'Drop your resume here' : 'Upload Your Resume'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 16 }}>
              Drag and drop your PDF resume, or{' '}
              <span style={{ textDecoration: 'underline', fontWeight: 700 }}>browse files</span>
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'Space Grotesk, sans-serif',
              color: 'var(--text-muted)',
            }}>
              <FileText size={12} />
              PDF only · Max 10MB
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '18px 22px',
              background: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{
              width: 44, height: 44,
              background: 'var(--success-bg)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid var(--success-border)'
            }}>
              <FileText size={20} color="var(--success)" />
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontSize: '0.92rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
                {selectedFile.name}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>
                {formatSize(selectedFile.size)} · PDF
              </p>
            </div>

            <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0 }} />

            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center',
                padding: 6,
                borderRadius: '50%',
                flexShrink: 0,
                transition: 'var(--transition)',
              }}
              title="Remove file"
              className="btn-ghost"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginTop: 14,
              padding: '12px 16px',
              background: 'var(--error-bg)',
              border: '1px solid var(--error-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--error)',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
