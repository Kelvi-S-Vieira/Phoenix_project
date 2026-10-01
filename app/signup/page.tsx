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
    <div className="fx-auth-wrap">
      <div className="fx-auth-card">
        <div className="fx-top" style={{ textAlign: "center" }}>
          <div className="eyebrow">🔥 Projeto Fênix</div>
          <h1>Criar conta</h1>
          <div className="sub">O plano começa por entender pra onde você quer ir.</div>
        </div>

        <div className="card">
          {error && <div className="form-error">{error}</div>}
          {notice && <div className="form-success">{notice}</div>}

          {!notice && (
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

              <div className="field">
                <label>E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="field">
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

              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Criando conta..." : "Criar conta"}
              </button>
            </form>
          )}

          {!notice && (
            <>
              <div className="fx-divider">ou</div>
              <button className="btn google" type="button" onClick={handleGoogle}>
                Continuar com Google
              </button>
            </>
          )}
        </div>

        <div className="fx-auth-links">
          Já tem conta? <Link href="/login">Entrar</Link>
        </div>
      </div>
    </div>
  );
}
