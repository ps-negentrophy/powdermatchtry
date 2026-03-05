import { Link } from "@/i18n/navigation";

function GraduationCapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-2xl py-12">
      <h1 className="mb-10 text-center text-3xl font-bold text-slate-900">FAQ</h1>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Student gateway */}
        <Link
          href="/faq/student"
          className="group flex flex-col items-center rounded-2xl border-2 border-slate-200 bg-white p-8 text-center shadow-sm transition-all hover:border-powder-400 hover:shadow-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-600 group-hover:bg-sky-100">
            <GraduationCapIcon className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">I&apos;m a Student</h2>
          <p className="mt-2 text-sm text-slate-500">
            Where to meet up my instructor, when and how do I pay, can I cancel my confirmed lessons etc.
          </p>
          <span className="mt-6 inline-block rounded-lg bg-powder-500 px-5 py-2.5 text-sm font-semibold text-white group-hover:bg-powder-600">
            Student FAQ →
          </span>
        </Link>

        {/* Instructor gateway */}
        <Link
          href="/faq/instructor"
          className="group flex flex-col items-center rounded-2xl border-2 border-slate-200 bg-white p-8 text-center shadow-sm transition-all hover:border-powder-400 hover:shadow-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-600 group-hover:bg-sky-100">
            <UserIcon className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">I&apos;m an Instructor</h2>
          <p className="mt-2 text-sm text-slate-500">
            What are the requirements to register as instructor on Powder Match, how do I post my teaching availabilities etc.
          </p>
          <span className="mt-6 inline-block rounded-lg bg-powder-500 px-5 py-2.5 text-sm font-semibold text-white group-hover:bg-powder-600">
            Instructor FAQ →
          </span>
        </Link>
      </div>
    </div>
  );
}
