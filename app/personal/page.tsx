import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import { TIER_LABELS } from "@/lib/fenix-domain";

export default async function PersonalRosterPage() {
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
  if (profile.role === "aluno") redirect("/");

  const { data: alunos } = await supabase
    .from("profiles")
    .select("id, name, current_weight, target_weight, current_tier, goal")
    .eq("linked_personal_id", user.id)
    .order("name", { ascending: true });

  return (
    <>
      <TopBar title="Meus alunos" />
      <div className="fx-app">
        <div className="fx-top">
          <div className="eyebrow">Projeto Fênix · Personal</div>
          <h1>Seus alunos</h1>
          <div className="sub">Compartilhe seu código de convite pra ligar novos alunos à sua conta.</div>
        </div>

        <div className="card">
          <h2>Seu código de convite</h2>
          <div className="fx-invite-code">{profile.code ?? "—"}</div>
        </div>

        <div className="card">
          <h2>Roster</h2>
          {!alunos || alunos.length === 0 ? (
            <div className="fx-empty-state">
              Nenhum aluno vinculado ainda. Compartilhe seu código de convite acima.
            </div>
          ) : (
            alunos.map((a) => (
              <Link key={a.id} href={`/personal/${a.id}`} className="fx-roster-item">
                <div>
                  <div className="name">{a.name || "Aluno sem nome"}</div>
                  <div className="meta">
                    {a.current_tier ? TIER_LABELS[a.current_tier] : "Sem treino definido"}
                  </div>
                </div>
                <div className="stat">
                  {a.current_weight != null ? `${a.current_weight} kg` : "—"}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
}
