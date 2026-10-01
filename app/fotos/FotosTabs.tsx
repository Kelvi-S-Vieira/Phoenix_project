"use client";

import { useState } from "react";
import UploadPhoto from "./UploadPhoto";
import Gallery from "./Gallery";
import Compare from "./Compare";
import type { FotoWithUrl } from "./page";

type View = "gallery" | "compare";

export default function FotosTabs({
  profileId,
  fotos,
}: {
  profileId: string;
  fotos: FotoWithUrl[];
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
            <UploadPhoto profileId={profileId} />
          </div>
          <div className="card">
            <h2>Galeria</h2>
            <Gallery fotos={fotos} />
          </div>
        </>
      ) : (
        <div className="card">
          <h2>Antes / Depois</h2>
          <Compare fotos={fotos} />
        </div>
      )}
    </>
  );
}
