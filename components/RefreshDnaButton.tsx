'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function RefreshDnaButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function aggiorna() {
    setLoading(true);
    try {
      await fetch('/api/dna/refresh', { method: 'POST' });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={aggiorna}
      disabled={loading}
      className="no-print text-xs rounded-md border border-slate-300 px-2 py-1 hover:border-brand disabled:opacity-50"
    >
      {loading ? 'Aggiorno…' : '↻ Aggiorna DNA'}
    </button>
  );
}
