'use client';
import { useEffect, useState } from 'react';

export default function RtlToggle() {
  const [rtl, setRtl] = useState(false);

  useEffect(() => {
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  }, [rtl]);

  return (
    <button
      className="text-xs rounded-full border px-3 py-1 hover:bg-zinc-50 "
      onClick={() => setRtl((v) => !v)}
      aria-pressed={rtl}
      title="Toggle RTL/LTR"
    >
      {rtl ? 'RTL' : 'LTR'}
    </button>
  );
}
