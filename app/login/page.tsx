"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthAccentPicker from "@/components/AuthAccentPicker";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message
      );
      return;
    }
    router.push(redirectTo);
    router.refresh();
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
          <div className="brand-title">Entrar</div>
        </div>

        <AuthAccentPicker />

        <div className="fx-auth-card">
          <form onSubmit={handleSubmit}>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && <div className="fx-auth-error show">{error}</div>}

            <button className="fx-auth-submit" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="fx-auth-hint" style={{ textAlign: "center", marginTop: 10 }}>
            <Link href="/forgot-password">Esqueci minha senha</Link>
          </div>

          <div className="fx-auth-divider"><span>ou</span></div>

          <button className="fx-google-btn" type="button" onClick={handleGoogle}>
            Continuar com Google
          </button>

          <div className="fx-auth-switcher">
            Ainda não tem conta? <Link href="/signup">Criar conta</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
