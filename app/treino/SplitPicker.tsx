"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SPLITS, type SplitKey } from "@/lib/treino-basico-data";

export default function SplitPicker({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const options = Object.entries(SPLITS) as [SplitKey, (typeof SPLITS)[SplitKey]][];

  async function choose(splitKey: SplitKey) {
    setSaving(splitKey);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ current_split: splitKey })
      .eq("id", profileId);
    setSaving(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <p className="sub" style={{ marginBottom: 12 }}>
        Escolha sua frequência semanal para começar.
      </p>
      <div className="choice-grid">
        {options.map(([key, split]) => (
          <div
            key={key}
            className="choice-card"
            onClick={() => choose(key)}
            role="button"
          >
            <div className="cc-title">{split.label}</div>
            <div className="cc-desc">{split.desc}</div>
          </div>
        ))}
      </div>
      {saving && <div className="sub" style={{ marginTop: 10 }}>Salvando...</div>}
      {error && <div className="form-error" style={{ marginTop: 10 }}>{error}</div>}
    </div>
  );
}
