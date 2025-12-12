import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface FileItem {
  id: string;
  file_name: string;
  file_path: string;
  created_at: string;
}

interface TaskFilesListProps {
  taskId: string;
}

const TaskFilesList: React.FC<TaskFilesListProps> = ({ taskId }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from<FileItem>("task_files")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      setFiles(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [taskId]);

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from("task-files")
      .createSignedUrl(filePath, 60); // link ważny 60s

    if (error) {
      console.error(error);
      return;
    }

    if (data.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  const handleDelete = async (fileId: string, filePath: string) => {
    const confirmDelete = window.confirm("Czy na pewno chcesz usunąć ten plik?");
    if (!confirmDelete) return;

    // Usuń z bucketu
    const { error: storageError } = await supabase.storage
      .from("task-files")
      .remove([filePath]);

    if (storageError) {
      console.error(storageError);
      return;
    }

    // Usuń z tabeli
    const { error: dbError } = await supabase
      .from("task_files")
      .delete()
      .eq("id", fileId);

    if (dbError) {
      console.error(dbError);
      return;
    }

    // Odśwież listę
    fetchFiles();
  };

  if (loading) return <p>Ładowanie plików...</p>;

  return (
    <div className="mt-4 border rounded-md p-4 shadow-sm w-full max-w-md">
      <h3 className="text-lg font-semibold mb-2">Pliki PDF</h3>
      {files.length === 0 && <p className="text-gray-500">Brak plików</p>}
      <ul className="space-y-2">
        {files.map((file) => (
          <li key={file.id} className="flex justify-between items-center p-2 border rounded">
            <span>{file.file_name}</span>
            <div className="flex gap-2">
              <button
                className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => handleDownload(file.file_path, file.file_name)}
              >
                Pobierz
              </button>
              <button
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => handleDelete(file.id, file.file_path)}
              >
                Usuń
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskFilesList;
