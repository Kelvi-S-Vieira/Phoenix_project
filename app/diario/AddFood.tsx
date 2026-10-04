"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FOOD_DB, type FoodDbItem } from "@/lib/food-database";
import type { Meal } from "@/lib/database.types";
import AiEstimateReview, { makeReviewItems, type AiReviewItem } from "./AiEstimateReview";

const MEALS: { key: Meal; label: string }[] = [
  { key: "cafe", label: "Café da manhã" },
  { key: "almoco", label: "Almoço" },
  { key: "lanche", label: "Lanche" },
  { key: "jantar", label: "Jantar" },
  { key: "extra", label: "Extra" },
];

type Mode = "db" | "manual" | "foto" | "texto";

// Server-side AI estimation (app/api/diario/estimar) backing the two new
// "Foto (IA)"/"Descrever (IA)" modes added 2026-10-04 per MIGRATION_PLAN.md's
// P2 decisions — photo/text estimation via the app's own AI, voice input via
// the browser's native Web Speech API (no third-party food-vision or paid
// cloud transcription service). Both modes share one review list
// (AiEstimateReview) and one insert path below.
const MAX_PHOTO_DIMENSION = 1024;
const PHOTO_JPEG_QUALITY = 0.82;

interface SpeechRecognitionResultLike {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionResultLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

// Ported from the prototype's "Adicionar alimento" card (meal tabs + mode
// toggle + food-search/manual flows, projeto_fenix_app_final.html,
// ~lines 3867-3892 markup, ~lines 17580-17704 logic). Unlike the prototype
// (one shared module-level `activeMeal`/`selectedFood`), everything here is
// local component state, and both add paths insert into `diary_entries`
// then `router.refresh()` the Server Component page instead of re-rendering
// the entries list by hand.
export default function AddFood({
  profileId,
  selectedDate,
}: {
  profileId: string;
  selectedDate: string;
}) {
  const router = useRouter();
  const [activeMeal, setActiveMeal] = useState<Meal>("cafe");
  const [mode, setMode] = useState<Mode>("db");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- DB search mode ---
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodDbItem | null>(null);
  const [qty, setQty] = useState<string>("");
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const matches =
    query.trim().length > 0
      ? FOOD_DB.filter((f) => f.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
      : [];

  function selectFood(food: FoodDbItem) {
    setSelectedFood(food);
    setQuery("");
    setDropdownOpen(false);
    setQty(food.unit === "g" ? "100" : "1");
  }

  function clearSelectedFood() {
    setSelectedFood(null);
    setQty("");
  }

  const qtyNum = parseFloat(qty) || 0;
  const factor = selectedFood ? qtyNum / selectedFood.per : 0;
  const preview = selectedFood
    ? {
        kcal: Math.round(selectedFood.kcal * factor),
        protein: round1(selectedFood.protein * factor),
        carb: round1(selectedFood.carb * factor),
        fat: round1(selectedFood.fat * factor),
      }
    : null;

  async function handleAddDb() {
    if (!selectedFood) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("diary_entries").insert({
      profile_id: profileId,
      logged_at: selectedDate,
      meal: activeMeal,
      food_name: selectedFood.name,
      quantity: qtyNum,
      unit: selectedFood.unit,
      kcal: Math.round(selectedFood.kcal * factor),
      protein: round1(selectedFood.protein * factor),
      carb: round1(selectedFood.carb * factor),
      fat: round1(selectedFood.fat * factor),
      source: "db",
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    clearSelectedFood();
    router.refresh();
  }

  // --- Manual mode ---
  const [manName, setManName] = useState("");
  const [manKcal, setManKcal] = useState("");
  const [manProtein, setManProtein] = useState("");
  const [manCarb, setManCarb] = useState("");
  const [manFat, setManFat] = useState("");

  async function handleAddManual() {
    const name = manName.trim();
    const kcal = parseFloat(manKcal);
    if (!name || isNaN(kcal)) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("diary_entries").insert({
      profile_id: profileId,
      logged_at: selectedDate,
      meal: activeMeal,
      food_name: name,
      quantity: null,
      unit: null,
      kcal: Math.round(kcal),
      protein: parseFloat(manProtein) || 0,
      carb: parseFloat(manCarb) || 0,
      fat: parseFloat(manFat) || 0,
      source: "manual",
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setManName("");
    setManKcal("");
    setManProtein("");
    setManCarb("");
    setManFat("");
    router.refresh();
  }

  // --- Shared AI review state (foto + texto modes) ---
  const [aiItems, setAiItems] = useState<AiReviewItem[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  async function callEstimar(
    payload: { mode: "foto"; imageBase64: string; mediaType: string } | { mode: "texto"; description: string }
  ) {
    setAiLoading(true);
    setAiError(null);
    setAiItems([]);
    try {
      const res = await fetch("/api/diario/estimar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 503 && data?.error === "missing_api_key") {
          setAiError(
            "Recurso de IA ainda não configurado — peça para o administrador configurar."
          );
        } else {
          setAiError("Não foi possível estimar a refeição agora. Tente novamente ou use \"Digitar manualmente\".");
        }
        return;
      }
      setAiItems(makeReviewItems(data.items ?? []));
    } catch {
      setAiError("Não foi possível estimar a refeição agora. Tente novamente ou use \"Digitar manualmente\".");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleAddAiItems(source: "ai_photo" | "ai_text") {
    const toInsert = aiItems.filter((it) => it.included);
    if (toInsert.length === 0) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("diary_entries").insert(
      toInsert.map((it) => ({
        profile_id: profileId,
        logged_at: selectedDate,
        meal: activeMeal,
        food_name: it.name.trim() || "Item sem nome",
        quantity: null,
        unit: null,
        kcal: Math.round(parseFloat(it.kcal) || 0),
        protein: parseFloat(it.protein) || 0,
        carb: parseFloat(it.carb) || 0,
        fat: parseFloat(it.fat) || 0,
        source,
      }))
    );
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setAiItems([]);
    setAiError(null);
    router.refresh();
  }

  // --- Foto mode ---
  const fotoInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoSelected(file: File) {
    try {
      const dataUrl = await downscaleImageToJpeg(file, MAX_PHOTO_DIMENSION, PHOTO_JPEG_QUALITY);
      const imageBase64 = dataUrl.split(",")[1] ?? "";
      await callEstimar({ mode: "foto", imageBase64, mediaType: "image/jpeg" });
    } catch {
      setAiError("Não foi possível processar a foto. Tente outra foto ou use \"Digitar manualmente\".");
    }
  }

  // --- Texto mode ---
  const [textDesc, setTextDesc] = useState("");
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const SpeechRecognitionCtor =
    typeof window !== "undefined"
      ? (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ??
        (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition
      : undefined;

  function toggleRecording() {
    if (!SpeechRecognitionCtor) return;
    if (recording) {
      recognitionRef.current?.stop();
      return;
    }
    // Text already in the textarea when recording starts is kept, and the
    // recognized speech is appended after it (with a separating space),
    // re-sent in full on every onresult event since interimResults keeps
    // revising the same utterance until it's final.
    const baseText = textDesc.trim();
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setTextDesc(baseText ? `${baseText} ${transcript}` : transcript);
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);
    recognitionRef.current = recognition;
    setRecording(true);
    recognition.start();
  }

  async function handleEstimateText() {
    const description = textDesc.trim();
    if (!description) return;
    await callEstimar({ mode: "texto", description });
  }

  return (
    <div>
      <div className="meal-tabs">
        {MEALS.map((m) => (
          <div
            key={m.key}
            className={"meal-tab" + (m.key === activeMeal ? " active" : "")}
            onClick={() => setActiveMeal(m.key)}
          >
            {m.label}
          </div>
        ))}
      </div>

      <div className="entry-mode">
        <div
          className={"mode-btn" + (mode === "db" ? " active" : "")}
          onClick={() => setMode("db")}
        >
          Buscar na lista
        </div>
        <div
          className={"mode-btn" + (mode === "manual" ? " active" : "")}
          onClick={() => setMode("manual")}
        >
          Digitar manualmente
        </div>
        <div
          className={"mode-btn" + (mode === "foto" ? " active" : "")}
          onClick={() => setMode("foto")}
        >
          Foto (IA)
        </div>
        <div
          className={"mode-btn" + (mode === "texto" ? " active" : "")}
          onClick={() => setMode("texto")}
        >
          Descrever (IA)
        </div>
      </div>

      {error && (
        <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</div>
      )}

      {mode === "db" && (
        <div>
          <div className="food-search" ref={searchWrapRef}>
            <input
              type="text"
              placeholder="Buscar alimento (ex: frango, arroz, banana...)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setDropdownOpen(e.target.value.trim().length > 0);
              }}
              onFocus={() => setDropdownOpen(query.trim().length > 0)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            />
            <div className={"food-dropdown" + (dropdownOpen && matches.length > 0 ? " open" : "")}>
              {matches.map((f) => (
                <div
                  key={f.name}
                  className="food-opt"
                  onMouseDown={() => selectFood(f)}
                >
                  <div>{f.name}</div>
                  <div className="fo-macro">
                    {f.kcal} kcal · {f.protein}g proteína / {f.per}
                    {f.unit === "g" ? "g" : ` ${f.unit}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedFood && (
            <div className="selected-food">
              <div>
                <div className="sf-name">{selectedFood.name}</div>
                <div className="sf-macro">
                  {selectedFood.kcal} kcal / {selectedFood.per}
                  {selectedFood.unit === "g" ? "g" : ` ${selectedFood.unit}`}
                </div>
              </div>
              <button type="button" className="sf-clear" onClick={clearSelectedFood}>
                ×
              </button>
            </div>
          )}

          <div className="row2">
            <div className="field">
              <label>Quantidade</label>
              <input
                type="number"
                step="1"
                placeholder="100"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Unidade</label>
              <select value={selectedFood?.unit ?? ""} disabled>
                {selectedFood && <option value={selectedFood.unit}>{selectedFood.unit}</option>}
              </select>
            </div>
          </div>

          {preview && (
            <div className="computed-preview">
              <span>≈ {preview.kcal} kcal</span>
              <span>P: {preview.protein}g</span>
              <span>C: {preview.carb}g</span>
              <span>G: {preview.fat}g</span>
            </div>
          )}

          <button className="btn" disabled={!selectedFood || saving} onClick={handleAddDb}>
            + Adicionar ao diário
          </button>
        </div>
      )}

      {mode === "manual" && (
        <div>
          <div className="row3">
            <div className="field">
              <label>Nome do alimento</label>
              <input
                type="text"
                placeholder="Ex: Marmita da vovó"
                value={manName}
                onChange={(e) => setManName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Calorias</label>
              <input
                type="number"
                placeholder="kcal"
                value={manKcal}
                onChange={(e) => setManKcal(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Proteína (g)</label>
              <input
                type="number"
                placeholder="g (opcional)"
                value={manProtein}
                onChange={(e) => setManProtein(e.target.value)}
              />
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label>Carboidrato (g)</label>
              <input
                type="number"
                placeholder="g (opcional)"
                value={manCarb}
                onChange={(e) => setManCarb(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Gordura (g)</label>
              <input
                type="number"
                placeholder="g (opcional)"
                value={manFat}
                onChange={(e) => setManFat(e.target.value)}
              />
            </div>
          </div>
          <button
            className="btn"
            disabled={saving || !manName.trim() || manKcal.trim() === ""}
            onClick={handleAddManual}
          >
            + Adicionar ao diário
          </button>
        </div>
      )}

      {mode === "foto" && (
        <div>
          <label className="fx-ai-photo-btn btn secondary">
            {aiLoading ? "Analisando foto..." : "📷 Tirar/escolher foto do prato"}
            <input
              ref={fotoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              disabled={aiLoading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoSelected(file);
                e.target.value = "";
              }}
            />
          </label>

          {aiError && (
            <div style={{ color: "var(--danger)", fontSize: 13, margin: "12px 0" }}>{aiError}</div>
          )}

          {aiItems.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <AiEstimateReview
                items={aiItems}
                onChange={setAiItems}
                onConfirm={() => handleAddAiItems("ai_photo")}
                saving={saving}
              />
            </div>
          )}
        </div>
      )}

      {mode === "texto" && (
        <div>
          <div className="field">
            <label>Descreva a refeição</label>
            <textarea
              rows={3}
              placeholder="Ex: 2 ovos mexidos, uma fatia de pão integral e meio abacate"
              value={textDesc}
              onChange={(e) => setTextDesc(e.target.value)}
              disabled={aiLoading}
            />
          </div>

          <div className="fx-ai-texto-actions">
            {SpeechRecognitionCtor && (
              <button
                type="button"
                className={"btn secondary" + (recording ? " fx-ai-recording" : "")}
                onClick={toggleRecording}
                disabled={aiLoading}
              >
                {recording ? "⏹ Parar" : "🎤 Falar a refeição"}
              </button>
            )}
            <button
              className="btn"
              disabled={aiLoading || !textDesc.trim()}
              onClick={handleEstimateText}
            >
              {aiLoading ? "Estimando..." : "Estimar com IA"}
            </button>
          </div>

          {aiError && (
            <div style={{ color: "var(--danger)", fontSize: 13, margin: "12px 0" }}>{aiError}</div>
          )}

          {aiItems.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <AiEstimateReview
                items={aiItems}
                onChange={setAiItems}
                onConfirm={() => handleAddAiItems("ai_text")}
                saving={saving}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// Downscales/re-encodes a photo to at most `maxDimension`px on its longest
// side, as JPEG, before it's sent to app/api/diario/estimar — keeps the
// request payload small (serverless body-size limits, API cost) regardless
// of how large the original photo is (a modern phone photo can be 10+ MB).
function downscaleImageToJpeg(file: File, maxDimension: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("invalid_image"));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("no_canvas_context"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
