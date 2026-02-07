import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  Search,
  Loader2,
  BookOpen,
  ArrowUpRight,
  Plus,
  Sparkles,
  Eye,
  FileX,
  PenLine,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useAdminCourses } from "../../../hooks/admin/useAdmin";

// ─── Status Badge ───
const StatusBadge = ({
  hasProfile,
  isPublished,
}: {
  hasProfile: boolean;
  isPublished: boolean;
}) => {
  if (!hasProfile) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        <FileX className="w-3 h-3" />
        No Profile
      </span>
    );
  }
  if (isPublished) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-800">
        <Eye className="w-3 h-3" />
        Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:ring-amber-800">
      <PenLine className="w-3 h-3" />
      Draft
    </span>
  );
};

// ─── Stat Card ───
const StatCard = ({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  color: "primary" | "emerald" | "amber" | "zinc";
  active: boolean;
  onClick: () => void;
}) => {
  const colorMap = {
    primary: {
      active: "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm",
      idle: "border-border bg-card hover:border-primary/40 hover:shadow-sm",
      text: "text-primary",
      dot: "bg-primary",
    },
    emerald: {
      active: "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200 shadow-sm dark:bg-emerald-950/30 dark:border-emerald-600",
      idle: "border-border bg-card hover:border-emerald-300 hover:shadow-sm",
      text: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
    amber: {
      active: "border-amber-400 bg-amber-50 ring-2 ring-amber-200 shadow-sm dark:bg-amber-950/30 dark:border-amber-600",
      idle: "border-border bg-card hover:border-amber-300 hover:shadow-sm",
      text: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    zinc: {
      active: "border-zinc-400 bg-zinc-50 ring-2 ring-zinc-200 shadow-sm dark:bg-zinc-800 dark:border-zinc-600",
      idle: "border-border bg-card hover:border-zinc-300 hover:shadow-sm",
      text: "text-zinc-500 dark:text-zinc-400",
      dot: "bg-zinc-400",
    },
  };

  const c = colorMap[color];

  return (
    <button
      onClick={onClick}
      className={`group relative rounded-2xl border p-5 text-left transition-all duration-200 ${
        active ? c.active : c.idle
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className={`w-2.5 h-2.5 rounded-full ${c.dot} ${
            active ? "animate-pulse" : "opacity-60"
          }`}
        />
      </div>
      <p className={`text-3xl font-bold tracking-tight ${c.text}`}>{count}</p>
      <p className="text-xs font-medium text-muted-foreground mt-1 tracking-wide uppercase">
        {label}
      </p>
    </button>
  );
};

export default function FormationsPage() {
  const { data: courses, isLoading } = useAdminCourses();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "published" | "draft" | "none"
  >("all");

  const filtered = (courses || []).filter((course: any) => {
    const matchSearch =
      course.course_name?.toLowerCase().includes(search.toLowerCase()) ||
      course.course_code?.toLowerCase().includes(search.toLowerCase());

    if (filter === "all") return matchSearch;
    if (filter === "published")
      return matchSearch && course.profile?.is_published;
    if (filter === "draft")
      return matchSearch && course.profile && !course.profile.is_published;
    if (filter === "none") return matchSearch && !course.profile;
    return matchSearch;
  });

  const totalCourses = courses?.length || 0;
  const publishedCount =
    courses?.filter((c: any) => c.profile?.is_published).length || 0;
  const draftCount =
    courses?.filter((c: any) => c.profile && !c.profile.is_published).length ||
    0;
  const noProfileCount = totalCourses - publishedCount - draftCount;

  return (
    <div className="space-y-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Formations
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage public profiles, pricing & publishing
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{totalCourses} courses total</span>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="All Courses"
          count={totalCourses}
          color="primary"
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <StatCard
          label="Published"
          count={publishedCount}
          color="emerald"
          active={filter === "published"}
          onClick={() => setFilter("published")}
        />
        <StatCard
          label="Draft"
          count={draftCount}
          color="amber"
          active={filter === "draft"}
          onClick={() => setFilter("draft")}
        />
        <StatCard
          label="No Profile"
          count={noProfileCount}
          color="zinc"
          active={filter === "none"}
          onClick={() => setFilter("none")}
        />
      </div>

      {/* ─── Search ─── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses by name or code..."
          className="pl-11 h-11 rounded-xl bg-card border-border/60 transition-all"
        />
      </div>

      {/* ─── Content ─── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-muted" />
            <Loader2 className="w-12 h-12 animate-spin text-primary absolute inset-0" />
          </div>
          <p className="text-sm text-muted-foreground">
            Loading formations...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">
              No formations found
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {search
                ? "Try a different search term"
                : "Create a course first from the Courses section"}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_140px] gap-4 px-6 py-3.5 bg-muted/40 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Course</span>
            <span>Code</span>
            <span>Language</span>
            <span>Level</span>
            <span className="text-center">Status</span>
            <span className="text-center">Action</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-border/50">
            {filtered.map((course: any) => {
              const profile = course.profile;
              const hasProfile = !!profile;
              const isPublished = profile?.is_published || false;

              return (
                <div
                  key={course.course_id}
                  className="group grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_140px] gap-4 items-center px-6 py-4 hover:bg-muted/20 transition-colors duration-150"
                >
                  {/* Course Name */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg transition-transform group-hover:scale-105 ${
                        hasProfile
                          ? "bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10"
                          : "bg-muted/60 border border-border"
                      }`}
                    >
                      {profile?.flag_emoji ? (
                        <span>{profile.flag_emoji}</span>
                      ) : (
                        <BookOpen className="w-5 h-5 text-muted-foreground/60" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {course.course_name}
                      </p>
                      {profile?.title_ar && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {profile.title_ar}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Code */}
                  <div className="hidden sm:block">
                    {course.course_code ? (
                      <span className="inline-flex px-2.5 py-1 rounded-md bg-muted/60 text-xs font-mono font-medium text-foreground/70">
                        {course.course_code}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground/40">
                        —
                      </span>
                    )}
                  </div>

                  {/* Language */}
                  <div className="hidden sm:block text-sm text-muted-foreground">
                    {profile?.language || (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </div>

                  {/* Level */}
                  <div className="hidden sm:block text-sm text-muted-foreground">
                    {profile?.level ? (
                      <span className="inline-flex px-2 py-0.5 rounded bg-primary/5 text-xs font-medium text-primary/80">
                        {profile.level}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="hidden sm:flex justify-center">
                    <StatusBadge
                      hasProfile={hasProfile}
                      isPublished={isPublished}
                    />
                  </div>

                  {/* Action */}
                  <div className="flex sm:justify-center">
                    <Button
                      asChild
                      size="sm"
                      variant={hasProfile ? "outline" : "default"}
                      className={`gap-2 rounded-lg transition-all duration-200 ${
                        hasProfile
                          ? "hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
                          : "shadow-sm hover:shadow-md"
                      }`}
                    >
                      <Link
                        to={`/admin/formations/${course.course_id}/edit`}
                      >
                        {hasProfile ? (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            Edit
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            Create Profile
                          </>
                        )}
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-muted/20 border-t text-xs text-muted-foreground flex items-center justify-between">
            <span>
              Showing {filtered.length} of {totalCourses} courses
            </span>
            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                className="text-primary hover:underline font-medium"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}