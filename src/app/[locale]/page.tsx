import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function HomePage() {
  const t = await getTranslations("home.hero");
  const tWorks = await getTranslations("home.howItWorks");

  return (
    <div className="space-y-16">
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

      <section className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">{tWorks("title")}</h2>
        <ol className="space-y-4 list-decimal list-inside text-slate-600">
          <li>{tWorks("step1")}</li>
          <li>{tWorks("step2")}</li>
          <li>{tWorks("step3")}</li>
        </ol>
      </section>
    </div>
  );
}
