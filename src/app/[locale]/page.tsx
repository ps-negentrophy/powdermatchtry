import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function HomePage() {
  const t = await getTranslations("home.hero");
  const tWorks = await getTranslations("home.howItWorks");

  return (
    <div className="space-y-8">
      <section
        className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden rounded-2xl"
        style={{
          backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.75), rgba(248, 250, 252, 0.6)), url('/images/kiroro-hero.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 drop-shadow-sm">
            {t("title")}
          </h1>
          <p className="text-xl text-slate-700 max-w-2xl mx-auto drop-shadow-sm">
            {t("subtitle")}
          </p>
          <Link
            href="/find"
            className="inline-block px-8 py-4 bg-powder-500 text-white font-semibold rounded-lg hover:bg-powder-600 transition-colors shadow-md"
          >
            {t("cta")}
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-900">{tWorks("title")}</h2>
        <ol className="flex flex-col gap-3 text-sm text-slate-600">
          <li className="flex items-start gap-2"><span className="font-semibold text-powder-500 shrink-0">1.</span>{tWorks("step1")}</li>
          <li className="flex items-start gap-2"><span className="font-semibold text-powder-500 shrink-0">2.</span>{tWorks("step2")}</li>
          <li className="flex items-start gap-2"><span className="font-semibold text-powder-500 shrink-0">3.</span>{tWorks("step3")}</li>
        </ol>
      </section>
    </div>
  );
}
