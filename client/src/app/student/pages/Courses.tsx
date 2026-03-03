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
  FileText,
} from "lucide-react";
import {
  useCourses,
  useCourseGroups,
  useEnrollInCourse,
  useStudentEnrollments,
} from "../../../hooks/student/Usestudent";
import {
  useMyProfile,
  useMyDocuments,
} from "../../../hooks/student/Usestudent";
import PageLoader from "../../../components/PageLoader";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PricingModal } from "../components/Pricingmodal";

type Level = (typeof LEVELS)[number];
type Status = (typeof STATUSES)[number];
type Step = "courses" | "levels" | "groups";

const LEVELS = ["PRE_A1", "A1", "A2", "B1", "B2", "C1"] as const;
const STATUSES = ["ALL", "OPEN", "FULL", "CLOSED"] as const;

const LEVEL_COLORS = {
  PRE_A1: "from-[#7C8FA6] to-[#4A6178]",
  A1: "from-[#8DB896] to-[#2B6F5E]",
  A2: "from-[#2B6F5E] to-[#1a4a3d]",
  B1: "from-[#C4A035] to-[#8B6914]",
  B2: "from-[#6B5D4F] to-[#4a3f36]",
  C1: "from-[#2B6F5E] to-[#C4A035]",
} as const;

const LEVEL_BG_COLORS = {
  PRE_A1:
    "bg-[#7C8FA6]/8 border-[#7C8FA6]/25 dark:bg-[#94A3B8]/5 dark:border-[#94A3B8]/15",
  A1: "bg-[#8DB896]/8 border-[#8DB896]/25 dark:bg-[#4ADE80]/5 dark:border-[#4ADE80]/15",
  A2: "bg-[#2B6F5E]/5 border-[#2B6F5E]/20 dark:bg-[#4ADE80]/[0.03] dark:border-[#4ADE80]/15",
  B1: "bg-[#C4A035]/5 border-[#C4A035]/20 dark:bg-[#D4A843]/[0.03] dark:border-[#D4A843]/15",
  B2: "bg-[#D8CDC0]/10 border-[#D8CDC0]/40 dark:bg-[#2A2A2A]/50 dark:border-[#2A2A2A]",
  C1: "bg-[#2B6F5E]/5 border-[#C4A035]/20 dark:bg-[#4ADE80]/[0.03] dark:border-[#D4A843]/15",
} as const;

interface Course {
  course_id: string;
  course_name: string;
  course_code?: string;
  description?: string;
}

interface Group {
  group_id: string;
  name: string;
  level: Level;
  status: "OPEN" | "CLOSED";
  current_capacity: number;
  max_students: number;
  teacher?: { first_name: string; last_name: string } | null;
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
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedGroupForEnrollment, setSelectedGroupForEnrollment] = useState<
    string | null
  >(null);

  const enrollMutation = useEnrollInCourse();
  const { data: courses = [], isLoading: coursesLoading } = useCourses();

  const { data: documents = [], isLoading: documentsLoading } =
    useMyDocuments();

  const REQUIRED_DOCUMENTS = [
    "PHOTO",
    "ID_CARD",
    "STUDENT_CARD",
    "SCHOOL_CERTIFICATE",
  ];

  const uploadedTypes = documents.map((d: any) => d.type);
  const missingDocuments = REQUIRED_DOCUMENTS.filter(
    (t) => !uploadedTypes.includes(t),
  );
  const isDocumentsComplete = missingDocuments.length === 0;

  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const isProfileComplete =
    profile &&
    profile.first_name &&
    profile.last_name &&
    profile.phone_number &&
    profile.date_of_birth &&
    profile.nationality &&
    profile.education_level;

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
        setTimeout(() => navigate("/student/enrollments"), 1500);
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
      toast.error("Group not found");
      return;
    }
    if (selectedGroup.current_capacity >= selectedGroup.max_students) {
      toast.error("Group is full");
      return;
    }
    if (selectedGroup.status === "CLOSED") {
      toast.error("Group is closed");
      return;
    }
    setSelectedGroupForEnrollment(groupId);
    setIsPricingModalOpen(true);
  };

  const confirmEnrollment = async () => {
    if (!selectedGroupForEnrollment || !selectedCourse) return;
    const selectedGroup = groups.find(
      (g: Group) => g.group_id === selectedGroupForEnrollment,
    );
    enrollMutation.mutate(
      {
        course_id: selectedCourse.course_id,
        group_id: selectedGroupForEnrollment,
      },
      {
        onSuccess: () => {
          setIsPricingModalOpen(false);
          setSelectedGroupForEnrollment(null);
          toast.success("Successfully enrolled!", {
            description: `You've been enrolled in ${selectedGroup?.name}`,
            duration: 3000,
          });
          setTimeout(
            () => navigate("/student/enrollments", { replace: true }),
            1500,
          );
        },
        onError: (error: any) => {
          if (error.response?.status === 409) toast.error("Already enrolled");
          else if (error.response?.status === 400) {
            const message =
              error.response?.data?.message || error.response?.data?.error;
            toast.error("Enrollment failed", {
              description: message || "Please try again.",
            });
          }
          setIsPricingModalOpen(false);
          setSelectedGroupForEnrollment(null);
        },
      },
    );
  };

  if (
    coursesLoading ||
    enrollmentsLoading ||
    profileLoading ||
    documentsLoading
  )
    return <PageLoader />;

  if (!isProfileComplete || !isDocumentsComplete) {
    return (
      <div className="space-y-6">
        <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-lg shadow-[#2B6F5E]/20 dark:shadow-black/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                Browse Courses
              </h1>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#C4A035]/30 dark:border-[#D4A843]/20 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#C4A035]/10 dark:bg-[#D4A843]/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-[#C4A035] dark:text-[#D4A843]" />
          </div>
          <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5] mb-3">
            Complete Your Profile to Enroll
          </h3>

          <div className="max-w-sm mx-auto space-y-3 mb-6">
            {/* Profile Status */}
            <div
              className={`flex items-center gap-3 p-3 rounded-xl text-sm ${
                isProfileComplete
                  ? "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/5"
                  : "bg-[#C4A035]/8 dark:bg-[#D4A843]/5"
              }`}
            >
              {isProfileComplete ? (
                <CheckCircle2 className="w-5 h-5 text-[#2B6F5E] dark:text-[#4ADE80] shrink-0" />
              ) : (
                <User className="w-5 h-5 text-[#C4A035] dark:text-[#D4A843] shrink-0" />
              )}
              <span
                className={
                  isProfileComplete
                    ? "text-[#2B6F5E] dark:text-[#4ADE80] font-medium"
                    : "text-[#C4A035] dark:text-[#D4A843] font-medium"
                }
              >
                {isProfileComplete
                  ? "Personal information completed"
                  : "Complete your personal information"}
              </span>
            </div>

            {/* Documents Status */}
            <div
              className={`flex items-center gap-3 p-3 rounded-xl text-sm ${
                isDocumentsComplete
                  ? "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/5"
                  : "bg-[#C4A035]/8 dark:bg-[#D4A843]/5"
              }`}
            >
              {isDocumentsComplete ? (
                <CheckCircle2 className="w-5 h-5 text-[#2B6F5E] dark:text-[#4ADE80] shrink-0" />
              ) : (
                <FileText className="w-5 h-5 text-[#C4A035] dark:text-[#D4A843] shrink-0" />
              )}
              <span
                className={
                  isDocumentsComplete
                    ? "text-[#2B6F5E] dark:text-[#4ADE80] font-medium"
                    : "text-[#C4A035] dark:text-[#D4A843] font-medium"
                }
              >
                {isDocumentsComplete
                  ? "Required documents uploaded"
                  : `Upload required documents (${missingDocuments.length} missing)`}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!isProfileComplete && (
              <Button
                onClick={() => navigate("/student/profile")}
                className="bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white rounded-xl px-6 gap-2 shadow-lg shadow-[#2B6F5E]/20"
              >
                <User className="w-4 h-4" />
                Complete Profile
              </Button>
            )}
            {!isDocumentsComplete && (
              <Button
                onClick={() => navigate("/student/documents")}
                className={`rounded-xl px-6 gap-2 shadow-lg ${
                  isProfileComplete
                    ? "bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white shadow-[#2B6F5E]/20"
                    : "bg-[#6B5D4F] hover:bg-[#6B5D4F]/90 text-white shadow-[#6B5D4F]/20"
                }`}
              >
                <FileText className="w-4 h-4" />
                Upload Documents
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-lg shadow-[#2B6F5E]/20 dark:shadow-black/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {step === "courses"
                ? "Browse Courses"
                : step === "levels"
                  ? `Select Level — ${selectedCourse?.course_name}`
                  : `Select Group — Level ${selectedLevel}`}
            </h1>
            <p className="text-sm text-[#BEB29E] dark:text-[#666666] mt-0.5">
              {step === "courses"
                ? "Choose a course to start your learning journey"
                : step === "levels"
                  ? "Pick your proficiency level"
                  : "Join a group that fits your schedule"}
            </p>
          </div>
        </div>
      </div>

      {step !== "courses" && (
        <Button
          variant="ghost"
          onClick={handleBack}
          className="gap-2 text-[#6B5D4F] dark:text-[#888888] hover:text-[#1B1B1B] dark:hover:text-[#E5E5E5] hover:bg-[#D8CDC0]/10 dark:hover:bg-[#222222] rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      )}

      {step === "courses" && (
        <CoursesList courses={courses} onSelectCourse={handleSelectCourse} />
      )}
      {step === "levels" && selectedCourse && (
        <LevelSelection
          levels={LEVELS}
          onSelectLevel={handleSelectLevel}
          selectedLevel={selectedLevel}
        />
      )}
      {step === "groups" && selectedLevel && (
        <GroupsList
          groups={groups}
          level={selectedLevel}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          onEnroll={handleEnrollInGroup}
          isEnrolling={enrollMutation.isPending}
          isLoading={groupsLoading}
        />
      )}

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => {
          setIsPricingModalOpen(false);
          setSelectedGroupForEnrollment(null);
        }}
        onConfirm={confirmEnrollment}
        courseId={selectedCourse?.course_id || null}
        courseName={selectedCourse?.course_name || ""}
        groupName={
          groups.find((g: Group) => g.group_id === selectedGroupForEnrollment)
            ?.name || ""
        }
        isEnrolling={enrollMutation.isPending}
      />
    </div>
  );
};

/* ==================== COURSES LIST ==================== */

const CoursesList = ({
  courses,
  onSelectCourse,
}: {
  courses: Course[];
  onSelectCourse: (c: Course) => void;
}) => {
  if (!courses || courses.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-12 text-center">
        <GraduationCap className="w-16 h-16 mx-auto text-[#D8CDC0] dark:text-[#333333] mb-4" />
        <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-2">
          No courses available
        </h3>
        <p className="text-[#6B5D4F] dark:text-[#888888]">
          Check back later for new course offerings
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {courses.map((course) => (
        <div
          key={course.course_id}
          onClick={() => onSelectCourse(course)}
          className="group relative border border-[#D8CDC0]/60 dark:border-[#2A2A2A] rounded-2xl p-6 hover:border-[#2B6F5E]/30 dark:hover:border-[#4ADE80]/20 hover:shadow-lg hover:shadow-[#2B6F5E]/5 dark:hover:shadow-black/20 transition-all cursor-pointer bg-white dark:bg-[#1A1A1A] overflow-hidden"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-[#1B1B1B] dark:text-[#E5E5E5] mb-2 group-hover:text-[#2B6F5E] dark:group-hover:text-[#4ADE80] transition-colors">
                {course.course_name}
              </h3>
              {course.course_code && (
                <p className="text-sm text-[#BEB29E] dark:text-[#666666] font-mono">
                  {course.course_code}
                </p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-[#D8CDC0] dark:text-[#333333] group-hover:text-[#2B6F5E] dark:group-hover:text-[#4ADE80] group-hover:translate-x-1 transition-all" />
          </div>
          {course.description && (
            <p className="text-sm text-[#6B5D4F] dark:text-[#888888] line-clamp-2 mb-4">
              {course.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-sm text-[#BEB29E] dark:text-[#666666]">
            <BookOpen className="w-4 h-4" /> <span>Click to view levels</span>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ==================== LEVEL SELECTION ==================== */

const LevelSelection = ({
  levels,
  onSelectLevel,
  selectedLevel,
}: {
  levels: readonly Level[];
  onSelectLevel: (l: Level) => void;
  selectedLevel: Level | null;
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {levels.map((level) => (
        <button
          key={level}
          onClick={() => onSelectLevel(level)}
          className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 border-2 ${
            selectedLevel === level
              ? "ring-4 ring-offset-2 dark:ring-offset-[#0F0F0F] ring-[#2B6F5E] dark:ring-[#4ADE80] scale-105 shadow-xl dark:shadow-black/30"
              : "hover:scale-105 hover:shadow-lg dark:hover:shadow-black/20"
          } ${LEVEL_BG_COLORS[level]}`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${LEVEL_COLORS[level]} opacity-0 group-hover:opacity-10 transition-opacity`}
          />
          <div className="relative z-10 text-center">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${LEVEL_COLORS[level]} text-white text-3xl font-bold shadow-lg dark:shadow-black/30 mb-4`}
            >
              {level}
            </div>
            <h3 className="font-bold text-lg text-[#1B1B1B] dark:text-[#E5E5E5]">
              Level {level}
            </h3>
          </div>
        </button>
      ))}
    </div>
  );
};

/* ==================== GROUPS LIST ==================== */

const GroupsList = ({
  groups,
  level,
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  onEnroll,
  isEnrolling,
  isLoading,
}: {
  groups: Group[];
  level: Level;
  searchTerm: string;
  setSearchTerm: (t: string) => void;
  selectedStatus: Status;
  setSelectedStatus: (s: Status) => void;
  onEnroll: (id: string) => void;
  isEnrolling: boolean;
  isLoading: boolean;
}) => {
  if (isLoading) return <PageLoader />;

  const levelGroups = groups.filter((g) => g.level === level);
  const filteredGroups = levelGroups.filter((group) => {
    const matchesSearch = group.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    let matchesStatus = true;
    if (selectedStatus !== "ALL") {
      const isFull = group.current_capacity >= group.max_students;
      const isClosed = group.status === "CLOSED";
      if (selectedStatus === "OPEN")
        matchesStatus = !isFull && !isClosed && group.status === "OPEN";
      else if (selectedStatus === "FULL") matchesStatus = isFull;
      else if (selectedStatus === "CLOSED") matchesStatus = isClosed;
    }
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#BEB29E] dark:text-[#555555]" />
            <Input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] dark:placeholder:text-[#555555] focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/30 focus:ring-[#2B6F5E]/20 dark:focus:ring-[#4ADE80]/10 rounded-xl"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#BEB29E] dark:text-[#555555] pointer-events-none" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Status)}
              className="w-full pl-10 pr-10 py-2.5 border border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#2B6F5E]/20 dark:focus:ring-[#4ADE80]/10 focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/30 appearance-none bg-white dark:bg-[#222222] cursor-pointer text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Groups" : `${s} Groups`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(selectedStatus !== "ALL" || searchTerm) && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
            <span className="text-xs text-[#BEB29E] dark:text-[#666666]">
              Active filters:
            </span>
            {selectedStatus !== "ALL" && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80]">
                Status: {selectedStatus}
                <button
                  onClick={() => setSelectedStatus("ALL")}
                  className="ml-1 hover:text-[#1B1B1B] dark:hover:text-[#E5E5E5]"
                >
                  ×
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-[#C4A035]/8 dark:bg-[#D4A843]/10 text-[#C4A035] dark:text-[#D4A843]">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 hover:text-[#1B1B1B] dark:hover:text-[#E5E5E5]"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
          Found{" "}
          <span className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {filteredGroups.length}
          </span>{" "}
          group{filteredGroups.length !== 1 ? "s" : ""}
        </p>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-[#D8CDC0] dark:text-[#333333] mb-4" />
          <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-2">
            No groups found
          </h3>
          <p className="text-[#6B5D4F] dark:text-[#888888]">
            {levelGroups.length === 0
              ? `No groups available for Level ${level}`
              : "Try adjusting your filters or search term"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

const GroupCard = ({
  group,
  onEnroll,
  isEnrolling,
}: {
  group: Group;
  onEnroll: (id: string) => void;
  isEnrolling: boolean;
}) => {
  const currentCapacity = group.current_capacity;
  const maxCapacity = group.max_students;
  const capacityPercent = (currentCapacity / maxCapacity) * 100;
  const availableSeats = maxCapacity - currentCapacity;
  const isFull = currentCapacity >= maxCapacity;
  const isClosed = group.status === "CLOSED";
  const isOpen = !isFull && !isClosed && group.status === "OPEN";

  return (
    <div
      className={`border-2 rounded-2xl p-5 transition-all ${isOpen ? "hover:shadow-md dark:hover:shadow-black/20 hover:border-[#2B6F5E]/30 dark:hover:border-[#4ADE80]/20" : "opacity-75"} ${LEVEL_BG_COLORS[group.level]}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#1B1B1B] dark:text-[#E5E5E5] text-lg mb-1 truncate">
            {group.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-br ${LEVEL_COLORS[group.level]} text-white shadow-sm dark:shadow-black/20`}
            >
              {group.level}
            </span>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isClosed
                  ? "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] text-[#6B5D4F] dark:text-[#888888]"
                  : isFull
                    ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                    : "bg-[#8DB896]/12 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80]"
              }`}
            >
              {isClosed ? (
                <>
                  <Lock className="w-3 h-3 mr-1" /> CLOSED
                </>
              ) : isFull ? (
                <>
                  <Lock className="w-3 h-3 mr-1" /> FULL
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 mr-1" /> OPEN
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Teacher */}
      <div className="mb-4 p-3 bg-white/70 dark:bg-[#1A1A1A]/70 rounded-xl">
        <p className="text-xs text-[#BEB29E] dark:text-[#666666] mb-1">
          Instructor
        </p>
        <div className="flex items-center gap-2 text-sm">
          {group.teacher ? (
            <>
              <UserCheck className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80] shrink-0" />
              <span className="font-medium text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
                {group.teacher.first_name} {group.teacher.last_name}
              </span>
            </>
          ) : (
            <>
              <User className="w-4 h-4 text-[#BEB29E] dark:text-[#555555] shrink-0" />
              <span className="text-[#BEB29E] dark:text-[#555555] italic">
                Not assigned
              </span>
            </>
          )}
        </div>
      </div>

      {/* Capacity */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-[#6B5D4F] dark:text-[#888888] flex items-center gap-1">
            <Users className="w-4 h-4 shrink-0" /> Capacity
          </span>
          <span className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {currentCapacity} / {maxCapacity}
          </span>
        </div>
        <div className="w-full bg-[#D8CDC0]/30 dark:bg-[#2A2A2A] rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              capacityPercent >= 100
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : capacityPercent >= 80
                  ? "bg-gradient-to-r from-[#C4A035] to-[#C4A035]/80"
                  : "bg-gradient-to-r from-[#2B6F5E] to-[#8DB896]"
            }`}
            style={{ width: `${Math.min(capacityPercent, 100)}%` }}
          />
        </div>
        <p
          className={`text-xs mt-1 ${availableSeats <= 0 ? "text-red-600 dark:text-red-400 font-medium" : "text-[#BEB29E] dark:text-[#666666]"}`}
        >
          {availableSeats <= 0 ? (
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> No seats available
            </span>
          ) : (
            `${availableSeats} seat${availableSeats > 1 ? "s" : ""} available`
          )}
        </p>
      </div>

      {/* Enroll Button */}
      <Button
        onClick={() => onEnroll(group.group_id)}
        disabled={!isOpen || isEnrolling}
        className={`w-full gap-2 text-sm font-semibold rounded-xl ${
          isOpen
            ? "bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white shadow-md shadow-[#2B6F5E]/20 hover:shadow-lg"
            : "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] text-[#BEB29E] dark:text-[#555555] cursor-not-allowed"
        }`}
      >
        {isEnrolling ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
            Enrolling...
          </>
        ) : !isOpen ? (
          <>
            <Lock className="w-4 h-4" />{" "}
            {isClosed ? "Group Closed" : "Group Full"}
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" /> Enroll in This Group
          </>
        )}
      </Button>
    </div>
  );
};

export default Courses;
