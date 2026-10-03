"use client";

import { useState } from "react";

// Downloads the current user's data as a JSON file via GET /api/export-data.
// Replaces the prototype's localStorage-dump backup (Task 4) now that data
// lives in Supabase — see that route for what's included. Import was
// intentionally not ported (see the route's comment).
export default function ExportDataButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/export-data");
      if (!res.ok) throw new Error("Falha ao exportar dados.");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "projeto-fenix-backup.json";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Não foi possível baixar o backup agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="btn ghost" type="button" onClick={handleExport} disabled={loading}>
        {loading ? "Gerando..." : "⬇ Exportar tudo (backup .json)"}
      </button>
      {error && <div className="form-error">{error}</div>}
      <div className="fx-account-hint">
        Backup com seus dados salvos no Projeto Fênix (peso, medidas, cargas, cardio, conquistas,
        perfil...).
      </div>
    </>
  );
}
