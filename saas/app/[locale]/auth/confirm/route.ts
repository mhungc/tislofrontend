import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const pathname = new URL(request.url).pathname;
  const localeFromPath = pathname.split("/")[1];
  const normalizedNext = next.startsWith("/") ? next : `/${next}`;
  const nextHasLocale = /^\/(en|es)(\/|$)/.test(normalizedNext);
  const redirectTarget = nextHasLocale ? normalizedNext : `/${localeFromPath}${normalizedNext}`;

  const supabase = await createClient();

  // Handle OAuth callback (Google, etc.)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(redirectTarget);
    } else {
      redirect(`/${localeFromPath}/auth/error?error=${error?.message}`);
    }
  }

  // Handle email confirmation
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      redirect(redirectTarget);
    } else {
      redirect(`/${localeFromPath}/auth/error?error=${error?.message}`);
    }
  }

  // If no valid parameters, redirect to error
  redirect(`/${localeFromPath}/auth/error?error=Invalid authentication parameters`);
}
