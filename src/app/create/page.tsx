import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CreatePostClient from "@/components/CreatePostClient";

export default async function CreatePostPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return <CreatePostClient />;
}
