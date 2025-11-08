import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Profile } from "../types";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
);

export default function SavedProfiles() {
  const [savedProfiles, setSavedProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedProfiles();
  }, []);

  async function fetchSavedProfiles() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("saved_profiles")
        .select(
          `
          saved_profile_id,
          profile:profiles!saved_profile_id(*)
        `
        )
        .eq("user_id", user.id);

      if (error) throw error;
      setSavedProfiles(data?.map((item) => item.profile) || []);
    } catch (error) {
      console.error("Error fetching saved profiles:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Profiles</h1>

      {savedProfiles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedProfiles.map((profile) => (
            <div key={profile.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl font-semibold text-gray-600">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {profile.username}
                  </h2>
                  <p className="text-sm text-gray-500">{profile.program}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Year: {profile.yearStanding}
                </p>
                <p className="text-sm text-gray-600">
                  Skills: {profile.skills}
                </p>
                {profile.chatLink && (
                  <a
                    href={profile.chatLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Chat Link
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          You haven't saved any profiles yet.
        </div>
      )}
    </div>
  );
}
