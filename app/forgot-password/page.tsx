"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="fx-auth-gate">
      <div className="fx-auth-box">
        <div className="fx-auth-brand">
          <div className="brand-eyebrow">Projeto Fênix</div>
          <div className="brand-title">Esqueci minha senha</div>
        </div>

        <div className="fx-auth-card">
          {sent ? (
            <div className="fx-auth-hint" style={{ textAlign: "center" }}>
              Se esse e-mail existir na nossa base, você vai receber um link
              para redefinir a senha em instantes.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="fx-auth-hint">Vamos enviar um link de redefinição pro seu e-mail.</div>
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

              {error && <div className="fx-auth-error show">{error}</div>}

              <button className="fx-auth-submit" type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar link de redefinição"}
              </button>
            </form>
          )}

          <div className="fx-auth-switcher">
            <Link href="/login">Voltar para o login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
