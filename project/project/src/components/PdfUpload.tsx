import React, { useRef, useState } from 'react';
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

const PdfUpload: React.FC<PdfUploadProps> = ({ taskId, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

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
    <div className="rounded-md border border-gray-200 p-4 shadow-sm dark:border-gray-700">
      <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Upload task PDF
      </h3>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        Accepted format: PDF. Maximum size: {MAX_FILE_SIZE_MB} MB.
      </p>

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <input
          ref={fileInputRef}
          id={`pdf-upload-${taskId}`}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <label
          htmlFor={`pdf-upload-${taskId}`}
          className="cursor-pointer rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
        >
          Choose PDF
        </label>

        <div className="min-w-0 flex-1">
          {file ? (
            <span
              className="block truncate text-sm text-gray-700 dark:text-gray-300"
              title={file.name}
            >
              {file.name}
            </span>
          ) : (
            <span className="block text-sm text-gray-500 dark:text-gray-400">No file selected</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !file}
          className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
        >
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </div>

      {message && (
        <p
          className={`mt-2 text-sm ${
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
