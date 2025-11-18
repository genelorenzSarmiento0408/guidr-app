import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import ProfilePageClient from "@/components/ProfilePageClient";

export default async function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Check if viewing own profile
  const isOwnProfile = user.id === params.id;

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
          username: profile.username,
          program: profile.program,
          yearStanding: profile.year_standing,
          chatLink: profile.chat_link,
          photoUrl: profile.photo_url,
          skills: profile.skills,
          userId: profile.user_id,
          createdAt: profile.created_at,
          mentorshipLink: profile.mentorship_link,
          mentorshipPrice: profile.mentorship_price,
          userType: profile.user_type || [],
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
    .eq("user_id", params.id)
    .single();

  if (error || !profile) {
    notFound();
  }

  const profileData = {
    id: profile.id,
    username: profile.username,
    program: profile.program,
    yearStanding: profile.year_standing,
    chatLink: profile.chat_link,
    photoUrl: profile.photo_url,
    skills: profile.skills,
    userId: profile.user_id,
    createdAt: profile.created_at,
    mentorshipLink: profile.mentorship_link,
    mentorshipPrice: profile.mentorship_price,
    userType: profile.user_type || [],
  };

  return (
    <ProfilePageClient initialProfile={profileData} isOwnProfile={false} />
  );
}
