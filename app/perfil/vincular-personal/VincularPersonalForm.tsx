"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function VincularPersonalForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Informe um código de convite.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();
    const { data, error: rpcError } = await supabase
      .rpc("redeem_invite_code", { p_code: trimmed })
      .single();

    setSaving(false);
    if (rpcError) {
      setError(
        rpcError.message === "code_not_found"
          ? "Código não encontrado"
          : rpcError.message
      );
      return;
    }

    setSuccess(`Vinculado a ${data?.personal_name ?? "seu personal"}!`);
    setCode("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="row2" style={{ alignItems: "end" }}>
      <div className="field" style={{ marginBottom: 0 }}>
        <label>Código de convite</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ex: A3F9K2"
          maxLength={6}
        />
      </div>
      <button className="btn" type="submit" disabled={saving}>
        {saving ? "Vinculando..." : "Vincular"}
      </button>
      {error && (
        <div className="form-error" style={{ gridColumn: "1 / -1" }}>
          {error}
        </div>
      )}
      {success && (
        <div className="form-success" style={{ gridColumn: "1 / -1" }}>
          {success}
        </div>
      )}
    </form>
  );
}
