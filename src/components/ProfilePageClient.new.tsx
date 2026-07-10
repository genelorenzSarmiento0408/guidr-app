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
  headline?: string;
  mentorship_link?: string;
  collaboration_link?: string;
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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [formData, setFormData] = useState({
    username: initialProfile?.username || "",
    program: initialProfile?.program || "",
    photo_url: initialProfile?.photo_url || "",
    bio: initialProfile?.bio || "",
    skills: initialProfile?.skills || "",
    headline: initialProfile?.headline || "",
    mentorship_link: initialProfile?.mentorship_link || "",
    collaboration_link: initialProfile?.collaboration_link || "",
    year_standing: initialProfile?.year_standing || "",
    firstName: "",
    lastName: "",
    profession: "",
  });

  const [userEmail, setUserEmail] = useState("");
  const [connectedProvider, setConnectedProvider] = useState<string | null>(
    null,
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
        year_standing: initialProfile.year_standing || "",
      }));
    }
  }, [isMentor, initialProfile]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const skillTags = formData.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const removeSkillTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill && skill !== tagToRemove)
        .join(", "),
    }));
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
        headline: string;
        mentorship_link: string;
        collaboration_link: string;
        year_standing: string;
        username?: string;
        program?: string;
      } = {
        bio: formData.bio,
        skills: formData.skills,
        photo_url: formData.photo_url,
        headline: formData.headline,
        mentorship_link: formData.mentorship_link,
        collaboration_link: formData.collaboration_link,
        year_standing: formData.year_standing,
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

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    setUploadingPhoto(true);
    setError(null);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${initialProfile?.user_id}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, photo_url: publicUrl }));
      setSuccess("Photo uploaded! Remember to save your profile.");
    } catch (err) {
      setError("Error uploading image");
      console.error(err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const Card = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={`bg-[#0A0D0A] border border-white/5 rounded-2xl p-8 mb-6 ${className}`}
    >
      {children}
    </div>
  );

  const InputField = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder = "",
    disabled = false,
  }: {
    label: string;
    name?: string;
    type?: string;
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    placeholder?: string;
    disabled?: boolean;
  }) => (
    <div className="flex flex-col gap-2 mb-6">
      <label className="text-white font-['Arimo'] text-sm tracking-wide font-bold">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`bg-transparent border border-white/20 rounded-full px-6 py-3 text-white font-['Arimo'] focus:outline-none focus:border-[#228C1D] ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060806] font-['League_Spartan',sans-serif] pb-24">
      {/* Header logic similar to BrowseFeed is expected to be wrapped by layout or added here. Assuming Navigation exists */}

      {/* Main Content Area */}
      <main className="max-w-[1512px] mx-auto px-8 pt-32 w-full flex flex-col items-start gap-8">
        {/* Back Link */}
        <Link
          href="/browse"
          className="flex items-center text-white gap-3 font-['Arimo'] text-sm uppercase tracking-wider hover:text-gray-300 transition-colors shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          BACK TO DASHBOARD
        </Link>

        <div className="w-full flex justify-between items-end mb-4">
          <h1 className="text-white text-4xl font-normal">
            {isOwnProfile
              ? "My Profile"
              : isOrganization
                ? "Organization's Profile"
                : "Mentor's Profile"}
          </h1>
          {isOwnProfile && isEditing && (
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="bg-[#228c1d] hover:bg-[#1d7518] text-white px-8 py-3 rounded-full font-['Arimo'] text-sm font-bold tracking-wide transition-colors uppercase disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Update"}
            </button>
          )}
        </div>

        {error && (
          <div className="w-full p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="w-full p-4 bg-green-900/50 border border-green-500 text-green-200 rounded-lg">
            {success}
          </div>
        )}

        <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column - Photo & Edit Button */}
          <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
            <div
              className={`w-full aspect-4/5 bg-white rounded-2xl overflow-hidden relative shrink-0 ${isOrganization ? "aspect-square p-4 bg-white flex items-center justify-center" : ""}`}
            >
              {formData.photo_url ? (
                isOrganization ? (
                  <Image
                    src={formData.photo_url}
                    alt="Logo"
                    fill
                    className="object-contain p-4"
                  />
                ) : (
                  <Image
                    src={formData.photo_url}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-black/20 text-8xl font-bold bg-white">
                  {isOrganization ? "LOGO" : "U"}
                </div>
              )}
            </div>

            {isOwnProfile ? (
              isEditing ? (
                <>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() =>
                      document.getElementById("photo-upload")?.click()
                    }
                    disabled={uploadingPhoto}
                    className="w-full bg-[#228c1d] hover:bg-[#1d7518] text-white px-6 py-4 rounded-full font-['Arimo'] text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <p className="text-gray-400 text-xs font-['Arimo'] leading-relaxed">
                    Upload a clear image or logo to represent your organization.
                    Accepted file types: JPG or PNG. Maximum file size: 5MB.
                  </p>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-[#228c1d] hover:bg-[#1d7518] text-white px-6 py-4 rounded-full font-['Arimo'] text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  Edit Profile
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )
            ) : (
              <div className="flex gap-4">
                <Link
                  href={`/messages?user=${initialProfile?.user_id}`}
                  className="flex-1 bg-[#228c1d] hover:bg-[#1d7518] text-white px-6 py-4 rounded-full font-['Arimo'] text-sm font-bold flex justify-center items-center gap-2 transition-colors"
                >
                  Message
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <button className="flex-1 border border-white hover:bg-white/10 text-white px-6 py-4 rounded-full font-['Arimo'] text-sm font-bold flex justify-center items-center gap-2 transition-colors">
                  Save Profile
                  <svg width="16" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Profile Details */}
          <div className="flex-1 flex flex-col gap-6 w-full max-w-[800px]">
            {/* Account Settings */}
            {isOwnProfile && (
              <Card>
                <h2 className="text-white text-2xl mb-8 font-bold">
                  Account Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <InputField
                      label="Email:"
                      type="email"
                      value={userEmail}
                      disabled
                    />
                    {isEditing && (
                      <div className="text-[#228c1d] text-xs font-['Arimo'] cursor-pointer ml-4 -mt-4 mb-4">
                        Edit email ↗
                      </div>
                    )}
                  </div>
                  <div>
                    <InputField
                      label="Password:"
                      type="password"
                      value="••••••••"
                      disabled
                    />
                    {isEditing && (
                      <div className="text-[#228c1d] text-xs font-['Arimo'] cursor-pointer ml-4 -mt-4 mb-4">
                        Update password ↗
                      </div>
                    )}
                  </div>
                </div>

                {connectedProvider && (
                  <div className="mt-4">
                    <label className="text-white font-['Arimo'] text-sm font-bold block mb-4">
                      Connected Provider:
                    </label>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full border border-[#228c1d]/50 bg-[#228c1d]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#84e07e]">
                          {connectedProvider}
                        </div>
                        <span className="text-gray-300 font-['Arimo'] text-sm">
                          {userEmail}
                        </span>
                      </div>
                      {isEditing && (
                        <button className="bg-[#228c1d] hover:bg-[#1d7518] text-white px-6 py-2 rounded-full font-['Arimo'] text-xs font-bold flex items-center gap-2">
                          Disconnect
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Mentor or Organization Details Block */}
            <Card>
              {isOrganization ? (
                <>
                  {isEditing ? (
                    <>
                      <InputField
                        label="Organization's Name"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                      />
                      <div className="flex flex-col gap-2 mb-6">
                        <label className="text-white font-['Arimo'] text-sm font-bold">
                          Headline
                        </label>
                        <p className="text-gray-400 text-xs font-['Arimo'] mb-1">
                          Add a short tagline that captures your
                          organization&apos;s mission or focus (max 80
                          characters).
                        </p>
                        <textarea
                          name="headline"
                          value={formData.headline}
                          onChange={handleInputChange}
                          maxLength={200}
                          rows={3}
                          className="bg-transparent border border-white/20 rounded-3xl px-6 py-3 text-white font-['Arimo'] focus:outline-none focus:border-[#228c1d] resize-none"
                          placeholder="Describe your mission, focus, or latest hiring need"
                        />
                      </div>
                      <InputField
                        label="Website / Collaboration Link"
                        name="collaboration_link"
                        value={formData.collaboration_link}
                        onChange={handleInputChange}
                        placeholder="https://..."
                      />
                    </>
                  ) : (
                    <>
                      <h2 className="text-white text-3xl font-normal mb-6">
                        {initialProfile?.username || "Organization Name"}
                      </h2>
                      <p className="text-gray-300 text-sm font-['Arimo'] mb-4 leading-relaxed">
                        {initialProfile?.headline ||
                          initialProfile?.program ||
                          "No headline added yet."}
                      </p>
                      {initialProfile?.collaboration_link && (
                        <a
                          href={initialProfile.collaboration_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-['Arimo'] font-bold text-white hover:text-[#228c1d] transition-colors"
                        >
                          Website / Collaboration Link
                        </a>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  {isEditing ? (
                    <>
                      <div className="grid grid-cols-2 gap-8 mb-2">
                        <InputField
                          label="First name"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                        <InputField
                          label="Last name"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <InputField
                        label="Profession / Title"
                        name="profession"
                        value={formData.profession}
                        onChange={handleInputChange}
                      />
                      <div className="flex flex-col gap-2 mb-6">
                        <label className="text-white font-['Arimo'] text-sm font-bold mb-1">
                          Year Standing
                        </label>
                        <select
                          name="year_standing"
                          value={formData.year_standing}
                          onChange={handleInputChange}
                          className="bg-transparent border border-white/20 rounded-full px-6 py-3 text-white font-['Arimo']"
                        >
                          <option value="">Select year standing</option>
                          <option value="Mentor">Mentor</option>
                          <option value="First Year">First Year</option>
                          <option value="Second Year">Second Year</option>
                          <option value="Third Year">Third Year</option>
                          <option value="Fourth Year">Fourth Year</option>
                          <option value="Graduate">Graduate</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2 mb-6">
                        <label className="text-white font-['Arimo'] text-sm font-bold mb-1">
                          Headline
                        </label>
                        <textarea
                          name="headline"
                          value={formData.headline}
                          onChange={handleInputChange}
                          rows={3}
                          maxLength={200}
                          placeholder="Add a short summary of your experience, interests, or goals"
                          className="bg-transparent border border-white/20 rounded-3xl px-6 py-3 text-white font-['Arimo'] resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-2">
                        <InputField
                          label="Mentorship Link"
                          name="mentorship_link"
                          value={formData.mentorship_link}
                          onChange={handleInputChange}
                          placeholder="https://..."
                        />
                        <InputField
                          label="Collaboration Link"
                          name="collaboration_link"
                          value={formData.collaboration_link}
                          onChange={handleInputChange}
                          placeholder="https://..."
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-white text-3xl font-normal mb-2">
                        {initialProfile?.username || "Unnamed profile"}
                      </h2>
                      <p className="text-gray-400 text-sm font-['Arimo'] mb-8">
                        {initialProfile?.program || "No profession added yet."}
                      </p>
                      {initialProfile?.year_standing && (
                        <p className="text-gray-400 text-sm font-['Arimo'] mb-4">
                          Year standing: {initialProfile.year_standing}
                        </p>
                      )}
                      <p className="text-gray-300 text-sm font-['Arimo'] mb-8 leading-relaxed max-w-[80%]">
                        {initialProfile?.headline || "No headline added yet."}
                      </p>
                      <div className="flex gap-8 mb-2 text-sm font-['Arimo'] font-bold flex-wrap">
                        {initialProfile?.mentorship_link && (
                          <a
                            href={initialProfile.mentorship_link}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 hover:text-[#228c1d] transition-colors"
                          >
                            Mentorship Link
                          </a>
                        )}
                        {initialProfile?.collaboration_link && (
                          <a
                            href={initialProfile.collaboration_link}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 hover:text-[#228c1d] transition-colors"
                          >
                            Collaboration Link
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </Card>

            {/* About / Bio block */}
            <Card>
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <label className="text-white font-['Arimo'] text-md font-bold mb-2">
                    About / Bio
                  </label>
                  {isOrganization && (
                    <p className="text-gray-400 text-xs font-['Arimo'] -mt-3 mb-2">
                      Share a brief introduction about your organization and
                      what you stand for.
                    </p>
                  )}
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full bg-transparent border border-white/20 rounded-3xl p-6 text-white font-['Arimo'] focus:outline-none focus:border-[#228c1d] resize-none"
                  />

                  {isMentor && (
                    <>
                      <label className="text-white font-['Arimo'] text-md font-bold mt-6 mb-2">
                        Expertise / Interests:
                      </label>
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border border-white/20 rounded-full px-6 py-3 text-white font-['Arimo']"
                        placeholder="Add tags separated by comma"
                      />
                      {skillTags.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-4">
                          {skillTags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => removeSkillTag(tag)}
                              className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold font-['Arimo'] hover:bg-[#228c1d] hover:text-white transition-colors"
                            >
                              {tag} ×
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <>
                  <h2 className="text-white text-xl font-bold font-['Arimo'] mb-6">
                    About / Bio
                  </h2>
                  <p className="text-gray-300 text-sm font-['Arimo'] leading-relaxed whitespace-pre-wrap">
                    {initialProfile?.bio || "No bio added yet."}
                  </p>

                  {isMentor && (
                    <div className="mt-8">
                      <h3 className="text-white text-sm font-bold font-['Arimo'] mb-4">
                        Expertise / Interests:
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {(initialProfile?.skills || "")
                          .split(",")
                          .map((skill) => skill.trim())
                          .filter(Boolean)
                          .map((skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold font-['Arimo']"
                            >
                              {skill}
                            </span>
                          ))}
                        {!(initialProfile?.skills || "")
                          .split(",")
                          .map((skill) => skill.trim())
                          .filter(Boolean).length && (
                          <span className="text-gray-500 text-sm font-['Arimo']">
                            No expertise tags added yet.
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>

            {!isEditing && isMentor && (
              <Card className="bg-[#0A0D0A] border border-white/5">
                <h2 className="text-white text-xl font-bold font-['Arimo'] mb-3">
                  Client Feedback
                </h2>
                <p className="text-gray-400 text-sm font-['Arimo']">
                  No feedback entries yet.
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
