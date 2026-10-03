import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import { ALUNO_SIDEBAR_SECTIONS } from "@/lib/sidebar-nav";
import VincularPersonalForm from "./VincularPersonalForm";

export default async function VincularPersonalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, linked_personal_id, name, current_weight, target_weight")
    .eq("id", user.id)
    .single();

  if (!profile?.role) redirect("/complete-profile");
  if (profile.role === "personal") redirect("/personal");

  let currentPersonalName: string | null = null;
  if (profile.linked_personal_id) {
    const { data: personal } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", profile.linked_personal_id)
      .single();
    currentPersonalName = personal?.name ?? null;
  }

  return (
    <div className="app-shell">
      <Sidebar
        variant="aluno"
        accountName={`${profile.name ?? "Aluno"} · Aluno`}
        currentWeight={profile.current_weight}
        targetWeight={profile.target_weight}
        sections={ALUNO_SIDEBAR_SECTIONS}
      />
      <main className="main-content">
      <div className="fx-app">
        <div className="card">
          <h2>Código de convite do personal</h2>
          {profile.linked_personal_id ? (
            <div className="sub" style={{ marginBottom: 16 }}>
              Você já está vinculado a{" "}
              <strong>{currentPersonalName ?? "um personal"}</strong>. Informar
              um novo código abaixo troca o vínculo.
            </div>
          ) : (
            <div className="sub" style={{ marginBottom: 16 }}>
              Ainda sem personal vinculado. Peça o código de convite para o seu
              personal e informe abaixo para liberar o acompanhamento e o chat.
            </div>
          )}
          <VincularPersonalForm />
        </div>
      </div>
      </main>
    </div>
  );
}
