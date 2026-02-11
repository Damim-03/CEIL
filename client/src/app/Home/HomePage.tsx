import { HeroSection } from "../../components/hero-section";
import { DirectorMessage } from "./Directormessage";
import { LanguagesSection } from "./LanguagesSection";
import { AnnouncementsPreview } from "./announcementspreview";
import { CenterInfoPreview } from "./center-info-preview";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <DirectorMessage />
      <AnnouncementsPreview />
      <LanguagesSection />
      <CenterInfoPreview />
    </>
  );
}