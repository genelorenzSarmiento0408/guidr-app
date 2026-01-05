import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RegisterClient from "@/components/RegisterClient";

export default async function RegisterPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is already logged in, redirect to home
  if (user) {
    redirect("/");
  }

  return <RegisterClient />;
}
