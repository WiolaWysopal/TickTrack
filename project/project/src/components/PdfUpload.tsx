// D:\GitHub Profile\TickTrack\project\project\src\components\PdfUpload.tsx
import React, { useState } from "react";
import { supabase } from "../lib/supabase"; // upewnij się, że masz supabase.ts w lib

interface PdfUploadProps {
  taskId: string;
}

const PdfUpload: React.FC<PdfUploadProps> = ({ taskId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setMessage("Proszę wybrać plik PDF.");
        return;
      }
      setFile(selectedFile);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Nie wybrano pliku.");
      return;
    }

    try {
      setUploading(true);
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("task-files") // <-- Twój bucket
        .upload(fileName, file);

      if (error) {
        setMessage(`Błąd: ${error.message}`);
        return;
      }

      // Zapisujemy ścieżkę i taskId w tabeli task_files
      const filePath = data?.path;
      if (filePath) {
        const { error: dbError } = await supabase
          .from("task_files")
          .insert([{ task_id: taskId, file_name: file.name, file_path: filePath }]);

        if (dbError) {
          setMessage(`Błąd zapisu w bazie: ${dbError.message}`);
          return;
        }

        setMessage(`Plik ${file.name} został przesłany i zapisany!`);
        setFile(null);
      }
    } catch (err) {
      setMessage("Wystąpił nieoczekiwany błąd.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-sm w-full max-w-md">
      <h2 className="text-lg font-semibold mb-2">Upload PDF</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {file && <p className="mt-2">Wybrano: {file.name}</p>}
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? "Wysyłanie..." : "Wyślij PDF"}
      </button>
      {message && <p className="mt-2 text-sm text-red-500">{message}</p>}
    </div>
  );
};

export default PdfUpload;

