"use client";

import { useId, useState } from "react";

// Medidor "barra-chama" do Diário (portado de modelo-barra-chama-v2.html).
// Componente puro: recebe tudo por props, sem fetch. As 7 melhorias:
// (1) toque alterna chama <-> faixas por macro; (2) marcas por refeição na
// meta + bolinha acesa + cards consumido/meta; (3) zona ideal 95-105%;
// (4) mensagens/cores por objetivo; (5) projeção do dia (só hoje);
// (6) chama cresce com a sequência (3 dias) e fica forte (7 dias);
// (7) movimento reduzido (CSS) + número/texto sempre visíveis + aria-label.

export type FlameGoal = "emagrecer" | "ganhar" | "manter";
export type MealKey = "cafe" | "almoco" | "lanche" | "jantar";

export type FlameBarProps = {
  kcalTarget: number;
  kcalConsumed: number;
  macros: { protein: number; carb: number; fat: number }; // g consumidos
  macroTargets: { protein: number | null; carb: number | null; fat: number | null };
  mealKcal: Record<MealKey, number>;
  mealTargetPct?: Record<MealKey, number>; // padrão 25/35/10/30
  goal: FlameGoal;
  /** Hora atual (0-23) em America/Sao_Paulo; null quando a data exibida não é hoje. */
  hour: number | null;
  streak: number;
};

const MEALS: { key: MealKey; label: string }[] = [
  { key: "cafe", label: "Café" },
  { key: "almoco", label: "Almoço" },
  { key: "lanche", label: "Lanche" },
  { key: "jantar", label: "Jantar" },
];
const DEFAULT_PCT: Record<MealKey, number> = { cafe: 0.25, almoco: 0.35, lanche: 0.1, jantar: 0.3 };
const SCALE = 1.2; // a barra vai até 120% da meta
const W = 380;
const BAR_Y = 30;
const BAR_H = 34;

export default function FlameBar({
  kcalTarget,
  kcalConsumed,
  macros,
  macroTargets,
  mealKcal,
  mealTargetPct = DEFAULT_PCT,
  goal,
  hour,
  streak,
}: FlameBarProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [view, setView] = useState<"flame" | "macro">("flame");

  const T = kcalTarget;
  const k = Math.round(kcalConsumed);
  const pct = T > 0 ? k / T : 0;
  const rest = Math.max(0, T - k);
  const inZone = T > 0 && pct >= 0.95 && pct <= 1.05;
  const isOver = T > 0 && pct > 1.05;

  const usable = W - 6;
  const x = Math.min(1, T > 0 ? k / (T * SCALE) : 0) * usable;
  const xz1 = (0.95 / SCALE) * usable;
  const xz2 = (1.05 / SCALE) * usable;
  const xm = (1 / SCALE) * usable;

  // (4) cores por objetivo: emagrecer -> acima = dourado (alerta); demais -> acima = verde
  const overBad = goal === "emagrecer";
  // Cores via tokens do tema (globals.css: --flame-*), para funcionar no claro e no escuro.
  const hotEnd = isOver
    ? overBad
      ? "var(--flame-over-bad-end)"
      : "var(--flame-over-ok-end)"
    : "var(--flame-end)";
  const hotMid = isOver
    ? overBad
      ? "var(--flame-over-bad-mid)"
      : "var(--flame-over-ok-mid)"
    : "var(--flame-mid)";

  // (6) força da chama pela sequência
  const power = streak >= 7 ? 1.25 : streak >= 3 ? 1.1 : 1;
  const tongue = (s: number) => {
    const a = 30 * s * power;
    const b = 26 * s * power;
    const c = 12 * s * power;
    const d = 44 * power;
    return `M0 -${a} C14 -${b} 26 -${c} ${d} 0 C26 ${c} 14 ${b} 0 ${a} Z`;
  };

  // (1) faixas por macro (parcela das kcal)
  const kp = macros.protein * 4;
  const kc = macros.carb * 4;
  const kf = macros.fat * 9;
  const mt = kp + kc + kf || 1;
  const wp = (x * kp) / mt;
  const wc = (x * kc) / mt;
  const wf = (x * kf) / mt;

  // (2) marcas por refeição
  const marks = MEALS.map((m, i) => {
    const cum = MEALS.slice(0, i + 1).reduce((s, x) => s + mealTargetPct[x.key], 0);
    return { ...m, px: (cum / SCALE) * usable, lit: mealKcal[m.key] > 0 };
  });

  // (3)(4) mensagem de status
  let msg = "";
  let tone: "" | "ok" | "alert" = "";
  const late = hour != null && hour >= 19;
  if (T <= 0) {
    msg = "Defina sua meta de calorias no Perfil para acompanhar o dia.";
  } else if (inZone) {
    msg = "Dentro da meta de hoje (±5%). Ótimo!";
    tone = "ok";
  } else if (goal === "emagrecer") {
    if (isOver) {
      msg = `${k - T} kcal acima da meta. Para emagrecer, vale compensar com uma próxima refeição mais leve.`;
      tone = "alert";
    } else msg = `Faltam ${rest} kcal. Seguindo bem para o déficit.`;
  } else if (goal === "ganhar") {
    if (isOver) {
      msg = `+${k - T} kcal de superávit. Perfeito para ganhar massa.`;
      tone = "ok";
    } else if (late) {
      msg = `Ainda faltam ${rest} kcal e o dia está acabando. Que tal um lanche reforçado?`;
      tone = "alert";
    } else msg = `Faltam ${rest} kcal para a meta de ganho.`;
  } else if (isOver) {
    msg = `Passou ${k - T} kcal da manutenção.`;
    tone = "alert";
  } else msg = `Faltam ${rest} kcal para manter o peso.`;

  // (5) projeção: dia 6h-22h, a partir das 9h, só hoje e com kcal > 0
  let projection: number | null = null;
  if (hour != null && k > 0 && hour >= 9 && hour < 22 && T > 0) {
    const frac = Math.min(1, Math.max(0.01, (hour - 6) / 16));
    projection = Math.round(k / frac);
  }

  const aria =
    T > 0
      ? `Barra de calorias do dia: ${k} de ${T} kcal, ${Math.round(pct * 100)}% da meta. ${msg} Toque para alternar entre chama e macros.`
      : `Barra de calorias do dia: ${k} kcal consumidas.`;

  const macroCards: { label: string; v: number; t: number | null }[] = [
    { label: "Proteína", v: macros.protein, t: macroTargets.protein },
    { label: "Carbo", v: macros.carb, t: macroTargets.carb },
    { label: "Gordura", v: macros.fat, t: macroTargets.fat },
  ];

  return (
    <section className="fx-flame-card" aria-label="Medidor de calorias">
      <div className="fx-flame-head">
        <div>
          <span className="fx-flame-num">{isOver ? `+${k - T}` : rest}</span>
          <span className="fx-flame-unit"> kcal</span>
        </div>
        <div className="fx-flame-headr">
          <span className="fx-flame-streak">
            🔥 {streak}
            {streak >= 7 ? " · chama forte" : ""}
          </span>
          <small>
            {isOver ? "acima da meta" : "restantes"} · meta {T || "—"}
          </small>
        </div>
      </div>

      <svg
        className="fx-flame-svg"
        viewBox={`0 0 ${W} 92`}
        role="img"
        aria-label={aria}
        tabIndex={0}
        onClick={() => setView((v) => (v === "flame" ? "macro" : "flame"))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setView((v) => (v === "flame" ? "macro" : "flame"));
          }
        }}
      >
        <defs>
          <linearGradient id={`gf${uid}`} x1="0" x2="1">
            <stop offset="0" stopColor="var(--flame-base)" />
            <stop offset=".45" stopColor="var(--flame-deep)" />
            <stop offset=".8" stopColor={hotMid} />
            <stop offset="1" stopColor={hotEnd} />
          </linearGradient>
          <filter id={`gl${uid}`} x="-30%" y="-80%" width="160%" height="260%">
            <feGaussianBlur stdDeviation={streak >= 7 ? 7 : 5} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={`trk${uid}`}>
            <rect x="0" y={BAR_Y} width={W} height={BAR_H} rx="17" />
          </clipPath>
        </defs>

        <rect className="fx-flame-track" x="0" y={BAR_Y} width={W} height={BAR_H} rx="17" />
        <rect
          x={xz1}
          y={BAR_Y - 6}
          width={xz2 - xz1}
          height={BAR_H + 12}
          rx="6"
          fill="var(--fx-zone)"
          opacity=".22"
          stroke="var(--fx-zone)"
          strokeOpacity=".7"
          strokeDasharray="3 3"
        />
        <text x={xm} y={BAR_Y - 12} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="var(--fx-zone-text)">
          zona ideal
        </text>

        {k > 0 && view === "flame" && (
          <rect
            x="0"
            y={BAR_Y}
            width={x}
            height={BAR_H}
            fill={`url(#gf${uid})`}
            clipPath={`url(#trk${uid})`}
            style={{ transition: "width .5s" }}
          />
        )}
        {k > 0 && view === "macro" && (
          <g clipPath={`url(#trk${uid})`}>
            <rect x="0" y={BAR_Y} width={wp} height={BAR_H} fill="var(--macro-p)" />
            <rect x={wp} y={BAR_Y} width={wc} height={BAR_H} fill="var(--macro-c)" />
            <rect x={wp + wc} y={BAR_Y} width={wf} height={BAR_H} fill="var(--macro-f)" />
          </g>
        )}

        {k > 0 && view === "flame" && (
          <>
            <g transform={`translate(${x - 6} ${BAR_Y + BAR_H / 2})`} fill={hotEnd} filter={`url(#gl${uid})`} opacity=".95">
              <g className="fx-flame-fl">
                <path d={tongue(0.62)} />
              </g>
              <g className="fx-flame-fl fx-flame-fl2" fill={hotMid} transform="translate(-8 0)">
                <path d={tongue(0.5)} />
              </g>
              <g className="fx-flame-fl" fill="var(--flame-core)" transform="translate(-14 0) scale(.55)">
                <path d={tongue(0.4)} />
              </g>
              {streak >= 7 && (
                <g className="fx-flame-fl fx-flame-fl2" fill="var(--flame-core)" opacity=".7" transform="translate(-4 0) scale(.8)">
                  <path d={tongue(0.35)} />
                </g>
              )}
            </g>
            <g fill={hotEnd}>
              <circle className="fx-flame-em" cx={x - 16} cy={BAR_Y - 4} r="2.2" />
              <circle className="fx-flame-em fx-flame-em2" cx={x - 36} cy={BAR_Y - 2} r="1.6" />
              <circle className="fx-flame-em fx-flame-em3" cx={x - 58} cy={BAR_Y - 3} r="1.9" />
            </g>
          </>
        )}

        {marks.map((m) => (
          <g key={m.key}>
            <rect x={m.px - 1} y={BAR_Y} width="2" height={BAR_H} fill="var(--fx-mark)" opacity=".75" />
            <circle
              cx={m.px}
              cy={BAR_Y + BAR_H + 12}
              r="4"
              fill={m.lit ? "var(--ember)" : "var(--fx-dot-off)"}
              stroke={m.lit ? "none" : "var(--fx-dot-stroke)"}
            />
          </g>
        ))}
      </svg>

      <div className="fx-flame-leg">
        {view === "macro" ? (
          <>
            <span><i style={{ background: "var(--macro-p)" }} />Proteína</span>
            <span><i style={{ background: "var(--macro-c)" }} />Carbo</span>
            <span><i style={{ background: "var(--macro-f)" }} />Gordura</span>
          </>
        ) : (
          <span>● refeição registrada · ┆ meta = {T || "—"} kcal</span>
        )}
      </div>

      <div className="fx-flame-meals">
        {MEALS.map((m) => (
          <div key={m.key} className={`fx-flame-ml${mealKcal[m.key] > 0 ? " on" : ""}`}>
            <i />
            {m.label}
            <b>
              {Math.round(mealKcal[m.key])}/{Math.round(T * mealTargetPct[m.key])}
            </b>
          </div>
        ))}
      </div>

      <div className={`fx-flame-status${tone ? ` ${tone}` : ""}`} role="status">
        {msg}
      </div>
      {projection != null && (
        <div className="fx-flame-proj">
          📈 No ritmo de agora você fecha o dia em <b>~{projection} kcal</b> ({projection - T > 0 ? "+" : ""}
          {projection - T} vs. meta).
        </div>
      )}

      <div className="fx-flame-macros">
        {macroCards.map((m) => (
          <div key={m.label} className="fx-flame-m">
            {m.label}
            <b>
              {Math.round(m.v)}/{m.t ?? "—"}g
            </b>
          </div>
        ))}
      </div>
      <div className="fx-flame-hint">Toque na barra: alterna entre “chama” e “por macro”</div>
    </section>
  );
}
