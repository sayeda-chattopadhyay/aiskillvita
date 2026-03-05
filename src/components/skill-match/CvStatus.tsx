export function CvStatus({
  hasCv,
  cvName,
  onUploadCv,
}: {
  hasCv: boolean;
  cvName: string | null;
  onUploadCv: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  if (hasCv) {
    return (
      <div className="flex items-center gap-3 text-sm flex-wrap">
        <span className="text-green-400">✓ CV loaded{cvName ? `: ${cvName}` : ""}</span>
        <label className="cursor-pointer text-xs text-gray-500 hover:text-gray-300 underline">
          Replace
          <input type="file" accept=".pdf" onChange={onUploadCv} className="hidden" />
        </label>
      </div>
    );
  }

  return (
    <div className="border border-amber-700/40 rounded-xl p-4 bg-amber-900/10 space-y-3">
      <p className="text-sm text-gray-300 font-medium">Upload your CV to get started</p>
      <p className="text-xs text-gray-500">Upload your PDF CV once and your profile will be built automatically.</p>
      <label className="cursor-pointer inline-flex items-center gap-2 bg-amber-400 text-black font-semibold px-5 py-2 rounded-lg text-sm hover:bg-amber-500 transition-colors">
        Upload CV (PDF)
        <input type="file" accept=".pdf" onChange={onUploadCv} className="hidden" />
      </label>
    </div>
  );
}
