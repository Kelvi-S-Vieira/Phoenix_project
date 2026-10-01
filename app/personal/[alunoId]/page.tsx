import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import WeightChart from "@/components/WeightChart";
import ChatThread from "@/components/ChatThread";
import { GOAL_LABELS, TIER_LABELS } from "@/lib/fenix-domain";

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

  const first = weightLogs?.[0]?.weight ?? null;
  const latest = weightLogs?.[weightLogs.length - 1]?.weight ?? aluno.current_weight;
  const totalChange = first != null && latest != null ? +(latest - first).toFixed(1) : null;

  return (
    <>
      <TopBar
        title={aluno.name || "Aluno"}
        nav={[{ href: "/personal", label: "← Meus alunos" }]}
      />
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
          </div>
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
    </>
  );
}
