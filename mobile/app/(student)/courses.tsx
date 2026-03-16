import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Search,
  Users,
  GraduationCap,
  UserCheck,
  CheckCircle,
  Lock,
  Unlock,
  User,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  BookOpen,
  Filter,
} from "lucide-react-native";
import {
  useCourses,
  useCourseGroups,
  useEnrollInCourse,
  useStudentEnrollments,
  useMyProfile,
  useMyDocuments,
} from "@/src/hooks/student/Usestudent";
import {
  PageLoader,
  ErrorState,
  EmptyState,
  StatusBadge,
} from "@/src/components/ui";
import { COLORS, SPACING, RADIUS } from "@/src/constants/theme";

type Level = "PRE_A1" | "A1" | "A2" | "B1" | "B2" | "C1";
type Step = "courses" | "levels" | "groups";

const LEVELS: Level[] = ["PRE_A1", "A1", "A2", "B1", "B2", "C1"];

const LEVEL_COLORS: Record<Level, string> = {
  PRE_A1: "#7C8FA6",
  A1: "#8DB896",
  A2: COLORS.tealMid,
  B1: COLORS.gold,
  B2: "#6B5D4F",
  C1: COLORS.tealMid,
};

export default function CoursesScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("courses");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const enrollMutation = useEnrollInCourse();
  const {
    data: courses = [],
    isLoading: coursesLoading,
    refetch,
    isRefetching,
  } = useCourses();
  const { data: groups = [], isLoading: groupsLoading } = useCourseGroups(
    selectedCourse?.course_id,
  );
  const { data: enrollments = [] } = useStudentEnrollments();
  const { data: profile } = useMyProfile();
  const { data: documentsData } = useMyDocuments();

  const isProfileComplete = !!(
    profile?.first_name &&
    profile?.last_name &&
    profile?.phone_number
  );
  const documents = Array.isArray(documentsData)
    ? documentsData
    : documentsData?.documents || [];
  const hasDocuments = documents.some((d: any) => d.status === "APPROVED");

  const handleSelectCourse = useCallback(
    (course: any) => {
      const enrollment = enrollments.find(
        (e: any) => e.course_id === course.course_id,
      );
      if (enrollment?.group_id) {
        Alert.alert(
          "Already Enrolled",
          `You're already enrolled in ${course.course_name}`,
        );
        return;
      }
      setSelectedCourse(course);
      setStep("levels");
    },
    [enrollments],
  );

  const handleSelectLevel = (level: Level) => {
    setSelectedLevel(level);
    setStep("groups");
  };

  const handleEnroll = (group: any) => {
    if (!isProfileComplete) {
      Alert.alert(
        "Profile Incomplete",
        "Please complete your profile before enrolling.",
        [
          {
            text: "Go to Profile",
            onPress: () => router.push("/(student)/profile"),
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
      return;
    }
    Alert.alert(
      "Confirm Enrollment",
      `Enroll in ${selectedCourse?.course_name} — ${group.name} (Level ${group.level})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Enroll",
          onPress: () => {
            enrollMutation.mutate(
              {
                course_id: selectedCourse.course_id,
                group_id: group.group_id,
                level: group.level,
              },
              {
                onSuccess: () => {
                  setStep("courses");
                  setSelectedCourse(null);
                  setSelectedLevel(null);
                },
              },
            );
          },
        },
      ],
    );
  };

  // ── Filtered lists ──
  const filteredCourses = courses.filter((c: any) =>
    c.course_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const levelsWithGroups = LEVELS.filter((level) =>
    (groups as any[]).some((g: any) => g.level === level),
  );

  const filteredGroups = (groups as any[]).filter((g: any) => {
    const matchLevel = g.level === selectedLevel;
    const matchStatus = statusFilter === "ALL" || g.status === statusFilter;
    return matchLevel && matchStatus;
  });

  if (coursesLoading) return <PageLoader />;

  // ── Step: Courses ──
  if (step === "courses") {
    return (
      <ScrollView
        style={s.root}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.tealMid}
          />
        }
      >
        {/* Header */}
        <View style={s.headerCard}>
          <View style={s.headerIcon}>
            <BookOpen size={22} color="#fff" />
          </View>
          <View>
            <Text style={s.headerTitle}>Available Courses</Text>
            <Text style={s.headerSub}>Select a course to enroll</Text>
          </View>
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <Search size={16} color={COLORS.textMuted} />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search courses..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {filteredCourses.length > 0 ? (
          filteredCourses.map((course: any) => {
            const enrollment = enrollments.find(
              (e: any) => e.course_id === course.course_id,
            );
            const isEnrolled = !!enrollment;

            return (
              <TouchableOpacity
                key={course.course_id}
                style={[s.courseCard, isEnrolled && s.courseCardEnrolled]}
                onPress={() => handleSelectCourse(course)}
                activeOpacity={0.85}
                disabled={isEnrolled}
              >
                <View
                  style={[
                    s.courseIconBox,
                    { backgroundColor: `${COLORS.tealMid}12` },
                  ]}
                >
                  <GraduationCap size={20} color={COLORS.tealMid} />
                </View>
                <View style={s.courseInfo}>
                  <Text style={s.courseName}>{course.course_name}</Text>
                  {course.course_code && (
                    <Text style={s.courseCode}>{course.course_code}</Text>
                  )}
                  {course.description && (
                    <Text style={s.courseDesc} numberOfLines={2}>
                      {course.description}
                    </Text>
                  )}
                </View>
                <View style={s.courseRight}>
                  {isEnrolled ? (
                    <StatusBadge label="Enrolled" variant="success" />
                  ) : (
                    <ChevronRight size={20} color={COLORS.textMuted} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <EmptyState
            icon={<BookOpen size={24} color={COLORS.textMuted} />}
            title="No courses available"
            subtitle="Check back later for available courses"
          />
        )}
      </ScrollView>
    );
  }

  // ── Step: Levels ──
  if (step === "levels") {
    return (
      <ScrollView
        style={s.root}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back header */}
        <View style={s.stepHeader}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => setStep("courses")}
            activeOpacity={0.8}
          >
            <ArrowLeft size={18} color={COLORS.tealMid} />
            <Text style={s.backBtnText}>Courses</Text>
          </TouchableOpacity>
          <Text style={s.stepTitle}>{selectedCourse?.course_name}</Text>
        </View>
        <Text style={s.stepSubtitle}>Select your proficiency level</Text>

        {groupsLoading ? (
          <PageLoader />
        ) : levelsWithGroups.length > 0 ? (
          levelsWithGroups.map((level) => {
            const levelGroups = (groups as any[]).filter(
              (g: any) => g.level === level,
            );
            const openGroups = levelGroups.filter(
              (g: any) => g.status === "OPEN",
            ).length;
            const color = LEVEL_COLORS[level];

            return (
              <TouchableOpacity
                key={level}
                style={[
                  s.levelCard,
                  { borderColor: `${color}30`, backgroundColor: `${color}06` },
                ]}
                onPress={() => handleSelectLevel(level)}
                activeOpacity={0.85}
              >
                <View style={[s.levelBadge, { backgroundColor: color }]}>
                  <Text style={s.levelBadgeText}>{level}</Text>
                </View>
                <View style={s.levelInfo}>
                  <Text style={s.levelName}>Level {level}</Text>
                  <Text style={s.levelMeta}>
                    {levelGroups.length} group
                    {levelGroups.length !== 1 ? "s" : ""} · {openGroups} open
                  </Text>
                </View>
                <ChevronRight size={18} color={color} />
              </TouchableOpacity>
            );
          })
        ) : (
          <EmptyState
            icon={<GraduationCap size={24} color={COLORS.textMuted} />}
            title="No groups available"
            subtitle="No groups found for this course"
          />
        )}
      </ScrollView>
    );
  }

  // ── Step: Groups ──
  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.stepHeader}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => setStep("levels")}
          activeOpacity={0.8}
        >
          <ArrowLeft size={18} color={COLORS.tealMid} />
          <Text style={s.backBtnText}>Levels</Text>
        </TouchableOpacity>
        <Text style={s.stepTitle}>Level {selectedLevel}</Text>
      </View>
      <Text style={s.stepSubtitle}>Choose a group to join</Text>

      {/* Status filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: SPACING.sm, paddingBottom: 4 }}
      >
        {["ALL", "OPEN", "FULL", "CLOSED"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.filterBtn, statusFilter === f && s.filterBtnActive]}
            onPress={() => setStatusFilter(f)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                s.filterBtnText,
                statusFilter === f && s.filterBtnTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredGroups.length > 0 ? (
        filteredGroups.map((group: any) => {
          const isOpen = group.status === "OPEN";
          const spotsLeft = group.max_students - (group.current_capacity || 0);
          const color = LEVEL_COLORS[group.level as Level] ?? COLORS.tealMid;

          return (
            <View key={group.group_id} style={s.groupCard}>
              <View
                style={[
                  s.groupTop,
                  {
                    backgroundColor: `${color}08`,
                    borderBottomColor: `${color}15`,
                  },
                ]}
              >
                <View style={s.groupTopLeft}>
                  <View style={[s.groupLevelBadge, { backgroundColor: color }]}>
                    <Text style={s.groupLevelText}>{group.level}</Text>
                  </View>
                  <View>
                    <Text style={s.groupName}>{group.name}</Text>
                    {group.teacher && (
                      <View style={s.groupTeacherRow}>
                        <User size={11} color={COLORS.textMuted} />
                        <Text style={s.groupTeacher}>
                          {group.teacher.first_name} {group.teacher.last_name}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <StatusBadge
                  label={group.status}
                  variant={
                    isOpen
                      ? "success"
                      : group.status === "FULL"
                        ? "warning"
                        : "error"
                  }
                />
              </View>

              <View style={s.groupBody}>
                <View style={s.groupStats}>
                  <View style={s.groupStat}>
                    <Users size={13} color={COLORS.textMuted} />
                    <Text style={s.groupStatText}>
                      {group.current_capacity || 0}/{group.max_students}
                    </Text>
                  </View>
                  <View style={s.groupStat}>
                    <Text style={s.groupStatText}>{spotsLeft} spots left</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[s.enrollBtn, !isOpen && s.enrollBtnDisabled]}
                  onPress={() => isOpen && handleEnroll(group)}
                  disabled={!isOpen || enrollMutation.isPending}
                  activeOpacity={0.85}
                >
                  {isOpen ? (
                    <Unlock size={14} color="#fff" />
                  ) : (
                    <Lock size={14} color={COLORS.textMuted} />
                  )}
                  <Text
                    style={[
                      s.enrollBtnText,
                      !isOpen && s.enrollBtnTextDisabled,
                    ]}
                  >
                    {isOpen ? "Enroll in this group" : group.status}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      ) : (
        <EmptyState
          icon={<Users size={24} color={COLORS.textMuted} />}
          title="No groups at this level"
          subtitle="Try selecting a different level"
        />
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8F4F0" },
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: 32 },

  headerCard: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.tealMid,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: "#fff",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },

  courseCard: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  courseCardEnrolled: {
    backgroundColor: `${COLORS.tealMid}04`,
    borderColor: `${COLORS.tealMid}20`,
  },
  courseIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  courseInfo: { flex: 1 },
  courseName: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  courseCode: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  courseDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
    lineHeight: 17,
  },
  courseRight: { flexShrink: 0 },

  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.xs,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  backBtnText: { fontSize: 14, color: COLORS.tealMid, fontWeight: "500" },
  stepTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: COLORS.text },
  stepSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },

  levelCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.lg,
  },
  levelBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  levelBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  levelInfo: { flex: 1 },
  levelName: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  levelMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  filterBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: "#fff",
  },
  filterBtnActive: {
    backgroundColor: COLORS.tealMid,
    borderColor: COLORS.tealMid,
  },
  filterBtnText: { fontSize: 12, color: COLORS.textMuted, fontWeight: "500" },
  filterBtnTextActive: { color: "#fff", fontWeight: "600" },

  groupCard: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: "hidden",
  },
  groupTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  groupTopLeft: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  groupLevelBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  groupLevelText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  groupName: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  groupTeacherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  groupTeacher: { fontSize: 11, color: COLORS.textMuted },
  groupBody: { padding: SPACING.md, gap: SPACING.md },
  groupStats: { flexDirection: "row", gap: SPACING.lg },
  groupStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  groupStatText: { fontSize: 12, color: COLORS.textMuted, fontWeight: "500" },
  enrollBtn: {
    backgroundColor: COLORS.tealMid,
    borderRadius: 14,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  enrollBtnDisabled: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  enrollBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  enrollBtnTextDisabled: { color: COLORS.textMuted },
});
