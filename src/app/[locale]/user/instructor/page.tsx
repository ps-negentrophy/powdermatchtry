import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InstructorDashboard } from "@/components/InstructorDashboard";

export default async function InstructorUserPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login/student`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "instructor") {
    redirect(`/${locale}/user`);
  }

  const displayName =
    profile?.display_name ??
    user.user_metadata?.display_name ??
    user.email?.split("@")[0] ??
    "User";

  return (
    <InstructorDashboard
      email={user.email ?? ""}
      displayName={displayName}
    />
  );
}
