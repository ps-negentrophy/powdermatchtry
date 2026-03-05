import { Link } from "@/i18n/navigation";

function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-600">
          <a
            href="mailto:hello@placeholder.com"
            className="flex items-center gap-2 hover:text-slate-900 transition-colors"
          >
            <EnvelopeIcon className="h-4 w-4 shrink-0" />
            hello@placeholder.com
          </a>
          <a
            href="tel:+85212345678"
            className="flex items-center gap-2 hover:text-slate-900 transition-colors"
          >
            <PhoneIcon className="h-4 w-4 shrink-0" />
            +852-1234-5678
          </a>
          <span className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 shrink-0" />
            Japan / Hong Kong
          </span>
          <div className="flex items-center gap-2">
            <Link href="/privacy" className="text-powder-600 hover:text-powder-700 hover:underline">
              Privacy Policy
            </Link>
            <span className="text-slate-400">•</span>
            <Link href="/faq" className="text-powder-600 hover:text-powder-700 hover:underline">
              FAQ
            </Link>
          </div>
          <p className="text-slate-500">
            © 2026 PowderMatch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
