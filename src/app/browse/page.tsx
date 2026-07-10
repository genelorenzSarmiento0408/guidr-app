import { createClient } from "@/lib/supabase/server";
import BrowseFeedClient from "@/components/BrowseFeedClient";
import { redirect } from "next/navigation";

export default async function BrowsePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  const { data: dbMentors } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const allMentors = dbMentors || [];

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
