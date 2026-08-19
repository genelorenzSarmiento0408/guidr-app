import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SavedProfilesClient from "@/components/SavedProfilesClient";

export default async function SavedProfilesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: userProfile } = await supabase
    .from("profiles")
    .select("id, username, photo_url")
    .eq("user_id", user.id)
    .maybeSingle();

  // Fetch saved profiles server-side
  const { data } = await supabase
    .from("saved_profiles")
    .select(
      `
      saved_profile_id,
      profiles!saved_profile_id (
        id,
        username,
        program,
        year_standing,
        chat_link,
        photo_url,
        skills,
        bio,
        headline,
        mentorship_link,
        collaboration_link,
        user_id,
        created_at,
        user_type
      )
    `,
    )
    .eq("user_id", user.id);

  interface SavedProfileData {
    profiles: {
      id: string;
      username: string;
      program: string;
      year_standing: string;
      chat_link: string;
      photo_url: string;
      skills: string;
      bio?: string;
      headline?: string;
      mentorship_link?: string;
      collaboration_link?: string;
      user_id: string;
      created_at: string;
      user_type: ("student" | "company")[];
    };
  }

  const savedProfiles =
    (data as SavedProfileData[] | null)?.map((item) => ({
      id: item.profiles.id,
      username: item.profiles.username,
      program: item.profiles.program,
      yearStanding: item.profiles.year_standing,
      chatLink: item.profiles.chat_link,
      photoUrl: item.profiles.photo_url,
      skills: item.profiles.skills,
      bio: item.profiles.bio,
      headline: item.profiles.headline,
      mentorshipLink: item.profiles.mentorship_link,
      collaborationLink: item.profiles.collaboration_link,
      userId: item.profiles.user_id,
      createdAt: item.profiles.created_at,
      userType: item.profiles.user_type || [],
    })) || [];

  return (
    <SavedProfilesClient
      initialProfiles={savedProfiles}
      currentUserId={user.id}
      currentUserProfile={
        userProfile
          ? {
              id: userProfile.id,
              username: userProfile.username,
              photo_url: userProfile.photo_url,
            }
          : null
      }
    />
  );
}
