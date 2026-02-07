import { Button } from "../components/ui/button";
import { ArrowRight, BookOpen, Users, Award, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useHomeStats } from "../hooks/announce/Usepublic";

export function HeroSection() {
  const { data: stats } = useHomeStats();

  return (
    <section className="relative overflow-hidden bg-brand-gray min-h-[90vh] flex items-center">
      {/* ── Background Layers ── */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[60%] h-full bg-linear-to-bl from-brand-teal-dark/8 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[60%] bg-linear-to-tr from-brand-mustard/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-[15%] w-72 h-72 rounded-full border border-brand-teal/10 opacity-60" />
        <div className="absolute bottom-16 right-[25%] w-48 h-48 rounded-full border border-brand-mustard/15 opacity-50" />
        <div className="absolute top-[40%] left-[8%] w-24 h-24 rounded-full bg-brand-teal-dark/5" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-12 items-center">
          {/* ── Left: Content ── */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-teal-dark/8 border border-brand-teal/15 px-4 py-2 text-xs font-semibold text-brand-teal-dark tracking-wide uppercase animate-fade-up">
              <Sparkles className="w-3.5 h-3.5" />
              Language Training Center
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-brand-black leading-[1.1] tracking-tight animate-fade-up"
              style={{
                fontFamily: "var(--font-sans)",
                animationDelay: "100ms",
              }}
            >
              Learn Languages,{" "}
              <span className="relative inline-block">
                <span className="text-brand-teal-dark">Open Doors</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-brand-mustard/40"
                  viewBox="0 0 200 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 8C50 2 150 2 198 8"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p
              className="text-lg text-brand-black/55 leading-relaxed max-w-xl animate-fade-up"
              style={{ animationDelay: "200ms" }}
            >
              Start your language learning journey today with professional
              courses in English, French, German, Spanish, Italian, and more.
              Certified instructors, small groups, and flexible schedules.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-3 animate-fade-up"
              style={{ animationDelay: "300ms" }}
            >
              <Button
                size="lg"
                asChild
                className="bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white border-0 shadow-lg shadow-brand-teal-dark/20 px-8 h-13 text-base font-semibold rounded-xl"
              >
                <Link to="/register">
                  Register Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-brand-beige text-brand-black hover:bg-brand-teal-dark hover:text-white hover:border-brand-teal-dark px-8 h-13 text-base rounded-xl"
              >
                <a href="#languages">View Courses</a>
              </Button>
            </div>

            <div
              className="flex items-center gap-8 pt-6 animate-fade-up"
              style={{ animationDelay: "400ms" }}
            >
              <StatItem
                value={
                  stats?.languages_count
                    ? `${stats.languages_count}+`
                    : "6+"
                }
                label="Languages"
              />
              <div className="w-px h-10 bg-brand-beige" />
              <StatItem value="4" label="Skill Levels" />
              <div className="w-px h-10 bg-brand-beige" />
              <StatItem
                value={
                  stats?.students_count
                    ? `${stats.students_count}+`
                    : "500+"
                }
                label="Students"
              />
            </div>
          </div>

          {/* ── Right: Feature Cards ── */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard
              icon={<BookOpen className="h-5 w-5" />}
              title="Structured Curriculum"
              description="Follow internationally recognized CEFR levels from A1 to C2 with comprehensive materials."
              color="teal"
              delay={200}
            />
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title="Small Group Classes"
              description="Learn in intimate groups for maximum interaction and personalized attention."
              color="mustard"
              delay={300}
            />
            <FeatureCard
              icon={<Award className="h-5 w-5" />}
              title="Certified Instructors"
              description="Learn from native speakers and certified language professionals."
              color="brown"
              delay={400}
            />
            <FeatureCard
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              title="Flexible Schedule"
              description="Morning, afternoon, evening, or weekend classes that fit your lifestyle."
              color="teal"
              delay={500}
            />
          </div>
        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
          <path
            d="M0 60L48 54C96 48 192 36 288 30C384 24 480 24 576 28C672 32 768 40 864 42C960 44 1056 40 1152 36C1248 32 1344 28 1392 26L1440 24V60H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight">
        {value}
      </p>
      <p className="text-xs text-brand-brown font-medium mt-0.5 tracking-wide uppercase">
        {label}
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "teal" | "mustard" | "brown";
  delay: number;
}) {
  const colorMap = {
    teal: {
      bg: "bg-brand-teal-dark/8",
      icon: "text-brand-teal-dark",
      border: "hover:border-brand-teal/30",
    },
    mustard: {
      bg: "bg-brand-mustard/10",
      icon: "text-brand-mustard-dark",
      border: "hover:border-brand-mustard/30",
    },
    brown: {
      bg: "bg-brand-brown/8",
      icon: "text-brand-brown",
      border: "hover:border-brand-brown/30",
    },
  };
  const c = colorMap[color];

  return (
    <div
      className={`group rounded-2xl border border-brand-beige bg-white p-6 transition-all duration-300 hover:shadow-lg ${c.border} animate-fade-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${c.bg} ${c.icon} transition-transform group-hover:scale-110`}
      >
        {icon}
      </div>
      <h3
        className="mb-2 font-bold text-brand-black"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {title}
      </h3>
      <p className="text-sm text-brand-black/50 leading-relaxed">
        {description}
      </p>
    </div>
  );
}