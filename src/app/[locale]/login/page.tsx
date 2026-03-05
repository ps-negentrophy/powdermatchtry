"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LoginPage() {
  const t = useTranslations("auth");
  const tSignup = useTranslations("signup");

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">{t("loginChooseRole")}</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Student card */}
        <Link
          href="/login/student"
          className="group flex flex-col items-start gap-4 rounded-2xl border-2 border-slate-200 bg-white p-8 text-left shadow-sm transition-all hover:border-powder-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-powder-400"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-powder-50 text-powder-600 group-hover:bg-powder-100">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{tSignup("studentCard")}</p>
            <p className="mt-1 text-sm text-slate-500">{tSignup("studentCardDesc")}</p>
          </div>
          <span className="mt-auto rounded-full bg-powder-500 px-4 py-1.5 text-xs font-semibold text-white group-hover:bg-powder-600">
            {tSignup("studentCard")} →
          </span>
        </Link>

        {/* Instructor card */}
        <Link
          href="/login/instructor"
          className="group flex flex-col items-start gap-4 rounded-2xl border-2 border-slate-200 bg-white p-8 text-left shadow-sm transition-all hover:border-powder-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-powder-400"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-powder-50 text-powder-600 group-hover:bg-powder-100">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{tSignup("instructorCard")}</p>
            <p className="mt-1 text-sm text-slate-500">{tSignup("instructorCardDesc")}</p>
          </div>
          <span className="mt-auto rounded-full bg-powder-500 px-4 py-1.5 text-xs font-semibold text-white group-hover:bg-powder-600">
            {tSignup("instructorCard")} →
          </span>
        </Link>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        {t("noAccount")}{" "}
        <Link href="/signup" className="font-medium text-powder-600 hover:underline">
          {t("signUp")}
        </Link>
      </p>
    </div>
  );
}
