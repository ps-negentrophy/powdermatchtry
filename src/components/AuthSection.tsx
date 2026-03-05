"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function AuthSection() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut();
      router.refresh();
    }
  }

  if (loading) return null;

  if (supabase && user) {
    const role = (user.user_metadata?.role as string | undefined) ?? "student";
    const myPageLabel = role === "instructor" ? t("myPageInstructor") : t("myPageStudent");
    const myPageHref = role === "instructor" ? "/user/instructor" : "/user/student";

    return (
      <div className="flex items-center gap-4">
        <Link
          href={myPageHref}
          className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
        >
          {myPageLabel}
        </Link>
        <button
          onClick={handleLogout}
          className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
        >
          {t("logout")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
      >
        {t("login")}
      </Link>
      <Link
        href="/signup"
        className="rounded-lg bg-powder-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-powder-600 transition-colors"
      >
        {t("signUp")}
      </Link>
    </div>
  );
}
