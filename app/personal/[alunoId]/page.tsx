import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import { PERSONAL_SIDEBAR_SECTIONS } from "@/lib/sidebar-nav";
import WeightChart from "@/components/WeightChart";
import ChatThread from "@/components/ChatThread";
import { GOAL_LABELS, TIER_LABELS, SPLIT_OPTIONS } from "@/lib/fenix-domain";
import ApplyTemplate from "./ApplyTemplate";

export default async function AlunoDetailPage({
  params,
}: {
  params: Promise<{ alunoId: string }>;
}) {
  const { alunoId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: personalProfile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  const { data: aluno } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", alunoId)
    .eq("linked_personal_id", user.id)
    .single();

  if (!aluno) notFound();

  const { data: weightLogs } = await supabase
    .from("weight_logs")
    .select("logged_at, weight")
    .eq("profile_id", alunoId)
    .order("logged_at", { ascending: true });

  const { data: templates } = await supabase
    .from("workout_templates")
    .select("*")
    .eq("personal_id", user.id)
    .order("created_at", { ascending: false });

  const first = weightLogs?.[0]?.weight ?? null;
  const latest = weightLogs?.[weightLogs.length - 1]?.weight ?? aluno.current_weight;
  const totalChange = first != null && latest != null ? +(latest - first).toFixed(1) : null;

  return (
    <div className="app-shell">
      <Sidebar
        variant="personal"
        accountName={`${personalProfile?.name ?? "Personal"} · Personal`}
        sections={PERSONAL_SIDEBAR_SECTIONS}
      />
      <main className="main-content">
      <div className="fx-app">
        <div className="fx-top">
          <div className="eyebrow">Projeto Fênix · Relatório de evolução</div>
          <h1>{aluno.name || "Aluno sem nome"}</h1>
          <div className="sub">{aluno.goal ? GOAL_LABELS[aluno.goal] : "Objetivo não definido"}</div>
        </div>

        <div className="summary-grid">
          <div className="sum-card">
            <div className="label">Peso atual</div>
            <div className="value">
              {latest != null ? latest : "—"}
              <span className="unit"> kg</span>
            </div>
          </div>
          <div className="sum-card">
            <div className="label">Meta</div>
            <div className="value">
              {aluno.target_weight != null ? aluno.target_weight : "—"}
              <span className="unit"> kg</span>
            </div>
          </div>
          <div className="sum-card">
            <div className="label">Variação total</div>
            <div className="value" style={{ fontSize: 20 }}>
              {totalChange != null ? `${totalChange > 0 ? "+" : ""}${totalChange} kg` : "—"}
            </div>
          </div>
          <div className="sum-card">
            <div className="label">Treino atual</div>
            <div className="value" style={{ fontSize: 16 }}>
              {aluno.current_tier ? TIER_LABELS[aluno.current_tier] : "—"}
            </div>
            {aluno.current_tier && aluno.current_split && (
              <div className="sub" style={{ marginTop: 2, fontSize: 12 }}>
                {SPLIT_OPTIONS[aluno.current_tier]?.find((s) => s.key === aluno.current_split)
                  ?.label ?? aluno.current_split}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2>Aplicar modelo de treino</h2>
          <ApplyTemplate alunoId={aluno.id} templates={templates ?? []} />
        </div>

        <div className="card">
          <h2>Evolução do peso</h2>
          <WeightChart data={weightLogs ?? []} target={aluno.target_weight} />
        </div>

        <div className="card">
          <h2>💬 Conversa</h2>
          <ChatThread alunoId={aluno.id} personalId={user.id} senderRole="personal" />
        </div>
      </div>
      </main>
    </div>
  );
}
