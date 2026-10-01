import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MEASUREMENT_FIELDS } from "@/lib/fenix-domain";
import TopBar from "@/components/TopBar";
import LineChart from "@/components/LineChart";
import QuickAddMeasurements from "./QuickAddMeasurements";

export default async function MedidasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.role) redirect("/complete-profile");
  if (profile.role === "personal") redirect("/personal");
  if (!profile.onboarding_completed) redirect("/onboarding");

  const { data: measurements } = await supabase
    .from("measurements")
    .select("logged_at, values")
    .eq("profile_id", user.id)
    .order("logged_at", { ascending: true });

  const rows = measurements ?? [];

  // Only build a chart for fields that have at least one non-null data point.
  const fieldsWithData = MEASUREMENT_FIELDS.map((field) => ({
    field,
    points: rows
      .filter((r) => r.values && r.values[field.key] != null)
      .map((r) => ({ x: r.logged_at, y: Number(r.values[field.key]) })),
  })).filter((f) => f.points.length > 0);

  return (
    <>
      <TopBar
        title="Medidas corporais"
        nav={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/medidas", label: "Medidas" },
          { href: "/treino", label: "Treino" },
          { href: "/fotos", label: "Fotos" },
        ]}
      />
      <div className="fx-app">
        <div className="card">
          <h2>Registrar medidas de hoje</h2>
          <QuickAddMeasurements profileId={user.id} />
        </div>

        <div className="card">
          <h2>Evolução</h2>
          {rows.length === 0 ? (
            <div className="fx-chart-empty">
              Ainda sem medidas registradas. Adicione a primeira acima.
            </div>
          ) : fieldsWithData.length === 0 ? (
            <div className="fx-chart-empty">
              Ainda sem medidas registradas. Adicione a primeira acima.
            </div>
          ) : (
            <div className="fx-measure-grid">
              {fieldsWithData.map(({ field, points }) => (
                <div className="fx-measure-card" key={field.key}>
                  <div className="fx-measure-card-title">
                    {field.label} <span className="unit">({field.unit})</span>
                  </div>
                  <LineChart data={points} height={140} color="var(--gold)" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="footer-note">
          PROJETO FÊNIX — cada registro é um dado a mais, não um julgamento.
        </div>
      </div>
    </>
  );
}
