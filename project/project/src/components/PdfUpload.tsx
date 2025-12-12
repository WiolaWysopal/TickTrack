import React, { useState, useRef } from "react";
import { supabase } from "../lib/supabase";

const PdfUpload: React.FC<PdfUploadProps> = ({ taskId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null); // <-- NOWE

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

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("Musisz być zalogowany, aby przesłać plik.");
        return;
      }

      const userId = user.id;
      const fileName = `${userId}/${taskId}/${Date.now()}_${file.name}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from("task-files")
        .upload(fileName, file);

      if (storageError) {
        setMessage(`Błąd uploadu: ${storageError.message}`);
        return;
      }

      const filePath = storageData?.path;

      const { error: dbError } = await supabase
        .from("task_files")
        .insert([
          {
            task_id: taskId,
            user_id: userId,
            file_name: file.name,
            file_path: filePath
          }
        ]);

      if (dbError) {
        setMessage(`Błąd zapisu w bazie: ${dbError.message}`);
        return;
      }

      setMessage("Plik przesłany i zapisany pomyślnie!");
      setFile(null);

      // 🔥 WYCZYSZCZENIE INPUTA
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
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

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        ref={fileInputRef}  // <-- DODANE
      />

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
