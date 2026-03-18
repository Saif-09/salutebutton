import { siteConfig } from "@/constants/site";
import { Navbar } from "@/components/navbar";
import { HeroBanner } from "@/components/hero-banner";
import { GroupsBanner } from "@/components/groups-banner";
import { TrendingChart } from "@/components/trending-chart";
import { PersonGrid } from "@/components/person-grid";
import { Footer } from "@/components/footer";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteConfig.url}/leaderboard?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-12">
        <div className="mt-5 sm:mt-6">
          <HeroBanner />
        </div>
        <div className="mt-6">
          <GroupsBanner />
        </div>
        <div className="mt-6">
          <TrendingChart />
        </div>
        <div className="mt-6">
          <PersonGrid />
        </div>
      </main>
      <Footer />
    </>
  );
}
