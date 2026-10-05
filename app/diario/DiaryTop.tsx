"use client";

import FlameBar, { type FlameGoal, type MealKey } from "./FlameBar";
import { useMinutesBR } from "./useNowBR";

// Casca cliente do medidor: descobre a hora atual (America/Sao_Paulo) e só a
// repassa ao FlameBar quando a data exibida é hoje (projeção e alerta das 19h).
export default function DiaryTop({
  isToday,
  kcalTarget,
  kcalConsumed,
  macros,
  macroTargets,
  mealKcal,
  goal,
  streak,
}: {
  isToday: boolean;
  kcalTarget: number;
  kcalConsumed: number;
  macros: { protein: number; carb: number; fat: number };
  macroTargets: { protein: number | null; carb: number | null; fat: number | null };
  mealKcal: Record<MealKey, number>;
  goal: FlameGoal;
  streak: number;
}) {
  const minutes = useMinutesBR();
  const hour = isToday && minutes != null ? Math.floor(minutes / 60) : null;
  return (
    <FlameBar
      kcalTarget={kcalTarget}
      kcalConsumed={kcalConsumed}
      macros={macros}
      macroTargets={macroTargets}
      mealKcal={mealKcal}
      goal={goal}
      hour={hour}
      streak={streak}
    />
  );
}
