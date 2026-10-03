"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/database.types";

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

    // Role/linked_personal_id can no longer be set via a raw client
    // .update() on profiles — this SECURITY DEFINER RPC validates the
    // invite code (if any) server-side and applies both atomically.
    const { error: rpcError } = await supabase.rpc("complete_oauth_profile", {
      p_role: role,
      p_name: name || "",
      p_invite_code: role === "aluno" ? inviteCode.trim() || null : null,
    });

    setLoading(false);
    if (rpcError) {
      setError(
        rpcError.message === "code_not_found"
          ? "Código não encontrado"
          : rpcError.message
      );
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="fx-auth-gate">
      <div className="fx-auth-box">
        <div className="fx-auth-brand">
          <div className="brand-eyebrow">Projeto Fênix</div>
          <div className="brand-title">Só mais um passo</div>
        </div>

        <div className="fx-auth-card">
          <form onSubmit={handleSubmit}>
            <div className="fx-auth-hint">Conte pra gente quem é você.</div>
            <div className="fx-role-grid">
              <div
                className={"fx-role-card" + (role === "aluno" ? " selected" : "")}
                onClick={() => setRole("aluno")}
              >
                <div className="fx-role-icon">🏃</div>
                <div className="fx-role-title">Sou aluno</div>
                <div className="fx-role-desc">Quero acompanhar meu treino e evolução.</div>
              </div>
              <div
                className={"fx-role-card" + (role === "personal" ? " selected" : "")}
                onClick={() => setRole("personal")}
              >
                <div className="fx-role-icon">📋</div>
                <div className="fx-role-title">Sou personal</div>
                <div className="fx-role-desc">Acompanho e monto treinos pros meus alunos.</div>
              </div>
            </div>

            <div className="fx-auth-field">
              <label>Seu nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como podemos te chamar?"
              />
            </div>

            {role === "aluno" && (
              <>
                <div
                  className="fx-auth-optional-toggle"
                  onClick={() => setShowInvite(true)}
                  style={{ display: showInvite ? "none" : "inline-block" }}
                >
                  + Tenho um código de convite do meu personal <span>(opcional)</span>
                </div>
                {showInvite && (
                  <div className="fx-auth-field">
                    <label>Código de convite do personal</label>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="Ex: A3F9K2"
                      maxLength={6}
                    />
                  </div>
                )}
              </>
            )}

            {error && <div className="fx-auth-error show">{error}</div>}

            <button className="fx-auth-submit" type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Continuar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
