import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import VincularPersonalForm from "./VincularPersonalForm";

export default async function VincularPersonalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, linked_personal_id")
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
    <>
      <TopBar
        title="Vincular ao personal"
        nav={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/medidas", label: "Medidas" },
          { href: "/treino", label: "Treino" },
          { href: "/fotos", label: "Fotos" },
        ]}
      />
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
    </>
  );
}
