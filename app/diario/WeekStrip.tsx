import Link from "next/link";

const LETTERS = ["S", "T", "Q", "Q", "S", "S", "D"];

// Tira da semana (seg-dom) da data selecionada: dias com registro em verde,
// dia selecionado em brasa, cada dia navega via ?date=.
export default function WeekStrip({
  weekDays,
  selectedDate,
  today,
  loggedDates,
  streak,
}: {
  weekDays: string[];
  selectedDate: string;
  today: string;
  loggedDates: string[];
  streak: number;
}) {
  const logged = new Set(loggedDates);
  return (
    <nav className="fx-dday-week" aria-label="Semana">
      {weekDays.map((d, i) => {
        const cls = [
          "fx-dday-day",
          d === selectedDate ? "on" : "",
          logged.has(d) ? "done" : "",
          d === today ? "today" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <Link
            key={d}
            href={`/diario?date=${d}`}
            className={cls}
            aria-current={d === selectedDate ? "date" : undefined}
            aria-label={`${d.slice(8, 10)}/${d.slice(5, 7)}${logged.has(d) ? ", com registro" : ""}`}
          >
            <i>{LETTERS[i]}</i>
            {Number(d.slice(8, 10))}
          </Link>
        );
      })}
      <div className="fx-dday-streak" title="Dias seguidos com registro">
        🔥 {streak}
      </div>
    </nav>
  );
}
