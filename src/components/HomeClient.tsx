"use client";

import { useState } from "react";
import { Search, Eye } from "lucide-react";
import type { Post, Profile } from "@/lib/types";
import ProfileModal from "@/components/ProfileModal";

interface HomeClientProps {
  initialPosts: Post[];
}

export default function HomeClient({ initialPosts }: HomeClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredPosts = initialPosts.filter(
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
    <div className="max-w-7xl mx-auto">
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

      {filteredPosts.length > 0 ? (
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
