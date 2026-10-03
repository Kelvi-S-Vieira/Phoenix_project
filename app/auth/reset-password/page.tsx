"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Reached via the link in the "esqueci minha senha" email. Supabase's
// redirect includes a recovery token in the URL hash, which the browser
// client picks up automatically and turns into a logged-in recovery
// session — `updateUser` then sets the new password on that session.
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/"), 1500);
  }

  return (
    <div className="fx-auth-gate">
      <div className="fx-auth-box">
        <div className="fx-auth-brand">
          <div className="brand-eyebrow">Projeto Fênix</div>
          <div className="brand-title">Nova senha</div>
        </div>
        <div className="fx-auth-card">
          {done ? (
            <div className="fx-auth-hint" style={{ textAlign: "center" }}>
              Senha atualizada! Redirecionando...
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="fx-auth-field">
                <label>Nova senha</label>
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
                {loading ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
