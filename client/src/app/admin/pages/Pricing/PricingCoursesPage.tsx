import { useParams, Link } from "react-router-dom";
import {
  Loader2,
  ChevronRight,
  Calendar,
  Users,
  BookOpen,
  MapPin,
  GraduationCap,
  UserPlus,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { usePublicCourse } from "../../../../hooks/announce/Usepublic";

const formatDate = (date: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading, isError } = usePublicCourse(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-brand-teal-dark dark:text-[#4ADE80] animate-spin" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="text-4xl">😕</span>
        <h2 className="text-2xl font-bold text-brand-black dark:text-[#E5E5E5]">
          التكوين غير موجود
        </h2>
        <Button
          asChild
          className="bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white"
        >
          <Link to="/courses">العودة للتكوينات</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-brand-gray dark:bg-[#0F0F0F]">
      {/* ─── Breadcrumb ─── */}
      <div className="bg-white dark:bg-[#1A1A1A] border-b border-brand-beige dark:border-[#2A2A2A]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-brand-brown dark:text-[#888888]">
            <Link
              to="/"
              className="text-brand-teal-dark dark:text-[#4ADE80] hover:underline"
            >
              Accueil
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-brand-brown/40 dark:text-[#555555]" />
            <Link
              to="/courses"
              className="text-brand-teal-dark dark:text-[#4ADE80] hover:underline"
            >
              Formations
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-brand-brown/40 dark:text-[#555555]" />
            <span className="text-brand-black/60 dark:text-[#AAAAAA] line-clamp-1">
              {course.course_name} – {course.title_ar}
            </span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* ═══ LEFT COLUMN ═══ */}
          <div className="space-y-8">
            {/* ─── Title Card ─── */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige dark:border-[#2A2A2A] p-8">
              <h1
                className="text-2xl sm:text-3xl font-bold text-brand-black dark:text-[#E5E5E5] leading-snug"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {course.flag_emoji && (
                  <span className="mr-3">{course.flag_emoji}</span>
                )}
                {course.course_name} – {course.title_ar}
              </h1>

              {(course as any).subtitle_ar && (
                <p className="text-brand-brown dark:text-[#888888] mt-2">
                  {(course as any).subtitle_ar} – {(course as any).subtitle}
                </p>
              )}

              {/* Description */}
              {course.description_ar && (
                <p
                  className="mt-6 text-brand-black/60 dark:text-[#AAAAAA] leading-relaxed"
                  dir="rtl"
                >
                  {course.description_ar}
                </p>
              )}
              {course.description && (
                <p className="mt-3 text-brand-black/50 dark:text-[#888888] leading-relaxed">
                  {course.description}
                </p>
              )}

              {/* Level Section */}
              {course.level && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-brand-black dark:text-[#E5E5E5] mb-3">
                    Niveau
                  </h2>
                  <p className="text-brand-black/70 dark:text-[#CCCCCC]">
                    {course.level}
                    {(course as any).level_description && (
                      <span className="block mt-1 text-brand-black/50 dark:text-[#888888]">
                        {(course as any).level_description}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Details Table */}
              <div className="mt-8">
                <h2 className="text-xl font-bold text-brand-black dark:text-[#E5E5E5] mb-4">
                  Détails de la formation
                </h2>
                <div className="divide-y divide-brand-beige dark:divide-[#2A2A2A]">
                  <DetailRow
                    label="Type"
                    value={
                      (course as any).formation_type || "Formation Certifiante"
                    }
                  />
                  <DetailRow
                    label="Langue"
                    value={
                      <span className="flex items-center gap-2">
                        {course.flag_emoji && <span>{course.flag_emoji}</span>}
                        {course.language}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Places"
                    value={`${(course as any).min_students || 15} - ${(course as any).max_students_profile || 999}`}
                  />
                  <DetailRow
                    label="Format"
                    value={(course as any).format || "Présentiel"}
                  />
                </div>
              </div>
            </div>

            {/* ─── Pricing Table ─── */}
            {(course as any).pricing && (course as any).pricing.length > 0 && (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige dark:border-[#2A2A2A] overflow-hidden">
                {/* Header */}
                <div className="bg-brand-teal-dark dark:bg-[#1A1A1A] dark:border-b dark:border-[#2A2A2A] px-6 py-4">
                  <h2 className="text-lg font-bold text-white dark:text-[#4ADE80]">
                    Tarifs par statut
                  </h2>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-beige dark:border-[#2A2A2A] bg-brand-gray/50 dark:bg-[#151515]">
                        <th className="text-left px-6 py-3 font-semibold text-brand-black dark:text-[#E5E5E5]">
                          Statut
                        </th>
                        <th className="text-left px-6 py-3 font-semibold text-brand-black dark:text-[#E5E5E5]">
                          Détails
                        </th>
                        <th className="text-right px-6 py-3 font-semibold text-brand-black dark:text-[#E5E5E5]">
                          Tarif
                        </th>
                        <th className="text-center px-6 py-3 font-semibold text-brand-black dark:text-[#E5E5E5]">
                          Réduction
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-beige dark:divide-[#2A2A2A]">
                      {(course as any).pricing.map((p: any, i: number) => (
                        <tr
                          key={p.id}
                          className={
                            i % 2 === 0
                              ? "bg-white dark:bg-[#1A1A1A]"
                              : "bg-brand-gray/30 dark:bg-[#151515]"
                          }
                        >
                          <td className="px-6 py-4 font-semibold text-brand-black dark:text-[#E5E5E5]">
                            {p.status_fr}
                          </td>
                          <td className="px-6 py-4 text-brand-black/60 dark:text-[#AAAAAA]">
                            {p.status_ar && (
                              <span className="block" dir="rtl">
                                {p.status_ar}
                              </span>
                            )}
                            {p.status_en && (
                              <span className="block text-xs text-brand-black/40 dark:text-[#666666]">
                                {p.status_en}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-brand-black dark:text-[#E5E5E5]">
                            {Number(p.price).toLocaleString("fr-FR", {
                              minimumFractionDigits: 2,
                            })}{" "}
                            {p.currency}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex px-3 py-1 rounded text-xs font-bold ${
                                p.discount === "Aucune" || !p.discount
                                  ? "bg-gray-100 dark:bg-[#222222] text-gray-500 dark:text-[#666666]"
                                  : "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                              }`}
                            >
                              {p.discount || "Aucune"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ═══ RIGHT COLUMN (Sidebar) ═══ */}
          <div className="space-y-6">
            {/* Session Card */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige dark:border-[#2A2A2A] overflow-hidden">
              <div className="bg-brand-teal-dark dark:bg-[#1A1A1A] dark:border-b dark:border-[#2A2A2A] px-6 py-4">
                <h3 className="text-lg font-bold text-white dark:text-[#4ADE80]">
                  Session disponible
                </h3>
              </div>

              <div className="p-6">
                {course.session_name ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-brand-black/70 dark:text-[#CCCCCC]">
                      <BookOpen className="w-4 h-4 text-brand-teal-dark dark:text-[#4ADE80] shrink-0" />
                      <span className="font-semibold">
                        {course.session_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-brand-black/70 dark:text-[#CCCCCC]">
                      <Calendar className="w-4 h-4 text-brand-teal-dark dark:text-[#4ADE80] shrink-0" />
                      <span>
                        {formatDate(course.start_date)} –{" "}
                        {formatDate(course.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-brand-black/70 dark:text-[#CCCCCC]">
                      <Users className="w-4 h-4 text-brand-teal-dark dark:text-[#4ADE80] shrink-0" />
                      <span>
                        {course.enrolled} / {course.capacity} inscrits
                      </span>
                    </div>

                    {/* Status */}
                    <div
                      className={`rounded-lg px-4 py-2 text-center text-sm font-bold ${
                        course.registration_open
                          ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30"
                          : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/30"
                      }`}
                    >
                      {course.registration_open
                        ? "✅ التسجيل مفتوح"
                        : "🔒 التسجيل مغلق"}
                    </div>

                    {course.registration_open && (
                      <Button
                        asChild
                        className="w-full bg-brand-mustard hover:bg-brand-mustard-dark text-white border-0 gap-2"
                      >
                        <Link to={`/register/${course.id}`}>
                          <UserPlus className="w-4 h-4" />
                          التسجيل الآن
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-brand-black/40 dark:text-[#666666] text-sm">
                    Aucune session planifiée pour le moment.
                  </p>
                )}
              </div>
            </div>

            {/* Groups Card */}
            {course.groups && course.groups.length > 0 && (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige dark:border-[#2A2A2A] overflow-hidden">
                <div className="bg-brand-teal-dark/90 dark:bg-[#1A1A1A] dark:border-b dark:border-[#2A2A2A] px-6 py-4">
                  <h3 className="text-lg font-bold text-white dark:text-[#4ADE80]">
                    Groupes
                  </h3>
                </div>
                <div className="divide-y divide-brand-beige dark:divide-[#2A2A2A]">
                  {course.groups.map((g) => (
                    <div key={g.id} className="p-4">
                      <p className="font-semibold text-brand-black dark:text-[#E5E5E5]">
                        {g.name}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-brand-brown dark:text-[#888888]">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          {g.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {g.enrolled}/{g.max_students}
                        </span>
                        {g.teacher && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {g.teacher}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Helper Component ───
function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-1">
      <span className="text-sm text-brand-black/50 dark:text-[#888888]">
        {label}
      </span>
      <span className="text-sm font-medium text-brand-black dark:text-[#E5E5E5]">
        {value}
      </span>
    </div>
  );
}
