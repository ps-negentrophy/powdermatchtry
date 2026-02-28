import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function UserPage({
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
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "student";

  if (role === "instructor") {
    redirect(`/${locale}/user/instructor`);
  }

  redirect(`/${locale}/user/student`);
}
