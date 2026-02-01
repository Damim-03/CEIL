import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import { HeroSection } from "../../components/hero-section";
//import { LanguagesSection } from "../../components/languages-section"
//import { AnnouncementsPreview } from "../../components/announcements-preview"
//import { CenterInfoPreview } from "../../components/center-info-preview"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}
