import HomeClient from "@/components/HomeClient";
import { createClient } from "@/lib/supabase/server";

// Sample posts data
const samplePosts = [
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
      userType: ["company" as const],
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
      userType: ["company" as const],
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

export default async function HomePage() {
  const supabase = await createClient();

  let posts = [...samplePosts];

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

    if (!postsError && postsData) {
      const postsWithProfiles = await Promise.all(
        postsData.map(async (post) => {
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
              createdAt:created_at,
              userType:user_type
            `
            )
            .eq("user_id", post.user_id)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
            return null;
          }

          return {
            id: post.id,
            title: post.title,
            description: post.description,
            userId: post.user_id,
            createdAt: post.created_at,
            profile: profileData,
          };
        })
      );

      const validPosts = postsWithProfiles.filter((post) => post !== null);
      posts = [...samplePosts, ...validPosts];
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
  }

  return <HomeClient initialPosts={posts} />;
}
