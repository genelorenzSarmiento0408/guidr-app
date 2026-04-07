import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import ProfilePageClient from "@/components/ProfilePageClient";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch the profile associated with the passed `id`
  // id can be either the `profile.id` or `profile.user_id` as they're UUIDs
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .or(`id.eq.${id},user_id.eq.${id}`)
    .single();

  if (error && error.code !== "PGRST116") {
    // Log unexpected errors
    console.error("Profile fetch error:", error);
  }

  const isOwnProfile = user?.id === profile?.user_id || user?.id === id;

  if (!profile && !isOwnProfile) {
    notFound();
  }

  const profileData = profile
    ? {
        id: profile.id,
        user_id: profile.user_id,
        username: profile.username,
        program: profile.program,
        photo_url: profile.photo_url,
        skills: profile.skills,
        user_type: profile.user_type || [],
        bio: profile.bio,
        year_standing: profile.year_standing,
        chat_enabled: profile.chat_enabled,
      }
    : null;

  return (
    <ProfilePageClient
      initialProfile={profileData}
      isOwnProfile={isOwnProfile}
    />
  );
}
