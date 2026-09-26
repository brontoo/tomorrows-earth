import { useMemo } from "react";
import "../ecoverse/ecoverse.css";
import { EcoI18nProvider, useI18n } from "../ecoverse/i18n";
import { EcoGestureProvider } from "../ecoverse/gesture/GestureProvider";
import GestureCursor from "../ecoverse/gesture/GestureCursor";
import GestureChrome from "../ecoverse/gesture/GestureChrome";
import GestureTutorial from "../ecoverse/gesture/GestureTutorial";
import { useActiveSection } from "../ecoverse/lib/hooks";
import EcoNav from "../ecoverse/components/chrome/EcoNav";
import StageRail from "../ecoverse/components/chrome/StageRail";
import EcoFooter from "../ecoverse/components/chrome/EcoFooter";
import HeroPortal from "../ecoverse/components/hero/HeroPortal";
import WelcomeSection from "../ecoverse/components/sections/WelcomeSection";
import GameLoop from "../ecoverse/components/sections/GameLoop";
import MissionDemo from "../ecoverse/components/sections/MissionDemo";
import MissionUniverse from "../ecoverse/components/sections/MissionUniverse";
import RealMissions from "../ecoverse/components/sections/RealMissions";
import EvidenceFlow from "../ecoverse/components/sections/EvidenceFlow";
import RewardSystem from "../ecoverse/components/sections/RewardSystem";
import BadgeVault from "../ecoverse/components/sections/BadgeVault";
import ImpactSection from "../ecoverse/components/sections/ImpactSection";
import EcoJourney from "../ecoverse/components/sections/EcoJourney";
import VisionSection from "../ecoverse/components/sections/VisionSection";
import ExplorerCode from "../ecoverse/components/sections/ExplorerCode";
import SafetySection from "../ecoverse/components/sections/SafetySection";
import UAEAdventure from "../ecoverse/components/sections/UAEAdventure";
import FinalCTA from "../ecoverse/components/sections/FinalCTA";

/** Every narrative beat, in document order. Feeds the nav, rail and active state. */
const SECTION_IDS = [
  "portal",
  "welcome",
  "game-loop",
  "mission-demo",
  "universe",
  "real-missions",
  "evidence",
  "rewards",
  "badges",
  "impact",
  "journey",
  "vision",
  "code",
  "safety",
  "uae",
  "final",
] as const;

function EcoVerseDocument() {
  const { d, dir, locale } = useI18n();
  // A stable reference so the observer is not re-created on every render.
  const ids = useMemo(() => SECTION_IDS as unknown as string[], []);
  const active = useActiveSection(ids);

  return (
    // `dir` is also set on <html>, but the landing stylesheet scopes its RTL
    // rules to `.ecoverse[dir="rtl"]` so the subtree declares its own direction.
    // `id="ecoverse-root"` is the hook the gesture provider flips
    // `data-gesture="active"` on, which is what raises the custom cursor.
    <div
      id="ecoverse-root"
      className="ecoverse relative min-h-screen overflow-x-clip"
      dir={dir}
      lang={locale}
    >
      <a href="#welcome" className="ev-skip">
        {d.a11y.skipToContent}
      </a>

      <EcoNav active={active} />
      <StageRail active={active} />

      <main id="ev-main">
        <HeroPortal />
        <WelcomeSection />
        <GameLoop />
        <MissionDemo />
        <MissionUniverse />
        <RealMissions />
        <EvidenceFlow />
        <RewardSystem />
        <BadgeVault />
        <ImpactSection />
        <EcoJourney />
        <VisionSection />
        <ExplorerCode />
        <SafetySection />
        <UAEAdventure />
        <FinalCTA />
      </main>

      <EcoFooter />

      <GestureCursor />
      <GestureChrome />
      <GestureTutorial />
    </div>
  );
}

export default function EcoVerseLanding() {
  return (
    <EcoI18nProvider>
      <EcoGestureProvider>
        <EcoVerseDocument />
      </EcoGestureProvider>
    </EcoI18nProvider>
  );
}
