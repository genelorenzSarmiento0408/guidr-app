import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Post, Profile } from "../types";
import { Search, Eye } from "lucide-react";
import ProfileModal from "../components/ProfileModal";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        "X-Client-Info": "supabase-js",
      },
    },
  }
);

// Sample posts data
const samplePosts: Post[] = [
  {
    id: "1",
    userId: "1",
    title: "[SAMPLE] Research Project: AI-Powered Educational Platform",
    description:
      "Seeking collaborators for an academic research project focused on developing an AI-powered educational platform. The project aims to create personalized learning paths using machine learning algorithms to analyze student performance and adapt content delivery. Looking for students with experience in ML/AI, educational technology, or UI/UX design. This is part of a larger research initiative in adaptive learning systems.",
    createdAt: new Date().toISOString(),
    profile: {
      id: "1",
      userId: "1",
      username: "prof_smith",
      program: "Computer Science",
      yearStanding: "Graduate",
      chatLink: "https://linkedin.com/in/profsmith",
      skills:
        "Research focus on AI in education, machine learning, and adaptive learning systems. Published papers in educational technology and cognitive computing. Looking for passionate students interested in academic research and publication.",
      photoUrl: "",
      userType: ["company"],
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: "2",
    userId: "2",
    title: "[SAMPLE] Startup: Sustainable Fashion Marketplace",
    description:
      "Building a revolutionary marketplace that connects sustainable fashion brands with conscious consumers. We're using blockchain for supply chain transparency and AI for personalized styling. Looking for a technical co-founder with experience in full-stack development and interest in sustainability. MVP in development, early user testing showing promising results.",
    createdAt: new Date().toISOString(),
    profile: {
      id: "2",
      userId: "2",
      photoUrl: "",
      userType: ["company"],
      username: "eco_innovator",
      program: "Software Engineering",
      yearStanding: "4th Year",
      chatLink: "https://discord.gg/ecofashion",
      skills:
        "Full-stack developer with experience in React, Node.js, and blockchain technology. Previously founded a tech-enabled recycling initiative. Passionate about using technology to promote sustainability and ethical consumption.",
      createdAt: new Date().toISOString(),
    },
  },
];

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkUser();
    fetchPosts();
  }, []);

  async function checkUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error("Error checking user:", error);
    }
  }

  async function fetchPosts() {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(
          `
          id,
          title,
          description,
          user_id,
          created_at
        `
        )
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      const postsWithProfiles = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select(
              `
            id,
            username,
            program,
            yearStanding,
            chatLink,
            photoUrl,
            skills,
            userId:user_id,
            createdAt:created_at
          `
            )
            .eq("user_id", post.user_id)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
            return null;
          }

          return {
            ...post,
            createdAt: post.created_at,
            userId: post.user_id,
            profile: profileData,
          };
        })
      );

      const validPosts = postsWithProfiles.filter(
        (post): post is Post => post !== null
      );
      setPosts([...samplePosts, ...validPosts]);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts(samplePosts);
    } finally {
      setLoading(false);
    }
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.profile.skills?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleViewProfile(profile: Profile) {
    setSelectedProfile(profile);
    setIsModalOpen(true);
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Find Your Next Project Partner
        </h1>
        <p className="text-gray-600">
          Browse through project opportunities and connect with potential
          collaborators.
        </p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, description, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {post.title}
                  </h2>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
              <p className="mt-4 text-gray-700">{post.description}</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {post.title.startsWith("[SAMPLE]") ? (
                        <div className="text-2xl font-bold text-gray-500 bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center">
                          {post.profile.username.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                          {post.profile.photoUrl ? (
                            <img
                              src={post.profile.photoUrl}
                              alt={post.profile.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-500">
                              {post.profile.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {post.profile.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        {post.profile.program} • {post.profile.yearStanding}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewProfile(post.profile)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg">No posts found matching your search.</p>
          <p className="mt-2">
            Try adjusting your search terms or browse all available posts.
          </p>
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
  );
}
