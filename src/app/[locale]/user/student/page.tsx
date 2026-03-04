import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentDashboard } from "@/components/StudentDashboard";

export default async function StudentUserPage({
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

  if (profile?.role === "instructor") {
    redirect(`/${locale}/user/instructor`);
  }

  const displayName =
    profile?.display_name ??
    user.user_metadata?.display_name ??
    user.email?.split("@")[0] ??
    "User";

  const { data: student } = await supabase
    .from("students")
    .select("gender, birth_year, birth_month")
    .eq("user_id", user.id)
    .single();

  const meta = user.user_metadata ?? {};
  // Fallback to signup metadata when student record has nulls (e.g. created before migration)
  const gender = student?.gender ?? meta.gender ?? null;
  const birthYear = student?.birth_year ?? meta.birth_year ?? null;
  const birthMonth = student?.birth_month ?? meta.birth_month ?? null;

  return (
    <StudentDashboard
      email={user.email ?? ""}
      displayName={displayName}
      gender={gender}
      birthYear={birthYear}
      birthMonth={birthMonth}
    />
  );
}
