import { downloadPdf } from "@/lib/downloadPdf";

export function DocumentPanel({
  title,
  content,
  isLoading,
  loadingText,
  downloadFilename,
  onPreview,
  onDismiss,
}: {
  title: string;
  content: string | null;
  isLoading: boolean;
  loadingText: string;
  downloadFilename: string;
  onPreview: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="border border-gray-700 rounded-xl p-5 bg-gray-900 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{title}</h3>
        <div className="flex gap-2 items-center">
          {content && (
            <>
              <button
                onClick={onPreview}
                className="text-xs border border-gray-600 text-gray-300 px-3 py-1 rounded hover:bg-gray-700"
              >
                Preview PDF
              </button>
              <button
                onClick={() => downloadPdf(downloadFilename, content)}
                className="text-xs bg-amber-400 text-black px-3 py-1 rounded hover:bg-amber-500"
              >
                Download PDF
              </button>
            </>
          )}
          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-300 text-base leading-none px-1"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-6">
          <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          {loadingText}
        </div>
      ) : content ? (
        <div className="bg-gray-800 rounded-lg p-4 max-h-130 overflow-y-auto">
          <pre className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed font-sans">
            {content}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
