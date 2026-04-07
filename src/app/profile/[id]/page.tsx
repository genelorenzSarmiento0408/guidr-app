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

  // Check if viewing own profile
  const isOwnProfile = user.id === id;

  if (isOwnProfile) {
    // Fetch own profile for editing
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

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
      <ProfilePageClient initialProfile={profileData} isOwnProfile={true} />
    );
  }

  // Viewing someone else's profile (read-only)
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", id)
    .single();

  if (error || !profile) {
    notFound();
  }

  const profileData = {
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
  };

  return (
    <ProfilePageClient initialProfile={profileData} isOwnProfile={false} />
  );
}
