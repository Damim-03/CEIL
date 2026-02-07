import { ArrowRight, Calendar, Loader2, Newspaper } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";
import { usePublicAnnouncements } from "../../hooks/announce/Usepublic";

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const CATEGORY_COLORS: Record<string, string> = {
  NEWS: "bg-blue-500/10 text-blue-700 border-blue-200/50",
  FORMATIONS: "bg-emerald-500/10 text-emerald-700 border-emerald-200/50",
  EXAMS: "bg-amber-500/10 text-amber-700 border-amber-200/50",
  REGISTRATION: "bg-purple-500/10 text-purple-700 border-purple-200/50",
  EVENTS: "bg-rose-500/10 text-rose-700 border-rose-200/50",
};

export function AnnouncementsPreview() {
  const { data, isLoading } = usePublicAnnouncements({ page: 1, limit: 3 });

  const announcements = data?.data || [];
  const featured = announcements[0];

  return (
    <section className="py-20 lg:py-28 bg-brand-gray relative">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
          className="w-full h-full"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-mustard/10 border border-brand-mustard/20 px-4 py-2 text-xs font-semibold text-brand-mustard-dark tracking-wide uppercase mb-4">
            <Newspaper className="w-3.5 h-3.5" />
            Latest Updates
          </div>
          <h2
            className="text-3xl font-bold text-brand-black sm:text-4xl"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            News & <span className="text-brand-teal-dark">Announcements</span>
          </h2>
          <div className="flex justify-center mt-3">
            <div className="w-14 h-1 rounded-full bg-brand-mustard" />
          </div>
          <p className="mt-4 text-brand-black/55 max-w-lg mx-auto">
            Stay up to date with the latest news from our language center
          </p>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-teal-dark animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-brand-black/40 text-lg">
              No announcements at the moment
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] items-start">
            {/* Left: News List */}
            <div
              className="space-y-4 animate-fade-up"
              style={{ animationDelay: "100ms" }}
            >
              {announcements.map((item) => {
                const catStyle =
                  CATEGORY_COLORS[item.category?.toUpperCase() || ""] ||
                  "bg-brand-teal-dark/10 text-brand-teal-dark border-brand-teal/20";

                return (
                  <Link
                    key={item.id}
                    to={`/announcements/${item.id}`}
                    className="group flex gap-4 rounded-2xl border border-brand-beige bg-white p-4 transition-all duration-300 hover:shadow-lg hover:shadow-brand-teal-dark/5 hover:border-brand-teal/20 hover:-translate-y-0.5"
                  >
                    {/* Thumbnail */}
                    {item.image_url && (
                      <div className="w-[110px] h-[85px] rounded-xl overflow-hidden shrink-0 bg-brand-beige">
                        <img
                          src={item.image_url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-[15px] font-bold text-brand-black leading-snug line-clamp-2 group-hover:text-brand-teal-dark transition-colors"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {item.title_ar || item.title}
                      </h3>

                      <div className="flex items-center gap-2 mt-2 text-xs text-brand-brown">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(item.date)}
                        </span>
                        {item.category && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${catStyle}`}
                          >
                            {item.category}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-brand-black/45 line-clamp-1">
                        {item.excerpt_ar || item.excerpt}
                      </p>
                    </div>
                  </Link>
                );
              })}

              {/* View All */}
              <Button
                variant="outline"
                asChild
                className="w-full border-brand-beige text-brand-teal-dark hover:bg-brand-teal-dark hover:text-white hover:border-brand-teal-dark rounded-xl"
              >
                <Link to="/announcements">
                  View All Announcements
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Right: Featured */}
            {featured && (
              <div
                className="animate-fade-up"
                style={{ animationDelay: "200ms" }}
              >
                <Link
                  to={`/announcements/${featured.id}`}
                  className="group block rounded-2xl overflow-hidden border border-brand-beige bg-white transition-all duration-300 hover:shadow-xl hover:shadow-brand-teal-dark/5 h-full"
                >
                  <div className="relative h-full min-h-[420px] overflow-hidden bg-brand-beige">
                    {featured.image_url ? (
                      <img
                        src={featured.image_url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-teal-dark to-brand-teal" />
                    )}

                    {/* Category Badge */}
                    {featured.category && (
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-brand-teal-dark text-xs font-semibold shadow-lg">
                          {featured.category}
                        </span>
                      </div>
                    )}

                    {/* Bottom Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3
                        className="text-xl sm:text-2xl font-bold text-white leading-snug line-clamp-3"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {featured.title_ar || featured.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-3 text-xs text-white/70">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(featured.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
