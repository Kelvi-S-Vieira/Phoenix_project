import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import { ALUNO_SIDEBAR_SECTIONS } from "@/lib/sidebar-nav";
import FotosTabs from "./FotosTabs";
import type { Pose } from "@/lib/database.types";

const SIGNED_URL_EXPIRES_IN = 3600; // seconds

export interface FotoWithUrl {
  id: string;
  taken_at: string;
  pose: Pose | null;
  weight_at_photo: number | null;
  storage_path: string;
  url: string | null; // null if the signed URL couldn't be generated (e.g. file deleted from Storage)
}

export default async function FotosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.role) redirect("/complete-profile");
  if (profile.role === "personal") redirect("/personal");
  if (!profile.onboarding_completed) redirect("/onboarding");

  const { data: photos } = await supabase
    .from("progress_photos")
    .select("id, storage_path, taken_at, pose, weight_at_photo")
    .eq("profile_id", user.id)
    .order("taken_at", { ascending: false });

  const rows = photos ?? [];

  // The bucket is private, so URLs must be signed server-side (this is the
  // one place in the app that already has the user's session cookie and can
  // call Storage's admin-signing endpoint on their behalf).
  let fotos: FotoWithUrl[] = rows.map((p) => ({ ...p, url: null }));
  if (rows.length > 0) {
    const { data: signed } = await supabase.storage
      .from("progress-photos")
      .createSignedUrls(
        rows.map((p) => p.storage_path),
        SIGNED_URL_EXPIRES_IN
      );

    // createSignedUrls returns one result per input path, in the same
    // order, even when some entries error out individually (e.g. a file
    // that was removed from Storage but whose row is still in the table).
    fotos = rows.map((p, i) => ({
      ...p,
      url: signed?.[i]?.signedUrl ?? null,
    }));
  }

  return (
    <div className="app-shell">
      <Sidebar
        variant="aluno"
        accountName={`${profile.name ?? "Aluno"} · Aluno`}
        currentWeight={profile.current_weight}
        targetWeight={profile.target_weight}
        sections={ALUNO_SIDEBAR_SECTIONS}
      />
      <main className="main-content">
      <div className="fx-app">
        <FotosTabs profileId={user.id} fotos={fotos} />

        <div className="footer-note">
          PROJETO FÊNIX — o espelho engana no dia a dia, as fotos lado a lado não.
        </div>
      </div>
      </main>
    </div>
  );
}
