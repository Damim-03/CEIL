import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  Smartphone,
  GraduationCap,
  Users,
  CreditCard,
  Bell,
  FileCheck,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Shield,
  Globe,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

// ─── Platform Screenshots Data ───────────────────────────

interface PlatformScreen {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ComponentType<{ className?: string }>;
  desktopGradient: string;
  mobileGradient: string;
  color: string;
  features: string[];
}

const platformScreens: PlatformScreen[] = [
  {
    id: "dashboard",
    titleKey: "platform.screens.dashboard.title",
    descriptionKey: "platform.screens.dashboard.description",
    icon: BarChart3,
    desktopGradient: "from-[#2B6F5E] to-[#1a4a3a]",
    mobileGradient: "from-[#2B6F5E] to-[#1a4a3a]",
    color: "#2B6F5E",
    features: [
      "platform.screens.dashboard.f1",
      "platform.screens.dashboard.f2",
      "platform.screens.dashboard.f3",
    ],
  },
  {
    id: "courses",
    titleKey: "platform.screens.courses.title",
    descriptionKey: "platform.screens.courses.description",
    icon: BookOpen,
    desktopGradient: "from-[#C8A96E] to-[#a88b4a]",
    mobileGradient: "from-[#C8A96E] to-[#a88b4a]",
    color: "#C8A96E",
    features: [
      "platform.screens.courses.f1",
      "platform.screens.courses.f2",
      "platform.screens.courses.f3",
    ],
  },
  {
    id: "enrollment",
    titleKey: "platform.screens.enrollment.title",
    descriptionKey: "platform.screens.enrollment.description",
    icon: GraduationCap,
    desktopGradient: "from-[#4A90A4] to-[#2d6a7e]",
    mobileGradient: "from-[#4A90A4] to-[#2d6a7e]",
    color: "#4A90A4",
    features: [
      "platform.screens.enrollment.f1",
      "platform.screens.enrollment.f2",
      "platform.screens.enrollment.f3",
    ],
  },
  {
    id: "students",
    titleKey: "platform.screens.students.title",
    descriptionKey: "platform.screens.students.description",
    icon: Users,
    desktopGradient: "from-[#6B5D4F] to-[#4a3f35]",
    mobileGradient: "from-[#6B5D4F] to-[#4a3f35]",
    color: "#6B5D4F",
    features: [
      "platform.screens.students.f1",
      "platform.screens.students.f2",
      "platform.screens.students.f3",
    ],
  },
  {
    id: "payments",
    titleKey: "platform.screens.payments.title",
    descriptionKey: "platform.screens.payments.description",
    icon: CreditCard,
    desktopGradient: "from-[#2B6F5E] to-[#C8A96E]",
    mobileGradient: "from-[#2B6F5E] to-[#C8A96E]",
    color: "#2B6F5E",
    features: [
      "platform.screens.payments.f1",
      "platform.screens.payments.f2",
      "platform.screens.payments.f3",
    ],
  },
  {
    id: "attendance",
    titleKey: "platform.screens.attendance.title",
    descriptionKey: "platform.screens.attendance.description",
    icon: ClipboardCheck,
    desktopGradient: "from-[#8DB896] to-[#2B6F5E]",
    mobileGradient: "from-[#8DB896] to-[#2B6F5E]",
    color: "#8DB896",
    features: [
      "platform.screens.attendance.f1",
      "platform.screens.attendance.f2",
      "platform.screens.attendance.f3",
    ],
  },
];

// ─── Desktop Mockup Component ────────────────────────────

const DesktopMockup = ({
  screen,
  isActive,
}: {
  screen: PlatformScreen;
  isActive: boolean;
}) => {
  const { t } = useTranslation();
  const Icon = screen.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.95 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`absolute inset-0 ${isActive ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* Monitor Frame */}
      <div className="relative mx-auto max-w-[680px]">
        {/* Screen bezel */}
        <div className="rounded-2xl border-[6px] border-[#1B1B1B] bg-[#1B1B1B] shadow-2xl shadow-black/30 overflow-hidden">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#2a2a2a]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 mx-8">
              <div className="bg-[#3a3a3a] rounded-md px-3 py-1 text-[10px] text-gray-400 text-center font-mono">
                ceil.univ-ouargla.dz/admin
              </div>
            </div>
          </div>

          {/* Screen content */}
          <div
            className={`relative bg-gradient-to-br ${screen.desktopGradient} aspect-[16/10] flex`}
          >
            {/* Sidebar mock */}
            <div className="w-14 bg-white/10 backdrop-blur-sm border-r border-white/10 flex flex-col items-center py-4 gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/20" />
              <div className="w-6 h-[1px] bg-white/20 my-1" />
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-lg ${i === 0 ? "bg-white/30" : "bg-white/10"}`}
                />
              ))}
            </div>

            {/* Main content area */}
            <div className="flex-1 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="h-3 w-32 bg-white/30 rounded mb-2" />
                  <div className="h-2 w-48 bg-white/15 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/15" />
                  <div className="w-8 h-8 rounded-full bg-white/15" />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"
                  >
                    <div className="h-2 w-12 bg-white/20 rounded mb-2" />
                    <div className="h-4 w-8 bg-white/30 rounded" />
                  </div>
                ))}
              </div>

              {/* Main card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${screen.color}40` }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="h-2.5 w-24 bg-white/30 rounded mb-1.5" />
                    <div className="h-2 w-40 bg-white/15 rounded" />
                  </div>
                </div>
                {/* Table rows */}
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2.5 border-t border-white/5"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/15" />
                    <div className="flex-1">
                      <div className="h-2 w-24 bg-white/20 rounded" />
                    </div>
                    <div className="h-2 w-16 bg-white/15 rounded" />
                    <div className="h-5 w-14 bg-white/10 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Monitor stand */}
        <div className="flex justify-center">
          <div className="w-24 h-5 bg-gradient-to-b from-[#2a2a2a] to-[#1B1B1B] rounded-b-lg" />
        </div>
        <div className="flex justify-center -mt-0.5">
          <div className="w-40 h-2 bg-[#2a2a2a] rounded-b-xl" />
        </div>
      </div>
    </motion.div>
  );
};

// ─── Mobile Mockup Component ─────────────────────────────

const MobileMockup = ({
  screen,
  isActive,
}: {
  screen: PlatformScreen;
  isActive: boolean;
}) => {
  const Icon = screen.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`absolute inset-0 flex justify-center ${isActive ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* Phone Frame */}
      <div className="relative w-[260px]">
        <div className="rounded-[2.5rem] border-[5px] border-[#1B1B1B] bg-[#1B1B1B] shadow-2xl shadow-black/40 overflow-hidden">
          {/* Notch */}
          <div className="relative bg-[#1B1B1B] flex justify-center py-2">
            <div className="w-24 h-5 bg-[#1B1B1B] rounded-b-2xl absolute -top-1 z-10" />
          </div>

          {/* Screen content */}
          <div
            className={`relative bg-gradient-to-br ${screen.mobileGradient} aspect-[9/18]`}
          >
            {/* Status bar */}
            <div className="flex items-center justify-between px-5 pt-3 pb-2">
              <div className="h-1.5 w-8 bg-white/30 rounded" />
              <div className="flex gap-1">
                <div className="h-1.5 w-3 bg-white/30 rounded" />
                <div className="h-1.5 w-3 bg-white/30 rounded" />
                <div className="h-1.5 w-5 bg-white/30 rounded" />
              </div>
            </div>

            {/* App header */}
            <div className="px-4 pt-2 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="h-2.5 w-20 bg-white/30 rounded mb-1.5" />
                  <div className="h-1.5 w-28 bg-white/15 rounded" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/15" />
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10"
                  >
                    <div className="h-1.5 w-8 bg-white/20 rounded mb-1.5" />
                    <div className="h-3 w-6 bg-white/30 rounded" />
                  </div>
                ))}
              </div>

              {/* Content card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${screen.color}40` }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="h-2 w-16 bg-white/25 rounded" />
                </div>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-2 border-t border-white/5"
                  >
                    <div className="w-5 h-5 rounded-full bg-white/15" />
                    <div className="flex-1 h-1.5 bg-white/15 rounded" />
                    <div className="h-4 w-10 bg-white/10 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom nav */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/10 px-4 py-2.5 flex justify-around">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-5 h-5 rounded-md ${i === 0 ? "bg-white/30" : "bg-white/15"}`}
                  />
                  <div className="h-1 w-5 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Phone reflection */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
};

// ─── Feature Card ────────────────────────────────────────

const FeatureCard = ({
  icon: Icon,
  titleKey,
  descKey,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  descKey: string;
  index: number;
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative bg-white rounded-2xl p-6 border border-[#D8CDC0]/30 hover:border-[#2B6F5E]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#2B6F5E]/5"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2B6F5E]/10 to-[#8DB896]/10 flex items-center justify-center mb-4 group-hover:from-[#2B6F5E]/20 group-hover:to-[#8DB896]/20 transition-colors">
        <Icon className="w-6 h-6 text-[#2B6F5E]" />
      </div>
      <h3 className="text-base font-bold text-[#1B1B1B] mb-2">
        {t(titleKey)}
      </h3>
      <p className="text-sm text-[#6B5D4F] leading-relaxed">{t(descKey)}</p>
    </motion.div>
  );
};

// ─── Main Component ──────────────────────────────────────

const OurPlatform = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [activeScreen, setActiveScreen] = useState(0);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  const nextScreen = () => {
    setActiveScreen((prev) => (prev + 1) % platformScreens.length);
  };

  const prevScreen = () => {
    setActiveScreen(
      (prev) =>
        (prev - 1 + platformScreens.length) % platformScreens.length,
    );
  };

  const features = [
    {
      icon: GraduationCap,
      titleKey: "platform.features.enrollment.title",
      descKey: "platform.features.enrollment.desc",
    },
    {
      icon: Users,
      titleKey: "platform.features.management.title",
      descKey: "platform.features.management.desc",
    },
    {
      icon: CreditCard,
      titleKey: "platform.features.payments.title",
      descKey: "platform.features.payments.desc",
    },
    {
      icon: Bell,
      titleKey: "platform.features.notifications.title",
      descKey: "platform.features.notifications.desc",
    },
    {
      icon: FileCheck,
      titleKey: "platform.features.documents.title",
      descKey: "platform.features.documents.desc",
    },
    {
      icon: Shield,
      titleKey: "platform.features.security.title",
      descKey: "platform.features.security.desc",
    },
  ];

  const currentScreen = platformScreens[activeScreen];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[#FAF8F5]">
      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative overflow-hidden pt-20 pb-12">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #2B6F5E 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#2B6F5E]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#C8A96E]/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2B6F5E]/8 border border-[#2B6F5E]/15">
              <Sparkles className="w-4 h-4 text-[#C8A96E]" />
              <span className="text-sm font-semibold text-[#2B6F5E]">
                {t("platform.badge")}
              </span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center max-w-3xl mx-auto mb-4"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1B1B1B] leading-tight mb-4">
              {t("platform.title.line1")}
              <span className="block text-[#2B6F5E]">
                {t("platform.title.line2")}
              </span>
            </h1>
            <p className="text-lg text-[#6B5D4F] max-w-2xl mx-auto leading-relaxed">
              {t("platform.subtitle")}
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-8 sm:gap-16 mt-8 mb-16"
          >
            {[
              {
                value: "3",
                labelKey: "platform.stats.roles",
              },
              {
                value: "15+",
                labelKey: "platform.stats.features",
              },
              {
                value: "3",
                labelKey: "platform.stats.languages",
              },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-extrabold text-[#2B6F5E]">
                  {stat.value}
                </div>
                <div className="text-sm text-[#6B5D4F] mt-1">
                  {t(stat.labelKey)}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ DEVICE SHOWCASE ═══════════ */}
      <section className="relative py-16 bg-gradient-to-b from-[#FAF8F5] to-[#f0ece6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* View mode toggle */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center bg-white rounded-2xl p-1.5 shadow-sm border border-[#D8CDC0]/30">
              <button
                onClick={() => setViewMode("desktop")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  viewMode === "desktop"
                    ? "bg-[#2B6F5E] text-white shadow-md shadow-[#2B6F5E]/20"
                    : "text-[#6B5D4F] hover:text-[#1B1B1B]"
                }`}
              >
                <Monitor className="w-4 h-4" />
                {t("platform.desktop")}
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  viewMode === "mobile"
                    ? "bg-[#2B6F5E] text-white shadow-md shadow-[#2B6F5E]/20"
                    : "text-[#6B5D4F] hover:text-[#1B1B1B]"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                {t("platform.mobile")}
              </button>
            </div>
          </div>

          {/* Screen info */}
          <div className="text-center mb-8">
            <motion.div
              key={activeScreen}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 mb-2"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${currentScreen.color}15` }}
              >
                <currentScreen.icon
                  className="w-5 h-5"
                  style={{ color: currentScreen.color }}
                />
              </div>
              <h3 className="text-2xl font-bold text-[#1B1B1B]">
                {t(currentScreen.titleKey)}
              </h3>
            </motion.div>
            <motion.p
              key={`desc-${activeScreen}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[#6B5D4F] max-w-lg mx-auto"
            >
              {t(currentScreen.descriptionKey)}
            </motion.p>
          </div>

          {/* Device Mockup Area */}
          <div className="relative">
            {/* Navigation arrows */}
            <button
              onClick={isRTL ? nextScreen : prevScreen}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-[#D8CDC0]/30 flex items-center justify-center text-[#6B5D4F] hover:text-[#2B6F5E] hover:border-[#2B6F5E]/30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={isRTL ? prevScreen : nextScreen}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-[#D8CDC0]/30 flex items-center justify-center text-[#6B5D4F] hover:text-[#2B6F5E] hover:border-[#2B6F5E]/30 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Mockup container */}
            <div
              className={`relative mx-auto ${viewMode === "desktop" ? "max-w-[740px] h-[460px]" : "max-w-[300px] h-[520px]"} transition-all duration-500`}
            >
              <AnimatePresence>
                {platformScreens.map((screen, index) =>
                  viewMode === "desktop" ? (
                    <DesktopMockup
                      key={screen.id}
                      screen={screen}
                      isActive={index === activeScreen}
                    />
                  ) : (
                    <MobileMockup
                      key={screen.id}
                      screen={screen}
                      isActive={index === activeScreen}
                    />
                  ),
                )}
              </AnimatePresence>
            </div>

            {/* Features list for current screen */}
            <motion.div
              key={`features-${activeScreen}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-3 mt-8"
            >
              {currentScreen.features.map((featureKey, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-[#D8CDC0]/30 shadow-sm"
                >
                  <CheckCircle2
                    className="w-4 h-4 shrink-0"
                    style={{ color: currentScreen.color }}
                  />
                  <span className="text-sm font-medium text-[#1B1B1B]">
                    {t(featureKey)}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {platformScreens.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveScreen(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === activeScreen
                      ? "w-8 h-2.5 bg-[#2B6F5E]"
                      : "w-2.5 h-2.5 bg-[#D8CDC0] hover:bg-[#BEB29E]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES GRID ═══════════ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B1B1B] mb-4">
              {t("platform.features.title")}
            </h2>
            <p className="text-lg text-[#6B5D4F] max-w-2xl mx-auto">
              {t("platform.features.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.titleKey}
                icon={feature.icon}
                titleKey={feature.titleKey}
                descKey={feature.descKey}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ROLES SECTION ═══════════ */}
      <section className="py-20 bg-gradient-to-b from-[#f0ece6] to-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B1B1B] mb-4">
              {t("platform.roles.title")}
            </h2>
            <p className="text-lg text-[#6B5D4F]">
              {t("platform.roles.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                role: "admin",
                icon: Shield,
                color: "#2B6F5E",
                gradient: "from-[#2B6F5E] to-[#1a4a3a]",
                items: [
                  "platform.roles.admin.f1",
                  "platform.roles.admin.f2",
                  "platform.roles.admin.f3",
                  "platform.roles.admin.f4",
                  "platform.roles.admin.f5",
                ],
              },
              {
                role: "teacher",
                icon: BookOpen,
                color: "#C8A96E",
                gradient: "from-[#C8A96E] to-[#a88b4a]",
                items: [
                  "platform.roles.teacher.f1",
                  "platform.roles.teacher.f2",
                  "platform.roles.teacher.f3",
                  "platform.roles.teacher.f4",
                  "platform.roles.teacher.f5",
                ],
              },
              {
                role: "student",
                icon: GraduationCap,
                color: "#4A90A4",
                gradient: "from-[#4A90A4] to-[#2d6a7e]",
                items: [
                  "platform.roles.student.f1",
                  "platform.roles.student.f2",
                  "platform.roles.student.f3",
                  "platform.roles.student.f4",
                  "platform.roles.student.f5",
                ],
              },
            ].map((roleData, index) => (
              <motion.div
                key={roleData.role}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-white rounded-2xl overflow-hidden border border-[#D8CDC0]/30 hover:shadow-xl transition-shadow duration-300"
              >
                {/* Card header */}
                <div
                  className={`bg-gradient-to-br ${roleData.gradient} p-6 text-white`}
                >
                  <roleData.icon className="w-8 h-8 mb-3 opacity-80" />
                  <h3 className="text-xl font-bold">
                    {t(`platform.roles.${roleData.role}.title`)}
                  </h3>
                  <p className="text-white/70 text-sm mt-1">
                    {t(`platform.roles.${roleData.role}.desc`)}
                  </p>
                </div>

                {/* Features list */}
                <div className="p-6">
                  <ul className="space-y-3">
                    {roleData.items.map((itemKey, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2
                          className="w-5 h-5 shrink-0 mt-0.5"
                          style={{ color: roleData.color }}
                        />
                        <span className="text-sm text-[#6B5D4F]">
                          {t(itemKey)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ MULTILINGUAL SECTION ═══════════ */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-[#2B6F5E] to-[#1a4a3a] rounded-3xl p-10 text-center text-white overflow-hidden"
          >
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: "30px 30px",
                }}
              />
            </div>

            <div className="relative z-10">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-60" />
              <h2 className="text-3xl font-extrabold mb-3">
                {t("platform.multilingual.title")}
              </h2>
              <p className="text-white/70 max-w-xl mx-auto mb-8">
                {t("platform.multilingual.desc")}
              </p>

              <div className="flex justify-center gap-4 flex-wrap">
                {[
                  { lang: "العربية", flag: "🇩🇿", code: "AR" },
                  { lang: "Français", flag: "🇫🇷", code: "FR" },
                  { lang: "English", flag: "🇬🇧", code: "EN" },
                ].map((item) => (
                  <div
                    key={item.code}
                    className="flex items-center gap-3 px-5 py-3 bg-white/10 rounded-xl border border-white/15 backdrop-blur-sm"
                  >
                    <span className="text-2xl">{item.flag}</span>
                    <div className="text-start">
                      <div className="text-sm font-bold">{item.lang}</div>
                      <div className="text-[10px] text-white/50">
                        {item.code}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default OurPlatform;