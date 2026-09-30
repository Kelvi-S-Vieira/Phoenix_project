"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/database.types";
import { generateInviteCode } from "@/lib/fenix-domain";

// Shown after a Google OAuth signup, since the OAuth flow can't carry the
// role/invite-code metadata that the email/password form sends. Also acts
// as a safety net for any account that somehow ended up with role=null.
export default function CompleteProfilePage() {
  const router = useRouter();
  const [role, setRole] = useState<Role | "">("");
  const [name, setName] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!role) {
      setError("Escolha se você é aluno ou personal.");
      return;
    }
    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    let linkedPersonalId: string | null = null;
    if (role === "aluno" && inviteCode.trim()) {
      const { data: personal } = await supabase
        .from("profiles")
        .select("id")
        .eq("code", inviteCode.trim().toUpperCase())
        .maybeSingle();
      if (!personal) {
        setLoading(false);
        setError("Código de convite não encontrado.");
        return;
      }
      linkedPersonalId = personal.id;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        role,
        name: name || null,
        linked_personal_id: linkedPersonalId,
        code: role === "personal" ? generateInviteCode() : null,
      })
      .eq("id", user.id);

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="fx-auth-wrap">
      <div className="fx-auth-card">
        <div className="fx-top" style={{ textAlign: "center" }}>
          <div className="eyebrow">🔥 Projeto Fênix</div>
          <h1>Só mais um passo</h1>
          <div className="sub">Conte pra gente quem é você.</div>
        </div>

        <div className="card">
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Você é...</label>
              <div className="choice-grid cols2">
                <div
                  className={"choice-card" + (role === "aluno" ? " selected" : "")}
                  onClick={() => setRole("aluno")}
                >
                  <div className="cc-title">🏃 Aluno</div>
                  <div className="cc-desc">Quero acompanhar meu treino e evolução</div>
                </div>
                <div
                  className={"choice-card" + (role === "personal" ? " selected" : "")}
                  onClick={() => setRole("personal")}
                >
                  <div className="cc-title">🧑‍🏫 Personal</div>
                  <div className="cc-desc">Acompanho e monto treinos pros meus alunos</div>
                </div>
              </div>
            </div>

            <div className="field">
              <label>Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>

            {role === "aluno" && (
              <div className="field">
                {!showInvite ? (
                  <span
                    className="fx-collapsible-toggle"
                    onClick={() => setShowInvite(true)}
                  >
                    + Tenho um código de convite do meu personal (opcional)
                  </span>
                ) : (
                  <>
                    <label>Código de convite do personal</label>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="Ex: A3F9K2"
                      maxLength={6}
                    />
                  </>
                )}
              </div>
            )}

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Continuar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
