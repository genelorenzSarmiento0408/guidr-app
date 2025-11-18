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
        user_id,
        created_at,
        user_type
      )
    `
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
      userId: item.profiles.user_id,
      createdAt: item.profiles.created_at,
      userType: item.profiles.user_type || [],
    })) || [];

  return <SavedProfilesClient initialProfiles={savedProfiles} />;
}
