import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const role = requestUrl.searchParams.get("role");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .single();

      // Only create profile if it doesn't exist (new user)
      if (!existingProfile) {
        const userName =
          data.user.user_metadata?.full_name ||
          data.user.email?.split("@")[0] ||
          "User";

        await supabase.from("profiles").insert({
          id: data.user.id,
          user_id: data.user.id,
          username: userName,
          user_type: role === "mentor" ? ["student"] : ["company"],
          program: role === "mentor" ? "Mentor" : "Organization",
          year_standing: role === "mentor" ? "Mentor" : "N/A",
          skills: "",
          chat_link: "",
          photo_url: data.user.user_metadata?.avatar_url || "",
        });
      }
    }
  }

  // Redirect to home page
  return NextResponse.redirect(`${origin}/`);
}
