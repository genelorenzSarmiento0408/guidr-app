import { createClient } from "@/lib/supabase/server";
import BrowseFeedClient from "@/components/BrowseFeedClient";
import { redirect } from "next/navigation";

// Placeholder mentors for demo
const PLACEHOLDER_MENTORS = [
  {
    id: "placeholder-1",
    username: "Maria Santos",
    program: "Chief Strategy Officer",
    photo_url:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
    bio: "15+ years of experience in corporate strategy and business transformation. Passionate about helping young professionals navigate their career paths.",
    skills: "Strategy, Leadership, Business Development",
    user_type: ["student"],
    year_standing: "Mentor",
    chat_link: "",
    created_at: new Date().toISOString(),
    user_id: "placeholder-1",
    chat_enabled: true,
  },
  {
    id: "placeholder-2",
    username: "Antonio Ramirez",
    program: "Senior Executive Advisor",
    photo_url:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
    bio: "Former CEO with expertise in organizational growth and digital transformation. Mentoring is my way of giving back to the community.",
    skills: "Executive Leadership, Digital Transformation, Scaling",
    user_type: ["student"],
    year_standing: "Mentor",
    chat_link: "",
    created_at: new Date().toISOString(),
    user_id: "placeholder-2",
    chat_enabled: true,
  },
  {
    id: "placeholder-3",
    username: "Teresa Lim",
    program: "Business Consultant",
    photo_url:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
    bio: "Specializing in startup consulting and market analysis. I help entrepreneurs turn ideas into successful businesses.",
    skills: "Consulting, Market Research, Startup Strategy",
    user_type: ["student"],
    year_standing: "Mentor",
    chat_link: "",
    created_at: new Date().toISOString(),
    user_id: "placeholder-3",
    chat_enabled: true,
  },
];

export default async function BrowsePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  // Fetch real mentors from database
  const { data: dbMentors } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Combine real mentors with placeholders
  const allMentors = [...(dbMentors || []), ...PLACEHOLDER_MENTORS];

  // Fetch connection requests if user is logged in
  let connectionRequests = [];
  if (user) {
    const { data } = await supabase
      .from("connection_requests")
      .select("*")
      .eq("requester_id", user.id);
    connectionRequests = data || [];
  }

  return (
    <BrowseFeedClient
      mentors={allMentors}
      currentUserId={user?.id}
      connectionRequests={connectionRequests}
    />
  );
}
