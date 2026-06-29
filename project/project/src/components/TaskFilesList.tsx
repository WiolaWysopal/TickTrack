import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface FileItem {
  id: string;
  file_name: string;
  file_path: string;
  created_at: string;
}

interface TaskFilesListProps {
  taskId: string;
  refreshKey?: number;
}

const TaskFilesList: React.FC<TaskFilesListProps> = ({ taskId, refreshKey = 0 }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage('You must be signed in to view files.');
        setFiles([]);
        return;
      }

      const { data, error } = await supabase
        .from('task_files')
        .select('id, file_name, file_path, created_at')
        .eq('task_id', taskId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setErrorMessage(`Could not load files: ${error.message}`);
        return;
      }

      setFiles((data as FileItem[]) ?? []);
    } catch (error) {
      console.error(error);
      setErrorMessage('An unexpected error occurred while loading files.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshKey]);

  const handleDownload = async (filePath: string) => {
    const { data, error } = await supabase.storage.from('task-files').createSignedUrl(filePath, 60);

    if (error) {
      setErrorMessage(`Could not create download link: ${error.message}`);
      return;
    }

    window.open(data.signedUrl, '_blank');
  };

  const handleDelete = async (fileId: string, filePath: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this file?');
    if (!confirmed) return;

    const { error: storageError } = await supabase.storage.from('task-files').remove([filePath]);

    if (storageError) {
      setErrorMessage(`Could not delete file from storage: ${storageError.message}`);
      return;
    }

    const { error: dbError } = await supabase.from('task_files').delete().eq('id', fileId);

    if (dbError) {
      setErrorMessage(`Could not delete file record: ${dbError.message}`);
      return;
    }

    await fetchFiles();
  };

  return (
    <div className="mt-4 rounded-md border p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold">PDF files</h3>

      {loading && <p className="text-sm text-gray-500">Loading files...</p>}

      {!loading && errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

      {!loading && !errorMessage && files.length === 0 && (
        <p className="text-sm text-gray-500">No files yet.</p>
      )}

      {!loading && !errorMessage && files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex min-w-0 flex-col gap-2 rounded border p-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" title={file.file_name}>
                  {file.file_name}
                </p>
                <p className="text-xs text-gray-500">
                  Added: {new Date(file.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex shrink-0 gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleDownload(file.file_path)}
                  className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                >
                  Download
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(file.id, file.file_path)}
                  className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskFilesList;
