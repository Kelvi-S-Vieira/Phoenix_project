"use client";

import { useRouter } from "next/navigation";

// Prev/next day + date input, all navigating via the `?date=` search param
// so app/diario/page.tsx (a Server Component) re-fetches diary_entries for
// whichever date is selected. Ported from the prototype's di_datePrev/
// di_dateNext/di_dateInput (projeto_fenix_app_final.html, ~lines 17789-17804).
export default function DateNav({ selectedDate }: { selectedDate: string }) {
  const router = useRouter();

  function goTo(dateStr: string) {
    router.push(`/diario?date=${dateStr}`);
  }

  function shiftDay(offset: number) {
    // selectedDate is always a plain YYYY-MM-DD calendar date, not an
    // instant — stepping it is pure UTC-anchored date arithmetic (no time
    // zone resolution needed, unlike lib/date-br.ts's "now"-based helpers).
    const [y, m, d] = selectedDate.split("-").map(Number);
    const anchor = new Date(Date.UTC(y, m - 1, d));
    anchor.setUTCDate(anchor.getUTCDate() + offset);
    goTo(anchor.toISOString().slice(0, 10));
  }

  return (
    <div className="date-nav">
      <button type="button" onClick={() => shiftDay(-1)} aria-label="Dia anterior">
        ‹
      </button>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => e.target.value && goTo(e.target.value)}
      />
      <button type="button" onClick={() => shiftDay(1)} aria-label="Próximo dia">
        ›
      </button>
    </div>
  );
}
