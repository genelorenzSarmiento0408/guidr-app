"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  program: string;
  photo_url?: string;
  bio?: string;
  skills?: string;
  user_type: string[];
  year_standing?: string;
  chat_enabled?: boolean;
}

interface ProfilePageClientProps {
  initialProfile: Profile | null;
  isOwnProfile: boolean;
}

export default function ProfilePageClient({
  initialProfile,
  isOwnProfile,
}: ProfilePageClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: initialProfile?.username || "",
    program: initialProfile?.program || "",
    photo_url: initialProfile?.photo_url || "",
    bio: initialProfile?.bio || "",
    skills: initialProfile?.skills || "",
    firstName: "",
    lastName: "",
    headline: "",
    profession: "",
  });

  const [userEmail, setUserEmail] = useState("");
  const [connectedProvider, setConnectedProvider] = useState<string | null>(
    null
  );

  const isOrganization = initialProfile?.user_type?.includes("company");
  const isMentor = initialProfile?.user_type?.includes("student");

  useEffect(() => {
    const fetchUserData = async () => {
      if (isOwnProfile) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || "");
          const providers = user.app_metadata?.providers || [];
          if (providers.includes("google")) {
            setConnectedProvider("google");
          }
        }
      }
    };
    fetchUserData();
  }, [isOwnProfile, supabase]);

  useEffect(() => {
    if (isMentor && initialProfile?.username) {
      const parts = initialProfile.username.split(" ");
      setFormData((prev) => ({
        ...prev,
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        profession: initialProfile.program || "",
      }));
    }
  }, [isMentor, initialProfile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: {
        bio: string;
        skills: string;
        photo_url: string;
        username?: string;
        program?: string;
        headline?: string;
      } = {
        bio: formData.bio,
        skills: formData.skills,
        photo_url: formData.photo_url,
      };

      if (isOrganization) {
        updateData.username = formData.username;
        updateData.program = formData.program;
      } else if (isMentor) {
        updateData.username =
          `${formData.firstName} ${formData.lastName}`.trim();
        updateData.program = formData.profession;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", initialProfile?.user_id);

      if (updateError) throw updateError;

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    alert("Photo upload - integrate with Supabase Storage");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-6">
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 text-white hover:text-guidr-green transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <svg
              className="w-4 h-4 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
          <span className="font-semibold">BACK TO DASHBOARD</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        <h1 className="text-3xl font-bold mb-8">
          {isOwnProfile
            ? "My Profile"
            : isOrganization
            ? "Organization's Profile"
            : "Mentor's Information"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-4 mb-6">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                {formData.photo_url ? (
                  <Image
                    src={formData.photo_url}
                    alt={formData.username}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl font-bold">
                    {isOrganization ? "ORG" : formData.firstName?.[0] || "U"}
                  </div>
                )}
              </div>
            </div>

            {isOwnProfile && isEditing && (
              <>
                <button
                  onClick={() =>
                    document.getElementById("photo-upload")?.click()
                  }
                  className="w-full mb-4 px-4 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#228C1D" }}
                >
                  Upload Photo
                </button>
                <p className="text-xs text-gray-400 mb-4">
                  Upload a clear image or logo. Accepted: JPG, PNG. Max: 5MB.
                </p>
              </>
            )}
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {isOwnProfile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: "#228C1D" }}
              >
                Edit Profile
              </button>
            )}

            {!isOwnProfile && (
              <div className="space-y-4">
                <button
                  className="w-full px-6 py-3 rounded-lg font-semibold text-white"
                  style={{ backgroundColor: "#228C1D" }}
                >
                  Message
                </button>
                <button className="w-full px-6 py-3 rounded-lg font-semibold text-white border border-white">
                  Save Profile
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            {isOwnProfile && isEditing && (
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="px-6 py-3 rounded-lg font-semibold text-white"
                  style={{ backgroundColor: "#228C1D" }}
                >
                  {loading ? "Saving..." : "Save Update"}
                </button>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-500">
                {success}
              </div>
            )}

            {isOwnProfile && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Account Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm mb-2">Email:</label>
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className="w-full px-4 py-2 rounded-lg bg-black border border-gray-700 text-gray-400"
                    />
                    {isEditing && (
                      <button className="text-xs text-guidr-green mt-1">
                        Edit email id
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Password:</label>
                    <input
                      type="password"
                      value="••••••••"
                      disabled
                      className="w-full px-4 py-2 rounded-lg bg-black border border-gray-700 text-gray-400"
                    />
                    {isEditing && (
                      <button className="text-xs text-guidr-green mt-1">
                        Update password id
                      </button>
                    )}
                  </div>
                </div>
                {connectedProvider && (
                  <div>
                    <label className="block text-sm mb-2">
                      Connected with:
                    </label>
                    <div className="flex items-center justify-between bg-black border border-gray-700 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{userEmail}</span>
                      </div>
                      {isEditing && (
                        <button className="px-4 py-2 rounded-lg bg-guidr-green text-white text-sm font-semibold">
                          Disconnect
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isOrganization && (
              <>
                <div className="bg-gray-900 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Organization Name</h2>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-black border border-gray-700 text-white"
                    />
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold mb-2">
                        {initialProfile?.username}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {initialProfile?.program}
                      </p>
                    </>
                  )}
                </div>

                {isEditing && (
                  <div className="bg-gray-900 rounded-lg p-6">
                    <label className="block text-sm font-semibold mb-2">
                      Headline
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                      Max 80 characters
                    </p>
                    <input
                      type="text"
                      name="headline"
                      value={formData.headline}
                      onChange={handleInputChange}
                      maxLength={80}
                      className="w-full px-4 py-2 rounded-lg bg-black border border-gray-700 text-white"
                    />
                  </div>
                )}

                <div className="bg-gray-900 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">About / Bio</h2>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={8}
                      className="w-full px-4 py-2 rounded-lg bg-black border border-gray-700 text-white"
                    />
                  ) : (
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {initialProfile?.bio || "No bio available"}
                    </p>
                  )}
                </div>
              </>
            )}

            {isMentor && (
              <>
                <div className="bg-gray-900 rounded-lg p-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-2">
                            First name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg bg-black border border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-2">
                            Last name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg bg-black border border-gray-700 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm mb-2">
                          Profession / Title
                        </label>
                        <input
                          type="text"
                          name="profession"
                          value={formData.profession}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg bg-black border border-gray-700 text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold mb-1">
                        {initialProfile?.username}
                      </h3>
                      <p className="text-gray-400 mb-4">
                        {initialProfile?.program}
                      </p>
                      <div className="flex gap-4">
                        <button className="px-4 py-2 bg-gray-800 rounded-lg text-sm">
                          Mentorship
                        </button>
                        <button className="px-4 py-2 bg-gray-800 rounded-lg text-sm">
                          Collaboration
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-gray-900 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">About / Bio</h2>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={8}
                      className="w-full px-4 py-2 rounded-lg bg-black border border-gray-700 text-white"
                    />
                  ) : (
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {initialProfile?.bio || "No bio available"}
                    </p>
                  )}
                </div>

                {isEditing && (
                  <div className="bg-gray-900 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">
                      Expertise / Interest
                    </h2>
                    <textarea
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      placeholder="e.g., Leadership, Strategy, Marketing"
                      className="w-full px-4 py-2 rounded-lg bg-black border border-gray-700 text-white"
                    />
                  </div>
                )}

                {!isEditing && isMentor && (
                  <div className="bg-gray-900 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Client Feedback</h2>
                    <p className="text-gray-400 text-sm mb-4">
                      Feedback from organizations and clients
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg"></div>
                      <span className="text-sm">Org/Company Name</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
