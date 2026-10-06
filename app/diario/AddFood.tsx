"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FOOD_DB, type FoodDbItem } from "@/lib/food-database";
import type { Meal } from "@/lib/database.types";
import AiEstimateReview, {
  type AiDishResponse,
  type ReviewMealKey,
  type ReviewSaveRow,
} from "./AiEstimateReview";

const MEALS: { key: Meal; label: string }[] = [
  { key: "cafe", label: "Café da manhã" },
  { key: "almoco", label: "Almoço" },
  { key: "lanche", label: "Lanche" },
  { key: "jantar", label: "Jantar" },
  { key: "ceia", label: "Ceia" },
  { key: "extra", label: "Extra" },
];

type Mode = "db" | "manual" | "foto" | "texto" | "barcode";

// Server-side AI estimation (app/api/diario/estimar) backing the two new
// "Foto (IA)"/"Descrever (IA)" modes added 2026-10-04 per MIGRATION_PLAN.md's
// P2 decisions — photo/text estimation via the app's own AI, voice input via
// the browser's native Web Speech API (no third-party food-vision or paid
// cloud transcription service). Both modes share one review list
// (AiEstimateReview) and one insert path below.
const MAX_PHOTO_DIMENSION = 1024;
const PHOTO_JPEG_QUALITY = 0.82;

type EstimarPayload =
  | { mode: "foto"; imageBase64: string; mediaType: string }
  | { mode: "texto"; description: string };

// Minimal typings for the (Chromium-only) Barcode Detection API.
interface BarcodeDetectorLike {
  detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
}
type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => BarcodeDetectorLike;

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
  defaultMeal,
}: {
  profileId: string;
  selectedDate: string;
  /** Refeição pré-selecionada ao montar (padrão: café da manhã). */
  defaultMeal?: Meal;
}) {
  const router = useRouter();
  const [activeMeal, setActiveMeal] = useState<Meal>(defaultMeal ?? "cafe");

  // Botões "+" por refeição (EntriesList) disparam este evento: seleciona a
  // refeição e leva o foco/rolagem até o formulário (#adicionar).
  useEffect(() => {
    function onPick(ev: Event) {
      const meal = (ev as CustomEvent<Meal>).detail;
      if (!MEALS.some((m) => m.key === meal)) return;
      setActiveMeal(meal);
      const card = document.getElementById("adicionar");
      card?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        card?.querySelector<HTMLElement>("input, textarea")?.focus({ preventScroll: true });
      }, 350);
    }
    window.addEventListener("fx-add-meal", onPick);
    return () => window.removeEventListener("fx-add-meal", onPick);
  }, []);
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

  // --- Shared review state (foto + texto + barcode modes) ---
  // The review sheet (AiEstimateReview) is the same for all three; only the
  // origin of the dish differs. `aiRequestRef` keeps the original photo/text so
  // "Corrigir" can resend it together with the user's correction.
  const [aiDish, setAiDish] = useState<AiDishResponse | null>(null);
  const [aiSource, setAiSource] = useState<"photo" | "text" | "barcode" | null>(null);
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiRequestRef = useRef<EstimarPayload | null>(null);

  function resetReview() {
    setAiDish(null);
    setAiSource(null);
    setAiImageUrl(null);
    setAiError(null);
    aiRequestRef.current = null;
  }

  function changeMode(next: Mode) {
    if (next !== mode) {
      resetReview();
      setBarcodeMsg(null);
      setBarcodeNotFound(false);
      setScanning(false);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setError(null);
    }
    setMode(next);
  }

  const AI_FAIL_MSG =
    "Não foi possível estimar a refeição agora. Tente novamente ou use \"Digitar manualmente\".";

  async function postEstimar(
    payload: EstimarPayload & { correction?: string; previous?: AiDishResponse }
  ): Promise<{ dish: AiDishResponse } | { error: string }> {
    try {
      const res = await fetch("/api/diario/estimar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 503 && data?.error === "missing_api_key") {
          return {
            error: "Recurso de IA ainda não configurado — peça para o administrador configurar.",
          };
        }
        return { error: AI_FAIL_MSG };
      }
      return { dish: data as AiDishResponse };
    } catch {
      return { error: AI_FAIL_MSG };
    }
  }

  async function callEstimar(payload: EstimarPayload, source: "photo" | "text", imageUrl: string | null) {
    setAiLoading(true);
    setAiError(null);
    setAiDish(null);
    const result = await postEstimar(payload);
    setAiLoading(false);
    if ("error" in result) {
      setAiError(result.error);
      return;
    }
    if (result.dish.items.length === 0) {
      setAiError("Nenhum alimento identificado. Tente outra foto/descrição ou use \"Digitar manualmente\".");
      return;
    }
    aiRequestRef.current = payload;
    setAiSource(source);
    setAiImageUrl(imageUrl);
    setAiDish(result.dish);
  }

  async function handleCorrect(correction: string, current: AiDishResponse): Promise<AiDishResponse | null> {
    const base = aiRequestRef.current;
    if (!base) return null;
    const result = await postEstimar({ ...base, correction, previous: current });
    if ("error" in result || result.dish.items.length === 0) return null;
    return result.dish;
  }

  // "Ceia" agora é uma refeição própria do diário (migration_diary_meal_ceia.sql).
  async function handleSaveReview(meal: ReviewMealKey, rows: ReviewSaveRow[]) {
    if (!aiSource || rows.length === 0) return;
    // Barcode products have no dedicated source value in the schema; they come
    // from a food database (Open Food Facts), so they are stored as "db".
    const source = aiSource === "photo" ? "ai_photo" : aiSource === "text" ? "ai_text" : "db";
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("diary_entries").insert(
      rows.map((r) => ({
        profile_id: profileId,
        logged_at: selectedDate,
        meal: meal as Meal,
        food_name: r.food_name,
        quantity: r.quantity,
        unit: r.unit,
        kcal: r.kcal,
        protein: r.protein,
        carb: r.carb,
        fat: r.fat,
        source,
      }))
    );
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    resetReview();
    setBarcode("");
    setBarcodeMsg(null);
    router.refresh();
  }

  function renderReview(expected: "photo" | "text" | "barcode") {
    if (!aiDish || aiSource !== expected) return null;
    return (
      <div style={{ marginTop: 14 }}>
        <AiEstimateReview
          // Remount for each new analysis so internal edit state starts fresh.
          key={`${aiSource}-${aiDish.dish_name}-${aiDish.items.length}-${aiDish.items[0]?.grams}`}
          dish={aiDish}
          imageUrl={aiImageUrl}
          source={aiSource}
          onSave={handleSaveReview}
          onCorrect={aiSource === "barcode" ? undefined : handleCorrect}
          onDiscard={resetReview}
          saving={saving}
        />
      </div>
    );
  }

  // --- Código de barras mode ---
  // Looks the EAN up on Open Food Facts straight from the browser (CORS is
  // allowed), converts to per-100 g values + package weight and opens the SAME
  // review sheet with a single packaged ingredient.
  const [barcode, setBarcode] = useState("");
  const [barcodeMsg, setBarcodeMsg] = useState<string | null>(null);
  const [barcodeNotFound, setBarcodeNotFound] = useState(false);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onCodeRef = useRef<(code: string) => void>(() => {});

  const detectorCtor =
    typeof window !== "undefined"
      ? (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector
      : undefined;
  const canScan =
    !!detectorCtor && typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  async function lookupBarcode(rawCode: string) {
    const ean = rawCode.replace(/\D/g, "");
    if (ean.length < 8) {
      setBarcodeMsg("Digite um código de barras válido (8 a 14 números).");
      setBarcodeNotFound(false);
      return;
    }
    setBarcodeLoading(true);
    setBarcodeMsg(null);
    setBarcodeNotFound(false);
    resetReview();
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${ean}.json?fields=product_name,brands,quantity,serving_quantity,nutriments`
      );
      const data = await res.json();
      const product = data?.status === 1 || data?.product ? data.product : null;
      const dish = product ? offProductToDish(product) : null;
      if (!dish) {
        setBarcodeNotFound(true);
        setBarcodeMsg(
          "Não encontramos esse produto (ou ele não tem informação nutricional) na base Open Food Facts."
        );
        return;
      }
      setBarcode(ean);
      setAiSource("barcode");
      setAiImageUrl(null);
      setAiDish(dish);
    } catch {
      setBarcodeMsg("Não foi possível consultar o produto agora. Verifique sua conexão e tente novamente.");
    } finally {
      setBarcodeLoading(false);
    }
  }

  useEffect(() => {
    onCodeRef.current = (code) => {
      void lookupBarcode(code);
    };
  });

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function startScan() {
    if (!canScan) return;
    setScanError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setScanning(true);
    } catch {
      setScanError("Não foi possível acessar a câmera. Digite o código manualmente abaixo.");
    }
  }

  // Attach the stream to the <video> and poll the detector while scanning.
  useEffect(() => {
    if (!scanning || !detectorCtor) return;
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    void video.play().catch(() => {});
    const detector = new detectorCtor({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });
    let busy = false;
    const timer = window.setInterval(async () => {
      if (busy || video.readyState < 2) return;
      busy = true;
      try {
        const codes = await detector.detect(video);
        if (codes.length > 0) {
          window.clearInterval(timer);
          setScanning(false);
          stopStream();
          onCodeRef.current(codes[0].rawValue);
        }
      } catch {
        // transient detection failure: keep polling
      } finally {
        busy = false;
      }
    }, 350);
    return () => {
      window.clearInterval(timer);
      video.srcObject = null;
    };
  }, [scanning, detectorCtor]);

  // The camera is released in changeMode() when leaving this mode, and here on unmount.
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    []
  );

  // --- Foto mode ---
  const fotoInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoSelected(file: File) {
    try {
      const dataUrl = await downscaleImageToJpeg(file, MAX_PHOTO_DIMENSION, PHOTO_JPEG_QUALITY);
      const imageBase64 = dataUrl.split(",")[1] ?? "";
      await callEstimar({ mode: "foto", imageBase64, mediaType: "image/jpeg" }, "photo", dataUrl);
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
    await callEstimar({ mode: "texto", description }, "text", null);
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
          onClick={() => changeMode("db")}
        >
          Buscar na lista
        </div>
        <div
          className={"mode-btn" + (mode === "manual" ? " active" : "")}
          onClick={() => changeMode("manual")}
        >
          Digitar manualmente
        </div>
        <div
          className={"mode-btn" + (mode === "foto" ? " active" : "")}
          onClick={() => changeMode("foto")}
        >
          Foto (IA)
        </div>
        <div
          className={"mode-btn" + (mode === "texto" ? " active" : "")}
          onClick={() => changeMode("texto")}
        >
          Descrever (IA)
        </div>
        <div
          className={"mode-btn" + (mode === "barcode" ? " active" : "")}
          onClick={() => changeMode("barcode")}
        >
          Código de barras
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

          {renderReview("photo")}
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

          {renderReview("text")}
        </div>
      )}

      {mode === "barcode" && (
        <div>
          {canScan ? (
            scanning ? (
              <div className="fx-aifc-scan">
                <video ref={videoRef} playsInline muted />
                <div className="fx-aifc-scan-frame" />
                <button
                  type="button"
                  className="btn secondary small"
                  onClick={() => {
                    setScanning(false);
                    stopStream();
                  }}
                >
                  Cancelar leitura
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn secondary"
                style={{ marginBottom: 12 }}
                onClick={startScan}
                disabled={barcodeLoading}
              >
                📷 Ler código de barras com a câmera
              </button>
            )
          ) : (
            <div className="fx-aifc-hint">
              Leitura pela câmera não disponível neste navegador — digite o número do código de barras.
            </div>
          )}
          {scanError && <div className="fx-aifc-error">{scanError}</div>}

          <div className="field">
            <label>Código de barras (EAN)</label>
            <div className="fx-aifc-ean">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ex: 7891000100103"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void lookupBarcode(barcode);
                }}
              />
              <button
                type="button"
                className="btn"
                disabled={barcodeLoading || barcode.replace(/\D/g, "").length < 8}
                onClick={() => lookupBarcode(barcode)}
              >
                {barcodeLoading ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </div>

          {barcodeMsg && <div className="fx-aifc-error">{barcodeMsg}</div>}
          {barcodeNotFound && (
            <button type="button" className="btn secondary small" onClick={() => changeMode("manual")}>
              Digitar manualmente
            </button>
          )}

          {renderReview("barcode")}
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

interface OffNutriments {
  [key: string]: unknown;
}
interface OffProduct {
  product_name?: string;
  brands?: string;
  quantity?: string;
  serving_quantity?: number | string;
  nutriments?: OffNutriments;
}

function offNum(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// Package weight in grams: serving_quantity when present, otherwise parsed
// from the free-text `quantity` ("170 g", "1,5 kg", "500 ml", "6 x 100 g").
// Falls back to 100 g so the per-100 g macros stay editable by the user.
function offPackageGrams(p: OffProduct): number {
  const serving = offNum(p.serving_quantity);
  if (serving && serving > 0) return Math.min(3000, serving);
  const q = (p.quantity ?? "").toLowerCase().replace(",", ".");
  const multi = q.match(/(\d+)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(kg|g|ml|l|cl)\b/);
  const single = q.match(/(\d+(?:\.\d+)?)\s*(kg|g|ml|l|cl)\b/);
  const mult = multi ? parseInt(multi[1], 10) : 1;
  const m = multi ?? single;
  if (m) {
    const value = parseFloat(multi ? m[2] : m[1]);
    const unit = multi ? m[3] : m[2];
    const factor = unit === "kg" || unit === "l" ? 1000 : unit === "cl" ? 10 : 1;
    const grams = value * factor * mult;
    if (grams > 0) return Math.min(3000, Math.round(grams));
  }
  return 100;
}

function offProductToDish(p: OffProduct): AiDishResponse | null {
  const n = p.nutriments ?? {};
  let kcal = offNum(n["energy-kcal_100g"]);
  if (kcal === null) {
    const kj = offNum(n["energy_100g"]);
    kcal = kj !== null ? kj / 4.184 : null;
  }
  const protein = offNum(n["proteins_100g"]);
  const carb = offNum(n["carbohydrates_100g"]);
  const fat = offNum(n["fat_100g"]);
  if (kcal === null && protein === null && carb === null && fat === null) return null;
  const name = (p.product_name ?? "").trim() || "Produto sem nome";
  const brand = (p.brands ?? "").split(",")[0]?.trim();
  const full = brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${name} ${brand}` : name;
  return {
    dish_name: full,
    description: "",
    health_score: 0,
    meal_type_guess: null,
    items: [
      {
        name: full,
        grams: offPackageGrams(p),
        kcal_per_100g: round1(kcal ?? 4 * (protein ?? 0) + 4 * (carb ?? 0) + 9 * (fat ?? 0)),
        protein_per_100g: round1(protein ?? 0),
        carb_per_100g: round1(carb ?? 0),
        fat_per_100g: round1(fat ?? 0),
        is_packaged_product: true,
        source_note: "Open Food Facts",
      },
    ],
  };
}
