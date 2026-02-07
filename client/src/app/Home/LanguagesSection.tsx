import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";
import { Loader2, ArrowRight, Globe } from "lucide-react";
import { usePublicCourses } from "../../hooks/announce/Usepublic";
import type { PublicCourse } from "../../lib/api/announce/announce.api";

function deriveLanguages(courses: PublicCourse[]) {
  const map = new Map<
    string,
    {
      flag_emoji: string;
      course_name: string;
      title_ar: string;
      level: string;
      description_ar: string;
      description: string;
      language: string;
      slug: string;
      courseCount: number;
      image_url: string | null;
    }
  >();

  for (const c of courses) {
    const lang = c.language?.toLowerCase() || "other";
    if (map.has(lang)) {
      const existing = map.get(lang)!;
      existing.courseCount++;
      if (!existing.image_url && c.image_url) existing.image_url = c.image_url;
      continue;
    }

    map.set(lang, {
      flag_emoji: c.flag_emoji || "🌐",
      course_name: c.course_name,
      title_ar: c.title_ar || c.course_name,
      level: c.level || "All Levels",
      description_ar: c.description_ar || "",
      description: c.description || "",
      language: c.language || "",
      slug: lang,
      courseCount: 1,
      image_url: c.image_url || null,
    });
  }

  return Array.from(map.values());
}

export function LanguagesSection() {
  const { data, isLoading } = usePublicCourses({ page: 1, limit: 50 });
  const languages = deriveLanguages(data?.data || []);

  return (
    <section id="languages" className="py-20 lg:py-28 bg-white relative">
      {/* Subtle background */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
          className="w-full h-full"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-teal-dark/8 border border-brand-teal/15 px-4 py-2 text-xs font-semibold text-brand-teal-dark tracking-wide uppercase mb-4">
            <Globe className="w-3.5 h-3.5" />
            Our Programs
          </div>
          <h2
            className="text-3xl font-bold text-brand-black sm:text-4xl"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Available <span className="text-brand-teal-dark">Courses</span>
          </h2>
          <div className="flex justify-center mt-3">
            <div className="w-14 h-1 rounded-full bg-brand-mustard" />
          </div>
          <p className="mt-4 text-brand-black/55 max-w-lg mx-auto">
            Explore our range of language programs designed for all levels
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-brand-teal-dark animate-spin" />
          </div>
        ) : languages.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-brand-black/40 text-lg">
              No courses available at the moment
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {languages.map((lang, i) => (
                <Link
                  key={lang.slug}
                  to={`/courses?language=${lang.slug}`}
                  className="group flex flex-col rounded-2xl border border-brand-beige bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-brand-teal-dark/5 hover:border-brand-teal/20 hover:-translate-y-1 animate-fade-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Image or gradient header */}
                  <div className="relative h-40 overflow-hidden">
                    {lang.image_url ? (
                      <>
                        <img
                          src={lang.image_url}
                          alt={lang.course_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-brand-teal-dark via-brand-teal to-brand-teal-dark/80">
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-3 right-4 w-20 h-20 rounded-full border border-white" />
                          <div className="absolute bottom-3 left-6 w-12 h-12 rounded-full border border-white" />
                        </div>
                      </div>
                    )}
                    {/* Flag overlay */}
                    <div className="absolute bottom-3 left-4 w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                      {lang.flag_emoji}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    {/* Language name */}
                    <div className="mb-5">
                      <h3
                        className="text-lg font-bold text-brand-black group-hover:text-brand-teal-dark transition-colors"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {lang.course_name}
                      </h3>
                      <p
                        className="text-sm text-brand-brown mt-0.5"
                        dir="rtl"
                      >
                        {lang.title_ar}
                      </p>
                    </div>

                    {/* Level Badge */}
                    <div className="mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-teal-dark/8 text-brand-teal-dark border border-brand-teal/15">
                        Level: {lang.level}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="flex-1 space-y-2 mb-5">
                      {lang.description && (
                        <p className="text-sm text-brand-black/55 leading-relaxed line-clamp-2">
                          {lang.description}
                        </p>
                      )}
                      {lang.description_ar && (
                        <p
                          className="text-sm text-brand-black/45 leading-relaxed line-clamp-2"
                          dir="rtl"
                        >
                          {lang.description_ar}
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-brand-beige/60">
                      <div className="flex items-center gap-4 text-xs text-brand-brown">
                        <span>Certified Training</span>
                        <span>•</span>
                        <span>{lang.language}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-brand-teal-dark opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All */}
            <div className="text-center mt-10 animate-fade-up">
              <Button
                variant="outline"
                asChild
                className="border-brand-beige text-brand-teal-dark hover:bg-brand-teal-dark hover:text-white hover:border-brand-teal-dark px-8 rounded-xl"
              >
                <Link to="/courses">
                  View All Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}