'use client';

export function ExportButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print rounded-lg bg-brand text-white px-4 py-2 text-sm font-medium hover:opacity-90"
    >
      Esporta in PDF
    </button>
  );
}
