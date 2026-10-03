import { cookies } from "next/headers";
import { WEIGHT_UNIT_COOKIE, isWeightUnit, type WeightUnit } from "@/lib/weight-unit";

/** Server Component helper: reads the kg/lb preference cookie set by `setWeightUnit`. */
export async function getServerWeightUnit(): Promise<WeightUnit> {
  const cookieStore = await cookies();
  const value = cookieStore.get(WEIGHT_UNIT_COOKIE)?.value;
  return isWeightUnit(value) ? value : "kg";
}
