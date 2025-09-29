import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import type { Profile } from "../types";
import ProfileModal from "../components/ProfileModal";
import { Search, Users, Briefcase, Code, GraduationCap } from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
);

type PostType = "internship" | "collaboration" | "mentorship";

interface Match {
  score: number;
  profile: Profile;
}

export default function CreatePost() {
  // const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "internship" as PostType,
    skills: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function findMatches() {
    setLoading(true);
    setError("");
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) throw error;

      const matchedProfiles = (profiles || []).map((profile) => {
        let score = 0;
        const profileSkills = profile.skills?.toLowerCase() || "";
        const postContent = (
          formData.description +
          " " +
          formData.skills.join(" ")
        ).toLowerCase();

        if (formData.skills.length > 0) {
          formData.skills.forEach((skill) => {
            if (profileSkills.includes(skill.toLowerCase())) {
              score += 2;
            }
          });
        }

        const keywords = postContent.split(/\s+/);
        keywords.forEach((word) => {
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

  function handleSkillChange(e: React.ChangeEvent<HTMLInputElement>) {
    const skills = e.target.value
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, skills }));
  }

  function handleViewProfile(profile: Profile) {
    setSelectedProfile(profile);
    setIsModalOpen(true);
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Find Your Perfect Match
          </h1>
          <p className="mt-2 text-sm md:text-base text-gray-600">
            Describe your opportunity and we'll match you with the best
            candidates.
          </p>
        </div>

        <div className="space-y-6 bg-white rounded-lg shadow-lg p-4 md:p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are you looking for?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "internship" }))
                }
                className={`flex items-center justify-center p-3 md:p-4 rounded-lg border text-sm md:text-base ${
                  formData.type === "internship"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-green-500 hover:bg-green-50"
                }`}
              >
                <Briefcase className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Internship
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "collaboration" }))
                }
                className={`flex items-center justify-center p-3 md:p-4 rounded-lg border text-sm md:text-base ${
                  formData.type === "collaboration"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-green-500 hover:bg-green-50"
                }`}
              >
                <Code className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Collaboration
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "mentorship" }))
                }
                className={`flex items-center justify-center p-3 md:p-4 rounded-lg border text-sm md:text-base ${
                  formData.type === "mentorship"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-green-500 hover:bg-green-50"
                }`}
              >
                <GraduationCap className="w-4 h-4 md:w-5 md:h-5 mr-2" />
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
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm md:text-base"
              placeholder="Describe what you're looking for in a brief title"
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
              required
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm md:text-base"
              placeholder="Describe the opportunity, what you're looking for, and any other relevant details..."
            />
          </div>

          <div>
            <label
              htmlFor="skills"
              className="block text-sm font-medium text-gray-700"
            >
              Skills (Optional)
            </label>
            <input
              type="text"
              id="skills"
              value={formData.skills.join(", ")}
              onChange={handleSkillChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm md:text-base"
              placeholder="e.g., React, Node.js, Python (separate with commas)"
            />
            <p className="mt-1 text-xs md:text-sm text-gray-500">
              Adding skills helps us find better matches, but it's optional
            </p>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            onClick={findMatches}
            disabled={loading || !formData.title || !formData.description}
            className="w-full flex items-center justify-center py-2 md:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm md:text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Finding Matches...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Find Matches
              </>
            )}
          </button>
        </div>

        {matches.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Best Matches
              </h2>
            </div>
            <div className="space-y-4">
              {matches.map(({ profile, score }) => (
                <div
                  key={profile.id}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                        {profile.photoUrl ? (
                          <img
                            src={profile.photoUrl}
                            alt={profile.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-500">
                            {profile.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-base md:text-lg font-medium text-gray-900">
                          {profile.username}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {profile.program} • {profile.yearStanding}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewProfile(profile)}
                      className="w-full sm:w-auto flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      View Profile
                    </button>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {profile.skills}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (score / 10) * 100)}%`,
                        }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs md:text-sm text-gray-500">
                      {Math.min(100, Math.round((score / 10) * 100))}% match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedProfile && (
          <ProfileModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            profile={selectedProfile}
          />
        )}
      </div>
    </div>
  );
}
