"use client";

import type { Profile } from "@/lib/types";

interface SavedProfilesClientProps {
  initialProfiles: Profile[];
}

export default function SavedProfilesClient({
  initialProfiles,
}: SavedProfilesClientProps) {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Profiles</h1>

      {initialProfiles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {initialProfiles.map((profile) => (
            <div key={profile.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {profile.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-semibold text-gray-600">
                      {profile.username.charAt(0).toUpperCase()}
                    </span>
                  )}
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
                <p className="text-sm text-gray-600 line-clamp-2">
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
        <div className="text-center text-gray-500 py-12">
          <p>You haven&apos;t saved any profiles yet.</p>
        </div>
      )}
    </div>
  );
}
