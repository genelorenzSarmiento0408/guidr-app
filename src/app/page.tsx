import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Opportunity Board",
  description:
    "Browse internships, mentorships, and collaborations tailored to your skills on Guidr.",
};

type FeedProfile = {
  id: string;
  userId: string;
  username: string;
  program: string;
  yearStanding: string;
  chatLink: string;
  skills: string;
  photoUrl: string;
  userType: ("student" | "company")[];
  createdAt: string;
  headline?: string;
  mentorshipLink?: string;
  collaborationLink?: string;
};

type FeedPost = {
  id: string;
  userId: string;
  title: string;
  projectType?: string;
  status?: string;
  requiredSkills?: string;
  description: string;
  createdAt: string;
  profile: FeedProfile;
};

type DbPost = {
  id: string;
  user_id: string;
  title: string;
  project_type: string | null;
  status: string | null;
  required_skills: string | null;
  description: string;
  created_at: string;
};

type DbProfile = FeedProfile;

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentProfile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, skills, headline, user_type")
      .eq("user_id", user.id)
      .single();

    currentProfile = data;
  }

  let posts: FeedPost[] = [];

  try {
    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select(
        `
        id,
        title,
        project_type,
        status,
        required_skills,
        description,
        user_id,
        created_at
      `,
      )
      .order("created_at", { ascending: false });

    if (!postsError && postsData) {
      const postsWithProfiles: FeedPost[] = [];

      for (const post of postsData as DbPost[]) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select(
            `
            id,
            username,
            program,
            yearStanding:year_standing,
            chatLink:chat_link,
            photoUrl:photo_url,
            skills,
            userId:user_id,
            createdAt:created_at,
            userType:user_type,
            headline,
            mentorshipLink:mentorship_link,
            collaborationLink:collaboration_link
          `,
          )
          .eq("user_id", post.user_id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          continue;
        }

        if (!profileData) {
          continue;
        }

        postsWithProfiles.push({
          id: post.id,
          title: post.title,
          description: post.description,
          userId: post.user_id,
          createdAt: post.created_at,
          projectType: post.project_type,
          requiredSkills: post.required_skills,
          profile: profileData as DbProfile,
        });
      }

      posts = postsWithProfiles;
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
  }

  return <HomeClient initialPosts={posts} currentProfile={currentProfile} />;
}
