"use client";

import { useState } from "react";
import UploadPhoto from "./UploadPhoto";
import Gallery from "./Gallery";
import Compare from "./Compare";
import type { FotoWithUrl } from "./page";
import type { WeightUnit } from "@/lib/weight-unit";

type View = "gallery" | "compare";

export default function FotosTabs({
  profileId,
  fotos,
  unit = "kg",
}: {
  profileId: string;
  fotos: FotoWithUrl[];
  unit?: WeightUnit;
}) {
  const [view, setView] = useState<View>("gallery");

  return (
    <>
      <div className="fx-tabs">
        <button
          type="button"
          className={"fx-tab-btn" + (view === "gallery" ? " active" : "")}
          onClick={() => setView("gallery")}
        >
          Galeria
        </button>
        <button
          type="button"
          className={"fx-tab-btn" + (view === "compare" ? " active" : "")}
          onClick={() => setView("compare")}
        >
          Comparar
        </button>
      </div>

      {view === "gallery" ? (
        <>
          <div className="card">
            <h2>Adicionar foto</h2>
            <UploadPhoto profileId={profileId} unit={unit} />
          </div>
          <div className="card">
            <h2>Galeria</h2>
            <Gallery fotos={fotos} unit={unit} />
          </div>
        </>
      ) : (
        <div className="card">
          <h2>Antes / Depois</h2>
          <Compare fotos={fotos} unit={unit} />
        </div>
      )}
    </>
  );
}
