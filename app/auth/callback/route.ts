import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google OAuth (and email-link) redirect target: exchanges the `code` query
// param for a session, then routes the user onward — to role selection if
// this is a brand-new account with no role yet, otherwise to "/" which
// itself routes by role/onboarding status.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!profile?.role) {
          return NextResponse.redirect(`${origin}/complete-profile`);
        }
      }
      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
