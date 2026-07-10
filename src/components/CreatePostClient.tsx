"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import {
  Briefcase,
  Code,
  GraduationCap,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import Image from "next/image";
import ProfileModal from "@/components/ProfileModal";

type PostType = "internship" | "collaboration" | "mentorship";
type PostStatus = "open" | "closed";

interface Match {
  score: number;
  profile: Profile;
}

interface OpportunityRecord {
  id: string;
  title: string;
  description: string;
  project_type: string | null;
  status: PostStatus | null;
  required_skills: string | null;
  created_at: string;
}

interface FormState {
  title: string;
  description: string;
  type: PostType;
  status: PostStatus;
  requiredSkills: string;
}

const initialFormState: FormState = {
  title: "",
  description: "",
  type: "internship",
  status: "open",
  requiredSkills: "",
};

export default function CreatePostClient() {
  const supabase = createClient();
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myPosts, setMyPosts] = useState<OpportunityRecord[]>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setCurrentUserId(user.id);

      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select(
          "id, title, description, project_type, status, required_skills, created_at",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (postsError) {
        setError(postsError.message);
        return;
      }

      setMyPosts((posts || []) as OpportunityRecord[]);
    };

    initialize();
  }, [supabase]);

  async function refreshMyPosts() {
    if (!currentUserId) return;

    setLoadingPosts(true);
    try {
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select(
          "id, title, description, project_type, status, required_skills, created_at",
        )
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      setMyPosts((posts || []) as OpportunityRecord[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoadingPosts(false);
    }
  }

  function handleFieldChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleRequiredSkillsChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, requiredSkills: e.target.value }));
  }

  function resetForm() {
    setFormData(initialFormState);
    setEditingPostId(null);
  }

  async function saveOpportunity() {
    if (!currentUserId) return;

    setSavingPost(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        project_type: formData.type,
        status: formData.status,
        required_skills: formData.requiredSkills.trim(),
        user_id: currentUserId,
      };

      if (!payload.title || !payload.description) {
        throw new Error("Title and description are required.");
      }

      if (editingPostId) {
        const { error: updateError } = await supabase
          .from("posts")
          .update(payload)
          .eq("id", editingPostId)
          .eq("user_id", currentUserId);

        if (updateError) throw updateError;
        setSuccess("Opportunity updated.");
      } else {
        const { error: insertError } = await supabase
          .from("posts")
          .insert(payload);

        if (insertError) throw insertError;
        setSuccess("Opportunity created.");
      }

      resetForm();
      await refreshMyPosts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save opportunity",
      );
    } finally {
      setSavingPost(false);
    }
  }

  async function deleteOpportunity(postId: string) {
    if (!currentUserId) return;

    const confirmed = window.confirm(
      "Delete this opportunity? This cannot be undone.",
    );
    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const { error: deleteError } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", currentUserId);

      if (deleteError) throw deleteError;

      if (editingPostId === postId) {
        resetForm();
      }

      setSuccess("Opportunity deleted.");
      await refreshMyPosts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete opportunity",
      );
    }
  }

  async function togglePostStatus(post: OpportunityRecord) {
    if (!currentUserId) return;

    const nextStatus: PostStatus = post.status === "closed" ? "open" : "closed";
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await supabase
        .from("posts")
        .update({ status: nextStatus })
        .eq("id", post.id)
        .eq("user_id", currentUserId);

      if (updateError) throw updateError;

      setSuccess(`Opportunity marked ${nextStatus}.`);
      await refreshMyPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  async function findMatches() {
    setLoading(true);
    setError("");
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      const requiredSkillList = formData.requiredSkills
        .split(",")
        .map((skill) => skill.trim().toLowerCase())
        .filter(Boolean);

      const postKeywords =
        `${formData.title} ${formData.description} ${formData.requiredSkills}`
          .toLowerCase()
          .split(/\s+/);

      const matchedProfiles = (profiles || []).map((profile) => {
        let score = 0;
        const profileSkills = profile.skills?.toLowerCase() || "";

        requiredSkillList.forEach((skill) => {
          if (profileSkills.includes(skill)) {
            score += 2;
          }
        });

        postKeywords.forEach((word) => {
          if (word.length > 3 && profileSkills.includes(word)) {
            score += 1;
          }
        });

        if (formData.type === "mentorship" && profile.mentorship_link) {
          score += 3;
        }

        return {
          score,
          profile: {
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
          },
        };
      });

      const topMatches = matchedProfiles
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .filter((match) => match.score > 0);

      setMatches(topMatches);
    } catch (err) {
      console.error("Error finding matches:", err);
      setError(err instanceof Error ? err.message : "Failed to find matches");
    } finally {
      setLoading(false);
    }
  }

  function handleViewProfile(profile: Profile) {
    setSelectedProfile(profile);
    setIsModalOpen(true);
  }

  function beginEdit(post: OpportunityRecord) {
    setEditingPostId(post.id);
    setFormData({
      title: post.title,
      description: post.description,
      type: (post.project_type as PostType) || "internship",
      status: post.status || "open",
      requiredSkills: post.required_skills || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Opportunity Manager
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600">
          Create, update, and remove opportunities from one place, then preview
          matching candidates before you publish.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6 rounded-2xl bg-white p-5 shadow-lg md:p-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Opportunity Type
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "internship" }))
                }
                className={`flex items-center justify-center rounded-lg border p-3 text-sm font-medium ${
                  formData.type === "internship"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 text-gray-700 hover:border-green-500 hover:bg-green-50"
                }`}
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Internship
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "collaboration" }))
                }
                className={`flex items-center justify-center rounded-lg border p-3 text-sm font-medium ${
                  formData.type === "collaboration"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 text-gray-700 hover:border-green-500 hover:bg-green-50"
                }`}
              >
                <Code className="mr-2 h-4 w-4" />
                Collaboration
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "mentorship" }))
                }
                className={`flex items-center justify-center rounded-lg border p-3 text-sm font-medium ${
                  formData.type === "mentorship"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 text-gray-700 hover:border-green-500 hover:bg-green-50"
                }`}
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                Mentorship
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleFieldChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              placeholder="Describe the opportunity in a short title"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleFieldChange}
              rows={5}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              placeholder="Describe the opportunity, expectations, and timeline..."
            />
          </div>

          <div>
            <label
              htmlFor="requiredSkills"
              className="block text-sm font-medium text-gray-700"
            >
              Required Skills
            </label>
            <input
              type="text"
              id="requiredSkills"
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleRequiredSkillsChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              placeholder="React, Figma, Python (comma-separated)"
            />
            <p className="mt-1 text-xs text-gray-500">
              This is saved to the post and used for search and matching.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleFieldChange}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={saveOpportunity}
              disabled={savingPost || !formData.title || !formData.description}
              className="inline-flex flex-1 items-center justify-center rounded-md bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {savingPost ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {editingPostId ? "Updating..." : "Creating..."}
                </>
              ) : editingPostId ? (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Update Opportunity
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Opportunity
                </>
              )}
            </button>
            <button
              onClick={findMatches}
              disabled={loading || !formData.title || !formData.description}
              className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Matching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Matches
                </>
              )}
            </button>
            {editingPostId && (
              <button
                onClick={resetForm}
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {matches.length > 0 && (
            <div className="rounded-2xl bg-white p-5 shadow-lg md:p-6">
              <div className="mb-4 flex items-center">
                <Users className="mr-2 h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Best Matches
                </h2>
              </div>
              <div className="space-y-4">
                {matches.map(({ profile, score }) => (
                  <div
                    key={profile.id}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                          {profile.photoUrl ? (
                            <Image
                              src={profile.photoUrl}
                              alt={profile.username}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl font-bold text-gray-500">
                              {profile.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-base font-medium text-gray-900">
                            {profile.username}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {profile.program} • {profile.yearStanding}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewProfile(profile)}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        View Profile
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {profile.skills}
                    </p>
                    <div className="mt-2 flex items-center">
                      <div className="h-2 flex-1 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-green-600"
                          style={{
                            width: `${Math.min(100, (score / 10) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="ml-2 text-xs text-gray-500">
                        {Math.min(100, Math.round((score / 10) * 100))}% match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-white p-5 shadow-lg md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                My Opportunities
              </h2>
              <button
                onClick={refreshMyPosts}
                className="text-sm font-medium text-green-700 hover:text-green-800"
                type="button"
              >
                {loadingPosts ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {myPosts.length > 0 ? (
              <div className="space-y-4">
                {myPosts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          <span>{post.project_type || "general"}</span>
                          <span>•</span>
                          <span>{post.status || "open"}</span>
                        </div>
                        <h3 className="mt-2 text-base font-semibold text-gray-900">
                          {post.title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                          {post.description}
                        </p>
                        {post.required_skills && (
                          <p className="mt-2 text-sm text-gray-500">
                            Required skills: {post.required_skills}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => beginEdit(post)}
                          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePostStatus(post)}
                          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Mark {post.status === "closed" ? "Open" : "Closed"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteOpportunity(post.id)}
                          className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
                You do not have any opportunities yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProfile && (
        <ProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          profile={selectedProfile}
        />
      )}
    </div>
  );
}
