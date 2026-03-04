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
    redirect(`/${locale}/user/student`);
  }

  const displayName =
    profile?.display_name ??
    user.user_metadata?.display_name ??
    user.email?.split("@")[0] ??
    "User";

  const { data: instructor } = await supabase
    .from("instructors")
    .select("id, gender, birth_year, birth_month, certification_body, certification_number")
    .eq("user_id", user.id)
    .single();

  const meta = user.user_metadata ?? {};
  const gender = instructor?.gender ?? meta.gender ?? null;
  const birthYear = instructor?.birth_year ?? meta.birth_year ?? null;
  const birthMonth = instructor?.birth_month ?? meta.birth_month ?? null;
  const certificationBody = instructor?.certification_body ?? meta.certification_body ?? null;
  const certificationNumber = instructor?.certification_number ?? meta.certification_number ?? null;

  // Sync certification from signup metadata to instructors table when missing (so Eligible Lessons shows it)
  const metaHasCert =
    (meta.certification_body && String(meta.certification_body).trim()) ||
    (meta.certification_number && String(meta.certification_number).trim());
  const dbHasCert =
    (instructor?.certification_body && String(instructor.certification_body).trim()) ||
    (instructor?.certification_number && String(instructor.certification_number).trim());
  if (instructor?.id && metaHasCert && !dbHasCert) {
    await supabase
      .from("instructors")
      .update({
        certification_body: meta.certification_body ? String(meta.certification_body).trim() || null : null,
        certification_number: meta.certification_number ? String(meta.certification_number).trim() || null : null,
      })
      .eq("id", instructor.id);
  }

  return (
    <InstructorDashboard
      email={user.email ?? ""}
      displayName={displayName}
      gender={gender}
      birthYear={birthYear}
      birthMonth={birthMonth}
      certificationBody={certificationBody}
      certificationNumber={certificationNumber}
    />
  );
}
