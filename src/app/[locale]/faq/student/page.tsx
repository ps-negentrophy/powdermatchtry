import { Link } from "@/i18n/navigation";

export default function StudentFAQPage() {
  return (
    <div className="mx-auto max-w-2xl py-12">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Student FAQ</h1>
      <p className="mb-6 text-sm text-slate-600">
        This page is under construction. Please check back later.
      </p>
      <Link
        href="/faq"
        className="text-sm text-powder-600 hover:underline"
      >
        ← Back to FAQ
      </Link>
    </div>
  );
}
