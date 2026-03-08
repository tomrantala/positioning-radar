import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function PrivacyPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-zinc-900 hover:text-zinc-700 transition-colors">
            Positioning Radar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">{t("privacy.pageTitle")}</h1>
        <p className="text-sm text-zinc-400 mb-8">{t("privacy.lastUpdated")}</p>

        <div className="space-y-8 text-sm text-zinc-700 leading-relaxed">
          <p>{t("privacy.intro")}</p>

          <section>
            <h2 className="text-base font-semibold text-zinc-900 mb-3">{t("privacy.dataCollectedTitle")}</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>{t("privacy.dataCollected1")}</li>
              <li>{t("privacy.dataCollected2")}</li>
              <li>{t("privacy.dataCollected3")}</li>
              <li>{t("privacy.dataCollected4")}</li>
              <li>{t("privacy.dataCollected5")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900 mb-3">{t("privacy.howUsedTitle")}</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>{t("privacy.howUsed1")}</li>
              <li>{t("privacy.howUsed2")}</li>
              <li>{t("privacy.howUsed3")}</li>
              <li>{t("privacy.howUsed4")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900 mb-3">{t("privacy.retentionTitle")}</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>{t("privacy.retention1")}</li>
              <li>{t("privacy.retention2")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900 mb-3">{t("privacy.contactTitle")}</h2>
            <p>
              {t("privacy.contact")}{" "}
              <a href="mailto:tom@meom.fi" className="text-red-600 hover:text-red-700 underline">
                tom@meom.fi
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
