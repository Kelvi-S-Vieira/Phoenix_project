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
    <div className="fx-auth-wrap">
      <div className="fx-auth-card">
        <div className="fx-top" style={{ textAlign: "center" }}>
          <div className="eyebrow">🔥 Projeto Fênix</div>
          <h1>Esqueci minha senha</h1>
          <div className="sub">Vamos enviar um link de redefinição pro seu e-mail.</div>
        </div>

        <div className="card">
          {error && <div className="form-error">{error}</div>}
          {sent ? (
            <div className="form-success">
              Se esse e-mail existir na nossa base, você vai receber um link
              para redefinir a senha em instantes.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
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
              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar link de redefinição"}
              </button>
            </form>
          )}
        </div>

        <div className="fx-auth-links">
          <Link href="/login">Voltar para o login</Link>
        </div>
      </div>
    </div>
  );
}
