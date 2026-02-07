import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Search,
  Users,
  GraduationCap,
  UserCheck,
  CheckCircle2,
  Lock,
  Unlock,
  User,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  Filter,
  BookOpen,
} from "lucide-react";
import {
  useCourses,
  useCourseGroups,
  useEnrollInCourse,
  useStudentEnrollments,
} from "../../../hooks/student/Usestudent";
import PageLoader from "../../../components/PageLoader";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Type definitions
type Level = (typeof LEVELS)[number];
type Status = (typeof STATUSES)[number];
type Step = "courses" | "levels" | "groups";

const LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;
const STATUSES = ["ALL", "OPEN", "FULL", "CLOSED"] as const;

const LEVEL_COLORS = {
  A1: "from-green-500 to-emerald-600",
  A2: "from-blue-500 to-cyan-600",
  B1: "from-purple-500 to-indigo-600",
  B2: "from-orange-500 to-amber-600",
  C1: "from-red-500 to-rose-600",
} as const;

const LEVEL_BG_COLORS = {
  A1: "bg-green-50 border-green-200",
  A2: "bg-blue-50 border-blue-200",
  B1: "bg-purple-50 border-purple-200",
  B2: "bg-orange-50 border-orange-200",
  C1: "bg-red-50 border-red-200",
} as const;

interface Course {
  course_id: string;
  course_name: string;
  course_code?: string;
  description?: string;
}

// ⚠️ IMPORTANT: API returns "name" not "group_name"
interface Group {
  group_id: string;
  name: string; // ✅ API field name
  level: Level;
  status: "OPEN" | "CLOSED";
  current_capacity: number;
  max_students: number; // ✅ API field name (not max_capacity)
  teacher?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface Enrollment {
  enrollment_id: string;
  course_id: string;
  course_name: string;
  program_name?: string;
  status: "pending" | "approved" | "validated" | "rejected";
  group_id?: string;
  level?: Level;
  group_name?: string;
}

const Courses = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("courses");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Status>("ALL");

  const enrollMutation = useEnrollInCourse();

  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: enrollments = [], isLoading: enrollmentsLoading } =
    useStudentEnrollments();
  const { data: groups = [], isLoading: groupsLoading } = useCourseGroups(
    selectedCourse?.course_id,
  );

  const handleSelectCourse = (course: Course) => {
    const enrollment = enrollments.find(
      (e: Enrollment) => e.course_id === course.course_id,
    );

    if (enrollment) {
      if (enrollment.group_id) {
        toast.info(`You're already enrolled in ${course.course_name}!`, {
          description: `Group: ${enrollment.group_name || "Assigned"} | Level: ${enrollment.level || "N/A"}`,
        });
        setTimeout(() => navigate("/dashboard/enrollments"), 1500);
        return;
      } else {
        if (enrollment.status === "pending") {
          toast.warning(`Your enrollment is pending approval`, {
            description:
              "Please wait for admin to approve your enrollment before selecting a group.",
          });
          return;
        } else if (enrollment.status === "rejected") {
          toast.error(`Your enrollment was rejected`, {
            description: "Please contact administration for more information.",
          });
          return;
        } else if (
          enrollment.status === "validated" ||
          enrollment.status === "approved"
        ) {
          toast.info(`Select a group for ${course.course_name}`, {
            description:
              "Your enrollment is approved. Choose your level and group!",
          });
          setSelectedCourse(course);
          setStep("levels");
          setSelectedLevel(null);
          setSearchTerm("");
          setSelectedStatus("ALL");
          return;
        }
      }
    }

    setSelectedCourse(course);
    setStep("levels");
    setSelectedLevel(null);
    setSearchTerm("");
    setSelectedStatus("ALL");
  };

  const handleSelectLevel = (level: Level) => {
    setSelectedLevel(level);
    setStep("groups");
    setSearchTerm("");
    setSelectedStatus("ALL");
  };

  const handleBack = () => {
    if (step === "groups") {
      setStep("levels");
      setSelectedLevel(null);
    } else if (step === "levels") {
      setStep("courses");
      setSelectedCourse(null);
    }
  };

  const handleEnrollInGroup = async (groupId: string) => {
    if (!selectedCourse) {
      toast.error("No course selected", {
        description: "Please select a course first",
      });
      return;
    }

    const selectedGroup = groups.find((g: Group) => g.group_id === groupId);

    if (!selectedGroup) {
      toast.error("Group not found", {
        description: "Please try again or select a different group",
      });
      return;
    }

    if (selectedGroup.current_capacity >= selectedGroup.max_students) {
      toast.error("Group is full", {
        description:
          "This group has reached maximum capacity. Please select another group.",
      });
      return;
    }

    if (selectedGroup.status === "CLOSED") {
      toast.error("Group is closed", {
        description:
          "This group is not accepting new students. Please select another group.",
      });
      return;
    }

    enrollMutation.mutate(
      {
        course_id: selectedCourse.course_id,
        group_id: groupId,
      },
      {
        onSuccess: (data) => {
          toast.success("Successfully enrolled!", {
            description: `You've been enrolled in ${selectedGroup.name}`,
            duration: 3000,
          });

          setTimeout(() => {
            navigate("/dashboard/enrollments", { replace: true });
          }, 1500);
        },
        onError: (error: any) => {
          if (error.response?.status === 409) {
            toast.error("Already enrolled", {
              description: "You are already enrolled in this course or group.",
            });
          } else if (error.response?.status === 400) {
            const message =
              error.response?.data?.message || error.response?.data?.error;
            if (
              message?.toLowerCase().includes("full") ||
              message?.toLowerCase().includes("capacity")
            ) {
              toast.error("Group is full", {
                description:
                  "This group reached capacity just now. Please try another group.",
              });
            } else {
              toast.error("Enrollment failed", {
                description: message || "Please try again or contact support.",
              });
            }
          }
        },
      },
    );
  };

  if (coursesLoading || enrollmentsLoading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Breadcrumb */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-teal-600" />
              {step === "courses" && "Available Courses"}
              {step === "levels" &&
                selectedCourse &&
                `Levels: ${selectedCourse.course_name}`}
              {step === "groups" &&
                selectedLevel &&
                `Groups: Level ${selectedLevel}`}
            </h1>
            <p className="text-gray-600 mt-1">
              {step === "courses" &&
                "Select a course to view available levels and groups"}
              {step === "levels" &&
                selectedCourse &&
                `Choose your proficiency level for ${selectedCourse.course_name}`}
              {step === "groups" &&
                selectedLevel &&
                `Enroll in an available group for Level ${selectedLevel}`}
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => {
              setStep("courses");
              setSelectedCourse(null);
              setSelectedLevel(null);
            }}
            className={`${
              step === "courses"
                ? "text-teal-600 font-semibold cursor-default"
                : "text-gray-500 hover:text-gray-700"
            }`}
            disabled={step === "courses"}
          >
            Courses
          </button>

          {selectedCourse && (step === "levels" || step === "groups") && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => step === "groups" && handleBack()}
                className={`${
                  step === "levels"
                    ? "text-teal-600 font-semibold cursor-default"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                disabled={step === "levels"}
              >
                {selectedCourse.course_name}
              </button>
            </>
          )}

          {selectedLevel && step === "groups" && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-teal-600 font-semibold">
                Level {selectedLevel}
              </span>
            </>
          )}
        </div>

        {/* Back Button */}
        {step !== "courses" && (
          <Button
            variant="outline"
            onClick={handleBack}
            className="gap-2 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {step === "groups" ? "Levels" : "Courses"}
          </Button>
        )}
      </div>

      {/* Step 1: Courses List */}
      {step === "courses" && (
        <CoursesGrid
          courses={courses}
          enrollments={enrollments}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSelectCourse={handleSelectCourse}
        />
      )}

      {/* Step 2: Levels Selection */}
      {step === "levels" && selectedCourse && (
        <LevelsGrid
          course={selectedCourse}
          groups={groups}
          isLoading={groupsLoading}
          onSelectLevel={handleSelectLevel}
        />
      )}

      {/* Step 3: Groups List */}
      {step === "groups" && selectedCourse && selectedLevel && (
        <GroupsList
          groups={groups}
          selectedLevel={selectedLevel}
          isLoading={groupsLoading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          onEnroll={handleEnrollInGroup}
          isEnrolling={enrollMutation.isPending}
        />
      )}
    </div>
  );
};

/* ==================== COURSES GRID ==================== */
interface CoursesGridProps {
  courses: Course[];
  enrollments: Enrollment[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSelectCourse: (course: Course) => void;
}

const CoursesGrid = ({
  courses,
  enrollments,
  searchTerm,
  setSearchTerm,
  onSelectCourse,
}: CoursesGridProps) => {
  const filteredCourses = courses.filter(
    (course) =>
      course.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_code?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getEnrollmentStatus = (courseId: string) => {
    return enrollments.find((e: Enrollment) => e.course_id === courseId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search courses by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredCourses.length}
          </span>{" "}
          course{filteredCourses.length !== 1 ? "s" : ""}
        </p>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No courses available
          </h3>
          <p className="text-gray-600">
            Check back later or contact your administrator
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const enrollment = getEnrollmentStatus(course.course_id);
            const isEnrolled = !!enrollment;
            const hasGroup = enrollment?.group_id;

            return (
              <div
                key={course.course_id}
                onClick={() => onSelectCourse(course)}
                className={`bg-white rounded-xl border-2 p-6 transition-all cursor-pointer ${
                  isEnrolled
                    ? hasGroup
                      ? "border-green-300 bg-green-50"
                      : "border-blue-300 bg-blue-50"
                    : "border-gray-200 hover:border-teal-500 hover:shadow-lg"
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelectCourse(course)}
                aria-label={`Select course: ${course.course_name}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-lg flex items-center justify-center text-white shrink-0 shadow-md ${
                      isEnrolled
                        ? hasGroup
                          ? "bg-linear-to-br from-green-500 to-emerald-600"
                          : "bg-linear-to-br from-blue-500 to-indigo-600"
                        : "bg-linear-to-br from-teal-500 to-cyan-600"
                    }`}
                  >
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 truncate hover:text-teal-600 transition-colors">
                      {course.course_name}
                    </h3>
                    {course.course_code && (
                      <p className="text-sm text-gray-500 mb-1">
                        Code: {course.course_code}
                      </p>
                    )}
                    {course.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  {isEnrolled ? (
                    <div
                      className={`flex items-center gap-2 ${
                        hasGroup ? "text-green-700" : "text-blue-700"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <p className="text-xs font-semibold">
                        {hasGroup
                          ? `Enrolled - ${enrollment.group_name || "Group Assigned"}`
                          : `Status: ${enrollment.status.toUpperCase()}`}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">
                      Click to enroll in this course
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ==================== LEVELS GRID ==================== */
interface LevelsGridProps {
  course: Course;
  groups: Group[];
  isLoading: boolean;
  onSelectLevel: (level: Level) => void;
}

const LevelsGrid = ({
  course,
  groups,
  isLoading,
  onSelectLevel,
}: LevelsGridProps) => {
  if (isLoading) {
    return <PageLoader />;
  }

  const availableLevels = Array.from(
    new Set(groups.map((g) => g.level)),
  ).filter((level): level is Level => LEVELS.includes(level));

  const levelCounts = groups.reduce<Record<string, number>>((acc, group) => {
    const level = group.level;
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const openGroupsCounts = groups.reduce<Record<string, number>>(
    (acc, group) => {
      const isFull = group.current_capacity >= group.max_students;
      const isOpen = group.status === "OPEN" && !isFull;
      if (isOpen) {
        const level = group.level;
        acc[level] = (acc[level] || 0) + 1;
      }
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-br from-teal-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{course.course_name}</h2>
            {course.course_code && (
              <p className="text-teal-100 text-sm">{course.course_code}</p>
            )}
            {course.description && (
              <p className="text-white/90 text-sm mt-2">{course.description}</p>
            )}
          </div>
        </div>
      </div>

      {availableLevels.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Filter className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No levels available
          </h3>
          <p className="text-gray-600">
            This course doesn't have any groups yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEVELS.filter((level) => availableLevels.includes(level)).map(
            (level) => {
              const totalGroups = levelCounts[level] || 0;
              const openGroups = openGroupsCounts[level] || 0;
              const hasAvailableGroups = openGroups > 0;

              return (
                <button
                  key={level}
                  onClick={() => onSelectLevel(level)}
                  disabled={!hasAvailableGroups}
                  className={`group rounded-xl border-2 p-6 text-left transition-all ${
                    LEVEL_BG_COLORS[level]
                  } ${
                    hasAvailableGroups
                      ? "hover:shadow-lg cursor-pointer hover:border-gray-300"
                      : "opacity-60 cursor-not-allowed border-gray-200"
                  }`}
                  aria-label={`Select Level ${level} (${openGroups} available groups)`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold bg-linear-to-br ${
                          LEVEL_COLORS[level]
                        } text-white shadow-md ${
                          hasAvailableGroups ? "group-hover:scale-110" : ""
                        } transition-transform`}
                      >
                        Level {level}
                      </span>
                      {hasAvailableGroups ? (
                        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Total Groups
                        </span>
                        <span className="font-semibold text-gray-900">
                          {totalGroups}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Unlock className="w-4 h-4" />
                          Available
                        </span>
                        <span
                          className={`font-semibold ${
                            hasAvailableGroups
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {openGroups}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-300">
                      {hasAvailableGroups ? (
                        <p className="text-xs text-gray-600">
                          Click to view available groups
                        </p>
                      ) : (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          All groups are full or closed
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            },
          )}
        </div>
      )}
    </div>
  );
};

/* ==================== GROUPS LIST ==================== */
interface GroupsListProps {
  groups: Group[];
  selectedLevel: Level;
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatus: Status;
  setSelectedStatus: (status: Status) => void;
  onEnroll: (groupId: string) => void;
  isEnrolling: boolean;
}

const GroupsList = ({
  groups,
  selectedLevel,
  isLoading,
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  onEnroll,
  isEnrolling,
}: GroupsListProps) => {
  if (isLoading) {
    return <PageLoader />;
  }

  // Filter by level first
  const levelGroups = groups.filter((g) => g.level === selectedLevel);

  // Then apply search and status filters
  // ✅ FIX: Use "name" field instead of "group_name"
  const filteredGroups = levelGroups.filter((group) => {
    const matchesSearch =
      group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.teacher?.first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      group.teacher?.last_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const isFull = group.current_capacity >= group.max_students;
    const actualStatus =
      group.status === "CLOSED" ? "CLOSED" : isFull ? "FULL" : "OPEN";
    const matchesStatus =
      selectedStatus === "ALL" || actualStatus === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by group name or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Status)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
              aria-label="Filter groups by status"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All Status" : status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedStatus !== "ALL" || searchTerm) && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Active filters:</span>
            {selectedStatus !== "ALL" && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                Status: {selectedStatus}
                <button
                  onClick={() => setSelectedStatus("ALL")}
                  className="ml-1 hover:text-blue-900"
                  aria-label={`Remove ${selectedStatus} filter`}
                >
                  ×
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 hover:text-purple-900"
                  aria-label="Clear search"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Found{" "}
          <span className="font-semibold text-gray-900">
            {filteredGroups.length}
          </span>{" "}
          group{filteredGroups.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No groups found
          </h3>
          <p className="text-gray-600">
            {levelGroups.length === 0
              ? `No groups available for Level ${selectedLevel}`
              : "Try adjusting your filters or search term"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.group_id}
              group={group}
              onEnroll={onEnroll}
              isEnrolling={isEnrolling}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ==================== GROUP CARD ==================== */
interface GroupCardProps {
  group: Group;
  onEnroll: (groupId: string) => void;
  isEnrolling: boolean;
}

const GroupCard = ({ group, onEnroll, isEnrolling }: GroupCardProps) => {
  const currentCapacity = group.current_capacity;
  const maxCapacity = group.max_students;
  const capacityPercent = (currentCapacity / maxCapacity) * 100;
  const availableSeats = maxCapacity - currentCapacity;
  const isFull = currentCapacity >= maxCapacity;
  const isClosed = group.status === "CLOSED";
  const isOpen = !isFull && !isClosed && group.status === "OPEN";

  return (
    <div
      className={`border-2 rounded-xl p-5 transition-all ${
        isOpen
          ? "hover:shadow-md hover:border-gray-300"
          : "opacity-75 border-gray-200"
      } ${LEVEL_BG_COLORS[group.level]}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
            {group.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-linear-to-br ${
                LEVEL_COLORS[group.level]
              } text-white shadow-sm`}
            >
              {group.level}
            </span>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isClosed
                  ? "bg-gray-100 text-gray-800"
                  : isFull
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
              }`}
            >
              {isClosed ? (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  CLOSED
                </>
              ) : isFull ? (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  FULL
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 mr-1" />
                  OPEN
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Teacher */}
      <div className="mb-4 p-3 bg-white/70 rounded-lg">
        <p className="text-xs text-gray-500 mb-1">Instructor</p>
        <div className="flex items-center gap-2 text-sm">
          {group.teacher ? (
            <>
              <UserCheck className="w-4 h-4 text-green-600 shrink-0" />
              <span className="font-medium text-gray-900 truncate">
                {group.teacher.first_name} {group.teacher.last_name}
              </span>
            </>
          ) : (
            <>
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-gray-500 italic">Not assigned</span>
            </>
          )}
        </div>
      </div>

      {/* Capacity */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 flex items-center gap-1">
            <Users className="w-4 h-4 shrink-0" />
            Capacity
          </span>
          <span className="font-semibold text-gray-900">
            {currentCapacity} / {maxCapacity}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              capacityPercent >= 100
                ? "bg-linear-to-r from-red-500 to-rose-600"
                : capacityPercent >= 80
                  ? "bg-linear-to-r from-orange-500 to-amber-600"
                  : "bg-linear-to-r from-blue-500 to-indigo-600"
            }`}
            style={{ width: `${Math.min(capacityPercent, 100)}%` }}
          />
        </div>
        <p
          className={`text-xs mt-1 ${availableSeats <= 0 ? "text-red-600 font-medium" : "text-gray-500"}`}
        >
          {availableSeats <= 0 ? (
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              No seats available
            </span>
          ) : (
            `${availableSeats} seat${availableSeats > 1 ? "s" : ""} available`
          )}
        </p>
      </div>

      {/* ENROLLMENT BUTTON */}
      <Button
        onClick={() => onEnroll(group.group_id)}
        disabled={!isOpen || isEnrolling}
        className={`w-full gap-2 text-base font-semibold ${
          isOpen
            ? "bg-linear-to-br from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-md hover:shadow-lg"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
        aria-label={
          !isOpen
            ? isClosed
              ? `Group ${group.name} is closed`
              : `Group ${group.name} is full`
            : isEnrolling
              ? `Enrolling in ${group.name}...`
              : `Enroll in group ${group.name}`
        }
      >
        {isEnrolling ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Enrolling...</span>
          </>
        ) : !isOpen ? (
          <>
            <Lock className="w-5 h-5" />
            <span>{isClosed ? "Group Closed" : "Group Full"}</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>Enroll in This Group</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default Courses;
