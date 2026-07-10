import React, { useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PdfUploadProps {
  taskId: string;
  onUploadSuccess?: () => void;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const sanitizeFileName = (fileName: string) => {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_');
};

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const PdfUpload: React.FC<PdfUploadProps> = ({ taskId, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounterRef = useRef(0);

  const clearSelectedFile = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const setError = (text: string) => {
    setMessage(text);
    setMessageType('error');
  };

  const setSuccess = (text: string) => {
    setMessage(text);
    setMessageType('success');
  };

  const clearMessage = () => {
    setMessage('');
    setMessageType(null);
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      clearSelectedFile();
      setError('Please select a PDF file.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      clearSelectedFile();
      setError(`File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setFile(selectedFile);
    clearMessage();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    validateAndSetFile(selectedFile);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    dragCounterRef.current += 1;
    setIsDragging(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    dragCounterRef.current -= 1;

    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    dragCounterRef.current = 0;
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (!droppedFile) return;

    validateAndSetFile(droppedFile);
  };

  const handleChooseFile = () => {
    if (uploading) return;

    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (uploading) return;

    if (!file) {
      setError('No file selected.');
      return;
    }

    setUploading(true);
    clearMessage();

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('You must be signed in to upload a file.');
        return;
      }

      const safeFileName = sanitizeFileName(file.name);
      const filePath = `${user.id}/${taskId}/${Date.now()}_${safeFileName}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('task-files')
        .upload(filePath, file);

      if (storageError) {
        setError(`Upload failed: ${storageError.message}`);
        return;
      }

      const { error: dbError } = await supabase.from('task_files').insert([
        {
          task_id: taskId,
          user_id: user.id,
          file_name: file.name,
          file_path: storageData.path,
        },
      ]);

      if (dbError) {
        await supabase.storage.from('task-files').remove([storageData.path]);

        setError(`Database save failed: ${dbError.message}`);
        return;
      }

      setSuccess('File uploaded successfully.');
      clearSelectedFile();
      onUploadSuccess?.();
    } catch (error) {
      console.error(error);
      setError('An unexpected error occurred.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/50">
      <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Upload task PDF
      </h3>

      <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
        Accepted format: PDF. Maximum size: {MAX_FILE_SIZE_MB} MB.
      </p>

      <input
        ref={fileInputRef}
        id={`pdf-upload-${taskId}`}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-4 transition sm:p-6 ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/40'
            : 'border-gray-300 bg-gray-50/70 dark:border-gray-700 dark:bg-gray-950/30'
        }`}
      >
        {!file ? (
          <div className="flex flex-col items-center text-center">
            <div
              className={`mb-3 hidden rounded-full p-3 sm:flex ${
                isDragging
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              <Upload className="h-6 w-6" aria-hidden="true" />
            </div>

            <p className="mb-1 hidden text-sm font-medium text-gray-800 sm:block dark:text-gray-200">
              {isDragging ? 'Drop your PDF here' : 'Drag and drop your PDF here'}
            </p>

            <p className="mb-3 hidden text-xs text-gray-500 sm:block dark:text-gray-400">
              or choose it from your device
            </p>

            <button
              type="button"
              onClick={handleChooseFile}
              disabled={uploading}
              className="w-full rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              Choose PDF
            </button>
          </div>
        ) : (
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="shrink-0 rounded-lg bg-red-100 p-2 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                <FileText className="h-6 w-6" aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
                  title={file.name}
                >
                  {file.name}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF · {formatFileSize(file.size)}
                </p>
              </div>

              <button
                type="button"
                onClick={clearSelectedFile}
                disabled={uploading}
                aria-label="Remove selected file"
                className="shrink-0 rounded-md p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleChooseFile}
                disabled={uploading}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                Change PDF
              </button>

              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
              >
                {uploading ? 'Uploading...' : 'Upload PDF'}
              </button>
            </div>
          </div>
        )}
      </div>

      {message && (
        <p
          role={messageType === 'error' ? 'alert' : 'status'}
          className={`mt-3 text-sm ${
            messageType === 'error'
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default PdfUpload;
