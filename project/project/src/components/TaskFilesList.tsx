import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Eye, FileText, Loader2, Trash2, X } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

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

interface PdfPageCanvasProps {
  pdfDocument: PDFDocumentProxy;
  pageNumber: number;
}

const PdfPageCanvas: React.FC<PdfPageCanvasProps> = ({ pdfDocument, pageNumber }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let renderTask: {
      promise: Promise<void>;
      cancel: () => void;
    } | null = null;

    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(pageNumber);

        if (cancelled) return;

        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;

        if (!canvas) return;

        const context = canvas.getContext('2d');

        if (!context) return;

        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);

        renderTask = page.render({
          canvasContext: context,
          viewport,
          transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
        });

        await renderTask.promise;
      } catch (error) {
        if (!cancelled) {
          console.error(`Could not render PDF page ${pageNumber}:`, error);
        }
      }
    };

    void renderPage();

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pdfDocument, pageNumber]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        aria-label={`PDF page ${pageNumber}`}
        className="h-auto max-w-full bg-white shadow-md"
      />
    </div>
  );
};

const TaskFilesList: React.FC<TaskFilesListProps> = ({ taskId, refreshKey = 0 }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewDocument, setPreviewDocument] = useState<PDFDocumentProxy | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

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
    void fetchFiles();
  }, [fetchFiles, refreshKey]);

  useEffect(() => {
    return () => {
      if (previewDocument) {
        void previewDocument.destroy();
      }
    };
  }, [previewDocument]);

  const handlePreview = async (file: FileItem) => {
    if (previewLoading) return;

    if (previewDocument) {
      await previewDocument.destroy();
      setPreviewDocument(null);
    }

    setPreviewFile(file);
    setPreviewLoading(true);
    setPreviewError('');
    setErrorMessage('');

    try {
      const { data, error } = await supabase.storage.from('task-files').download(file.file_path);

      if (error) {
        setPreviewError(`Could not load preview: ${error.message}`);
        return;
      }

      const arrayBuffer = await data.arrayBuffer();

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      });

      const pdfDocument = await loadingTask.promise;

      setPreviewDocument(pdfDocument);
    } catch (error) {
      console.error(error);
      setPreviewError('An unexpected error occurred while opening the PDF.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    if (previewDocument) {
      void previewDocument.destroy();
    }

    setPreviewFile(null);
    setPreviewDocument(null);
    setPreviewLoading(false);
    setPreviewError('');
  };

  const handleDownload = async (filePath: string) => {
    setErrorMessage('');

    const { data, error } = await supabase.storage.from('task-files').createSignedUrl(filePath, 60);

    if (error) {
      setErrorMessage(`Could not create download link: ${error.message}`);
      return;
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async (fileId: string, filePath: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this file?');

    if (!confirmed) return;

    setErrorMessage('');

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

    if (previewFile?.id === fileId) {
      handleClosePreview();
    }

    await fetchFiles();
  };

  return (
    <>
      <div className="mt-4 rounded-xl border border-gray-200 bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/50">
        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">PDF files</h3>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading files...
          </div>
        )}

        {!loading && errorMessage && (
          <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        )}

        {!loading && !errorMessage && files.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">No files yet.</p>
        )}

        {!loading && files.length > 0 && (
          <ul className="space-y-2">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex min-w-0 flex-col gap-3 rounded-lg border border-gray-200 bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700 dark:bg-gray-950/30"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="shrink-0 rounded-lg bg-red-100 p-2 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
                      title={file.file_name}
                    >
                      {file.file_name}
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Added: {new Date(file.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(file)}
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden md:inline">Preview</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(file.file_path)}
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden md:inline">Download</span>
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(file.id, file.file_path)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden md:inline">Delete</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog
        open={previewFile !== null}
        onOpenChange={(open) => {
          if (!open) {
            handleClosePreview();
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="flex h-[92dvh] w-[calc(100%-1rem)] max-w-6xl flex-col gap-0 overflow-hidden border border-slate-300 bg-white p-0 text-slate-950 shadow-2xl sm:w-[calc(100%-2rem)] sm:max-w-6xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <DialogHeader className="relative shrink-0 border-b border-slate-200 bg-white px-5 py-4 pr-14 dark:border-slate-700 dark:bg-slate-900">
            <DialogTitle
              className="truncate text-base font-semibold text-slate-950 sm:text-lg dark:text-slate-100"
              title={previewFile?.file_name}
            >
              {previewFile?.file_name ?? 'PDF preview'}
            </DialogTitle>

            <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
              {previewDocument
                ? `${previewDocument.numPages} ${previewDocument.numPages === 1 ? 'page' : 'pages'}`
                : 'Preview of the selected task attachment.'}
            </DialogDescription>

            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close PDF preview"
                className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </DialogClose>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-200 p-2 sm:p-6 dark:bg-slate-950">
            {previewLoading && (
              <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Loading preview...
              </div>
            )}

            {!previewLoading && previewError && (
              <div className="flex h-full items-center justify-center p-6 text-center">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{previewError}</p>
              </div>
            )}

            {!previewLoading && !previewError && previewDocument && (
              <div className="mx-auto flex max-w-5xl flex-col gap-4">
                {Array.from({ length: previewDocument.numPages }, (_, index) => (
                  <PdfPageCanvas
                    key={index + 1}
                    pdfDocument={previewDocument}
                    pageNumber={index + 1}
                  />
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 flex-row justify-end rounded-none border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
            {previewFile && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDownload(previewFile.file_path)}
                className="border-slate-300 bg-white text-slate-900 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download
              </Button>
            )}

            <Button
              type="button"
              onClick={handleClosePreview}
              className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskFilesList;
