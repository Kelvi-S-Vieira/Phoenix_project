"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/database.types";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role | "">("");
  const [name, setName] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!role) {
      setError("Escolha se você é aluno ou personal.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Validate a typed invite code BEFORE creating the account — an
    // unrecognized code must stop signup with an error, not silently create
    // an unlinked account. An empty code is fine (link later).
    const trimmedCode = inviteCode.trim();
    if (role === "aluno" && trimmedCode) {
      const { data: personal, error: lookupError } = await supabase
        .from("personal_lookup")
        .select("id")
        .eq("code", trimmedCode.toUpperCase())
        .maybeSingle();
      if (lookupError) {
        setLoading(false);
        setError(lookupError.message);
        return;
      }
      if (!personal) {
        setLoading(false);
        setError("Código não encontrado");
        return;
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          name: name || null,
          invite_code: role === "aluno" ? inviteCode || null : null,
        },
      },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      // Email confirmation is off for this project — signed in immediately.
      router.push("/");
      router.refresh();
      return;
    }

    // Email confirmation is required — the profiles row was still filled in
    // by the handle_new_user trigger, using the metadata above, so there is
    // nothing left to do once they confirm and log in.
    setNotice(
      "Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar."
    );
  }

  async function handleGoogle() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="fx-auth-gate">
      <div className="fx-auth-box">
        <div className="fx-auth-brand">
          <div className="brand-eyebrow">Projeto Fênix</div>
          <div className="brand-title">Criar conta</div>
        </div>

        <div className="fx-auth-card">
          {notice ? (
            <div className="fx-auth-hint" style={{ textAlign: "center" }}>{notice}</div>
          ) : (
            <>
              <button className="fx-google-btn" type="button" onClick={handleGoogle}>
                Continuar com Google
              </button>

              <div className="fx-auth-divider"><span>ou</span></div>

              <form onSubmit={handleSubmit}>
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

                <div className="fx-auth-field">
                  <label>E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="fx-auth-field">
                  <label>Senha</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                {error && <div className="fx-auth-error show">{error}</div>}

                <button className="fx-auth-submit" type="submit" disabled={loading}>
                  {loading ? "Criando conta..." : "Criar conta e entrar"}
                </button>
              </form>
            </>
          )}

          <div className="fx-auth-switcher">
            Já tem conta? <Link href="/login">Entrar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
