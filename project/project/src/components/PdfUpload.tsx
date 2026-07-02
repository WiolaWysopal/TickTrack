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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const clearSelectedFile = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      clearSelectedFile();
      setMessage('Please select a PDF file.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      clearSelectedFile();
      setMessage(`File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setFile(selectedFile);
    setMessage('');
  };

  const handleUpload = async () => {
    if (uploading) return;

    if (!file) {
      setMessage('No file selected.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage('You must be signed in to upload a file.');
        return;
      }

      const safeFileName = sanitizeFileName(file.name);
      const filePath = `${user.id}/${taskId}/${Date.now()}_${safeFileName}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('task-files')
        .upload(filePath, file);

      if (storageError) {
        setMessage(`Upload failed: ${storageError.message}`);
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
        setMessage(`Database save failed: ${dbError.message}`);
        return;
      }

      setMessage('File uploaded successfully.');
      clearSelectedFile();
      onUploadSuccess?.();
    } catch (error) {
      console.error(error);
      setMessage('An unexpected error occurred.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-md border p-4 shadow-sm">
      <h3 className="mb-1 text-lg font-semibold">Upload task PDF</h3>
      <p className="mb-3 text-xs text-gray-500">
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
          className="cursor-pointer rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
        >
          Choose PDF
        </label>

        <div className="min-w-0 flex-1">
          {file ? (
            <span className="block truncate text-sm text-gray-600" title={file.name}>
              {file.name}
            </span>
          ) : (
            <span className="block text-sm text-gray-400">No file selected</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !file}
          className="shrink-0 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
        >
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </div>

      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );
};

export default PdfUpload;
