import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  UserPlus,
  Loader2,
  Globe,
  GraduationCap,
  Search,
  Sparkles,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { usePublicCourses } from "../../hooks/announce/Usepublic";
import type { PublicCourse } from "../../lib/api/announce/announce.api";

function getStatus(course: PublicCourse) {
  if (!course.registration_open) return { key: "closed", label: "Closed" };
  if (course.capacity > 0 && course.enrolled >= course.capacity)
    return { key: "closed", label: "Full" };
  return { key: "open", label: "Open" };
}

const formatDate = (date: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatPrice = (price: number | null, currency: string = "DA") => {
  if (!price) return "Free";
  return `${Number(price).toLocaleString("fr-FR")} ${currency}`;
};

function CourseCard({
  course,
  index,
}: {
  course: PublicCourse;
  index: number;
}) {
  const status = getStatus(course);
  const isOpen = status.key === "open";
  const fillPercent =
    course.capacity > 0
      ? Math.min((course.enrolled / course.capacity) * 100, 100)
      : 0;

  return (
    <div
      className="group flex flex-col rounded-2xl border border-brand-beige bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-brand-teal-dark/5 hover:-translate-y-1 hover:border-brand-teal/20 animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* ── Header ── */}
      <div className="relative p-6 pb-5 overflow-hidden">
        {/* Background: image or gradient */}
        {course.image_url ? (
          <>
            <img
              src={course.image_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-br from-brand-teal-dark/80 via-brand-teal-dark/70 to-brand-teal/65" />
          </>
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-brand-teal-dark via-brand-teal-dark to-brand-teal" />
        )}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full border border-white/10" />
          <div className="absolute bottom-2 left-4 w-16 h-16 rounded-full border border-white/5" />
        </div>

        <div className="relative flex items-start justify-between mb-4">
          {course.flag_emoji ? (
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
              {course.flag_emoji}
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white/70" />
            </div>
          )}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
              isOpen
                ? "bg-emerald-400/90 text-white"
                : "bg-red-400/90 text-white"
            }`}
          >
            {isOpen ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            {status.label}
          </span>
        </div>

        <div className="relative">
          <h3
            className="text-white text-lg font-bold leading-snug"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {course.course_name}
          </h3>
          {course.title_ar && (
            <p className="text-white/60 text-sm mt-1" dir="rtl">
              {course.title_ar}
            </p>
          )}
        </div>

        <div className="relative flex items-center gap-2 mt-4 flex-wrap">
          {course.language && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 text-white text-[11px] font-semibold backdrop-blur-sm border border-white/10">
              <Globe className="w-3 h-3" />
              {course.language}
            </span>
          )}
          {course.level && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-mustard/90 text-white text-[11px] font-semibold">
              <GraduationCap className="w-3 h-3" />
              {course.level}
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 p-5 space-y-4">
        {(course.description || course.description_ar) && (
          <p className="text-sm text-brand-black/55 leading-relaxed line-clamp-2">
            {course.description || course.description_ar}
          </p>
        )}

        <div className="space-y-2.5">
          {course.session_name && (
            <InfoRow
              icon={<Sparkles className="w-3.5 h-3.5" />}
              label="Session"
              value={course.session_name}
            />
          )}
          <InfoRow
            icon={<Calendar className="w-3.5 h-3.5" />}
            label="Start"
            value={formatDate(course.start_date)}
          />
          <InfoRow
            icon={<Clock className="w-3.5 h-3.5" />}
            label="End"
            value={formatDate(course.end_date)}
          />
        </div>

        <div className="pt-1">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-brand-brown flex items-center gap-1">
              <Users className="w-3 h-3" />
              Enrolled
            </span>
            <span className="font-semibold text-brand-black">
              {course.enrolled} / {course.capacity || "∞"}
            </span>
          </div>
          {course.capacity > 0 && (
            <div className="h-1.5 bg-brand-beige rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  fillPercent >= 90
                    ? "bg-red-400"
                    : fillPercent >= 60
                      ? "bg-brand-mustard"
                      : "bg-brand-teal-dark"
                }`}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-brand-beige/60">
          <span className="text-xs text-brand-brown">Starting from</span>
          <span className="text-lg font-bold text-brand-teal-dark">
            {formatPrice(course.price, course.currency)}
          </span>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="p-5 pt-0 flex gap-2.5">
        {isOpen && (
          <Button
            asChild
            className="flex-1 bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white border-0 gap-2 rounded-xl h-11 font-semibold shadow-md shadow-brand-teal-dark/15"
          >
            <Link to={`/register?course=${course.id}`}>
              <UserPlus className="w-4 h-4" />
              Register
            </Link>
          </Button>
        )}
        <Button
          variant="outline"
          asChild
          className={`${isOpen ? "flex-1" : "w-full"} border-brand-beige text-brand-teal-dark hover:bg-brand-teal-dark hover:text-white hover:border-brand-teal-dark gap-2 rounded-xl h-11`}
        >
          <Link to={`/courses/${course.id}`}>
            <BookOpen className="w-4 h-4" />
            More Info
          </Link>
        </Button>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <span className="text-brand-brown/50 shrink-0">{icon}</span>
      <span className="text-brand-brown">{label}</span>
      <span className="ml-auto font-semibold text-brand-black text-[13px]">
        {value}
      </span>
    </div>
  );
}

export default function CoursesHomePage() {
  const { data, isLoading } = usePublicCourses({ page: 1, limit: 20 });
  const courses = data?.data || [];
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState(
    searchParams.get("language")?.toLowerCase() || "all",
  );

  // Sync langFilter with URL
  useEffect(() => {
    const urlLang = searchParams.get("language")?.toLowerCase();
    if (urlLang && urlLang !== langFilter) {
      setLangFilter(urlLang);
    }
  }, [langFilter, searchParams]);

  const handleLangFilter = (lang: string) => {
    setLangFilter(lang);
    if (lang === "all") {
      searchParams.delete("language");
    } else {
      searchParams.set("language", lang);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const languages = Array.from(
    new Set(courses.map((c) => c.language?.toLowerCase()).filter(Boolean)),
  );

  const filtered = courses.filter((c) => {
    const matchSearch =
      !search ||
      c.course_name.toLowerCase().includes(search.toLowerCase()) ||
      c.title_ar?.toLowerCase().includes(search.toLowerCase()) ||
      c.language?.toLowerCase().includes(search.toLowerCase());
    const matchLang =
      langFilter === "all" || c.language?.toLowerCase() === langFilter;
    return matchSearch && matchLang;
  });

  return (
    <div className="min-h-screen bg-brand-gray relative">
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <div
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
          className="w-full h-full"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* ── Header ── */}
        <div className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-teal-dark/8 border border-brand-teal/15 px-4 py-2 text-xs font-semibold text-brand-teal-dark tracking-wide uppercase mb-4">
            <GraduationCap className="w-3.5 h-3.5" />
            Explore Our Programs
          </div>
          <h1
            className="text-3xl font-bold text-brand-black sm:text-4xl"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Available <span className="text-brand-teal-dark">Courses</span>
          </h1>
          <div className="flex justify-center mt-3">
            <div className="w-14 h-1 rounded-full bg-brand-mustard" />
          </div>
          <p className="mt-4 text-brand-black/55 max-w-lg mx-auto">
            Discover our language programs and register for the course that fits
            your goals
          </p>
        </div>

        {/* ── Filters ── */}
        <div
          className="flex flex-col sm:flex-row items-center gap-3 mb-8 animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-brown/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-11 pr-4 h-11 rounded-xl border border-brand-beige bg-white text-sm text-brand-black placeholder:text-brand-brown/40 focus:outline-none focus:border-brand-teal/40 focus:ring-2 focus:ring-brand-teal/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleLangFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                langFilter === "all"
                  ? "bg-brand-teal-dark text-white shadow-md shadow-brand-teal-dark/20"
                  : "bg-white border border-brand-beige text-brand-brown hover:border-brand-teal/30"
              }`}
            >
              All
            </button>
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLangFilter(lang!)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${
                  langFilter === lang
                    ? "bg-brand-teal-dark text-white shadow-md shadow-brand-teal-dark/20"
                    : "bg-white border border-brand-beige text-brand-brown hover:border-brand-teal/30"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-4 border-brand-beige" />
              <Loader2 className="w-14 h-14 animate-spin text-brand-teal-dark absolute inset-0" />
            </div>
            <p className="text-brand-brown text-sm font-medium animate-pulse">
              Loading courses...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-brand-beige/50 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-brand-brown/30" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-brand-black">
                No courses found
              </p>
              <p className="text-sm text-brand-brown mt-1">
                {search
                  ? "Try a different search term"
                  : "No courses are available at the moment"}
              </p>
            </div>
            {(search || langFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  handleLangFilter("all");
                }}
                className="rounded-xl border-brand-beige text-brand-brown"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-brand-brown mb-5 animate-fade-up">
              Showing {filtered.length} course
              {filtered.length > 1 ? "s" : ""}
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
