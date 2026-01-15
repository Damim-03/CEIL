export const languages = [
  {
    id: "english",
    name: "English",
    nameAr: "الإنجليزية",
    flag: "/flags/en.svg",
    description: "Master the global language of business, technology, and international communication.",
    descriptionAr: "أتقن اللغة العالمية للأعمال والتكنولوجيا والتواصل الدولي.",
    color: "bg-blue-500",
  },
  {
    id: "french",
    name: "French",
    nameAr: "الفرنسية",
    flag: "/flags/fr.svg",
    description: "Discover the language of art, diplomacy, and culture spoken across five continents.",
    descriptionAr: "اكتشف لغة الفن والدبلوماسية والثقافة المنتشرة في خمس قارات.",
    color: "bg-sky-500",
  },
  {
    id: "german",
    name: "German",
    nameAr: "الألمانية",
    flag: "/flags/gr.svg",
    description: "Learn the language of innovation and Europe's largest economy.",
    descriptionAr: "تعلم لغة الابتكار وأكبر اقتصاد في أوروبا.",
    color: "bg-amber-500",
  },
  {
    id: "spanish",
    name: "Spanish",
    nameAr: "الإسبانية",
    flag: "/flags/sp.svg",
    description: "Connect with 500+ million speakers across the Americas and Europe.",
    descriptionAr: "تواصل مع أكثر من 500 مليون متحدث في الأمريكتين وأوروبا.",
    color: "bg-red-500",
  },
  {
    id: "italian",
    name: "Italian",
    nameAr: "الإيطالية",
    flag: "/flags/it.svg",
    description: "Explore the language of art, music, cuisine, and rich heritage.",
    descriptionAr: "استكشف لغة الفن والموسيقى والمطبخ والتراث الغني.",
    color: "bg-emerald-500",
  },
]

export const levels = [
  {
    id: "A1",
    name: "A1 - Beginner",
    nameAr: "A1 - مبتدئ",
    description: "Start your journey with basic vocabulary, simple phrases, and fundamental grammar.",
    descriptionAr: "ابدأ رحلتك مع المفردات الأساسية والعبارات البسيطة والقواعد الأساسية.",
    duration: "12 weeks",
    hours: "48 hours",
  },
  {
    id: "A2",
    name: "A2 - Elementary",
    nameAr: "A2 - ابتدائي",
    description: "Build on basics with everyday expressions and routine communication skills.",
    descriptionAr: "ابنِ على الأساسيات مع التعبيرات اليومية ومهارات التواصل الروتينية.",
    duration: "12 weeks",
    hours: "48 hours",
  },
  {
    id: "B1",
    name: "B1 - Intermediate",
    nameAr: "B1 - متوسط",
    description: "Develop independence in traveling, work, and personal conversations.",
    descriptionAr: "طور استقلاليتك في السفر والعمل والمحادثات الشخصية.",
    duration: "16 weeks",
    hours: "64 hours",
  },
  {
    id: "B2",
    name: "B2 - Upper Intermediate",
    nameAr: "B2 - فوق المتوسط",
    description: "Achieve fluency for complex topics, professional settings, and academic pursuits.",
    descriptionAr: "حقق الطلاقة للموضوعات المعقدة والإعدادات المهنية والمساعي الأكاديمية.",
    duration: "16 weeks",
    hours: "64 hours",
  },
]

export interface Group {
  id: string
  name: string
  nameAr: string
  languageId: string
  levelId: string
  availableSeats: number
  totalSeats: number
  schedule: {
    period: "morning" | "evening"
    periodAr: string
    days: string[]
    daysAr: string[]
    time: string
  }
}

export const groups: Group[] = [
  // English A1 Groups
  {
    id: "en-a1-g1",
    name: "Group A",
    nameAr: "المجموعة أ",
    languageId: "english",
    levelId: "A1",
    availableSeats: 15,
    totalSeats: 20,
    schedule: {
      period: "morning",
      periodAr: "صباحي",
      days: ["Sunday", "Tuesday"],
      daysAr: ["الأحد", "الثلاثاء"],
      time: "09:00 - 11:00",
    },
  },
  {
    id: "en-a1-g2",
    name: "Group B",
    nameAr: "المجموعة ب",
    languageId: "english",
    levelId: "A1",
    availableSeats: 8,
    totalSeats: 20,
    schedule: {
      period: "evening",
      periodAr: "مسائي",
      days: ["Monday", "Wednesday"],
      daysAr: ["الاثنين", "الأربعاء"],
      time: "17:00 - 19:00",
    },
  },
  // English A2 Groups
  {
    id: "en-a2-g1",
    name: "Group A",
    nameAr: "المجموعة أ",
    languageId: "english",
    levelId: "A2",
    availableSeats: 12,
    totalSeats: 20,
    schedule: {
      period: "morning",
      periodAr: "صباحي",
      days: ["Sunday", "Thursday"],
      daysAr: ["الأحد", "الخميس"],
      time: "09:00 - 11:00",
    },
  },
  // French A1 Groups
  {
    id: "fr-a1-g1",
    name: "Group A",
    nameAr: "المجموعة أ",
    languageId: "french",
    levelId: "A1",
    availableSeats: 18,
    totalSeats: 20,
    schedule: {
      period: "morning",
      periodAr: "صباحي",
      days: ["Monday", "Wednesday"],
      daysAr: ["الاثنين", "الأربعاء"],
      time: "10:00 - 12:00",
    },
  },
  {
    id: "fr-a1-g2",
    name: "Group B",
    nameAr: "المجموعة ب",
    languageId: "french",
    levelId: "A1",
    availableSeats: 5,
    totalSeats: 20,
    schedule: {
      period: "evening",
      periodAr: "مسائي",
      days: ["Tuesday", "Thursday"],
      daysAr: ["الثلاثاء", "الخميس"],
      time: "18:00 - 20:00",
    },
  },
  // German A1 Groups
  {
    id: "de-a1-g1",
    name: "Group A",
    nameAr: "المجموعة أ",
    languageId: "german",
    levelId: "A1",
    availableSeats: 14,
    totalSeats: 20,
    schedule: {
      period: "morning",
      periodAr: "صباحي",
      days: ["Sunday", "Tuesday"],
      daysAr: ["الأحد", "الثلاثاء"],
      time: "08:00 - 10:00",
    },
  },
  // Spanish A1 Groups
  {
    id: "es-a1-g1",
    name: "Group A",
    nameAr: "المجموعة أ",
    languageId: "spanish",
    levelId: "A1",
    availableSeats: 10,
    totalSeats: 20,
    schedule: {
      period: "evening",
      periodAr: "مسائي",
      days: ["Monday", "Wednesday"],
      daysAr: ["الاثنين", "الأربعاء"],
      time: "17:00 - 19:00",
    },
  },
  // Italian A1 Groups
  {
    id: "it-a1-g1",
    name: "Group A",
    nameAr: "المجموعة أ",
    languageId: "italian",
    levelId: "A1",
    availableSeats: 16,
    totalSeats: 20,
    schedule: {
      period: "morning",
      periodAr: "صباحي",
      days: ["Tuesday", "Thursday"],
      daysAr: ["الثلاثاء", "الخميس"],
      time: "09:00 - 11:00",
    },
  },
  // Arabic A1 Groups
  {
    id: "ar-a1-g1",
    name: "Group A",
    nameAr: "المجموعة أ",
    languageId: "arabic",
    levelId: "A1",
    availableSeats: 12,
    totalSeats: 20,
    schedule: {
      period: "morning",
      periodAr: "صباحي",
      days: ["Sunday", "Wednesday"],
      daysAr: ["الأحد", "الأربعاء"],
      time: "10:00 - 12:00",
    },
  },
]

export interface Announcement {
  id: string
  title: string
  titleAr: string
  content: string
  contentAr: string
  date: string
  important: boolean
}

export const announcements: Announcement[] = [
  {
    id: "1",
    title: "Registration Open for Spring 2025",
    titleAr: "التسجيل مفتوح لربيع 2025",
    content: "Online registration is now open for all language courses. Register early to secure your spot!",
    contentAr: "التسجيل الإلكتروني مفتوح الآن لجميع دورات اللغات. سجل مبكراً لضمان مقعدك!",
    date: "2025-01-10",
    important: true,
  },
  {
    id: "2",
    title: "New German B2 Course Available",
    titleAr: "دورة ألمانية B2 جديدة متاحة",
    content: "We are pleased to announce the opening of a new German B2 course starting next month.",
    contentAr: "يسعدنا الإعلان عن افتتاح دورة ألمانية B2 جديدة تبدأ الشهر المقبل.",
    date: "2025-01-08",
    important: false,
  },
  {
    id: "3",
    title: "Center Holiday Notice",
    titleAr: "إشعار عطلة المركز",
    content: "The center will be closed from January 25-28 for the national holiday. Classes resume January 29.",
    contentAr: "سيكون المركز مغلقاً من 25 إلى 28 يناير بمناسبة العطلة الوطنية. تستأنف الدروس في 29 يناير.",
    date: "2025-01-05",
    important: true,
  },
]

export const occupationTypes = [
  { id: "student", label: "Student", labelAr: "طالب" },
  { id: "employee", label: "Employee", labelAr: "موظف" },
  { id: "teacher", label: "Teacher", labelAr: "أستاذ" },
]

export type RegistrationStatus = "pending" | "accepted" | "rejected"

export interface Registration {
  id: string
  firstName: string
  lastName: string
  foreignName: string
  email: string
  phone: string
  dateOfBirth: string
  placeOfBirth: string
  occupation: string
  language: string
  level: string
  groupId: string
  groupName: string
  schedule: string
  hasCertificate: boolean
  status: RegistrationStatus
  createdAt: string
  idDocument?: string
  certificateDocument?: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  foreignName: string
  email: string
  phone: string
  dateOfBirth: string
  placeOfBirth: string
  occupation: string
  role: "student" | "admin"
}

// Mock data for demonstration
export const mockRegistrations: Registration[] = [
  {
    id: "1",
    firstName: "أحمد",
    lastName: "بن علي",
    foreignName: "Ahmed Ben Ali",
    email: "ahmed.benali@email.com",
    phone: "+213 555 123 456",
    dateOfBirth: "1995-03-15",
    placeOfBirth: "الجزائر العاصمة",
    occupation: "student",
    language: "French",
    level: "A1",
    groupId: "fr-a1-g1",
    groupName: "Group A",
    schedule: "Morning - Mon, Wed - 10:00-12:00",
    hasCertificate: false,
    status: "pending",
    createdAt: "2025-01-10",
  },
  {
    id: "2",
    firstName: "فاطمة",
    lastName: "زهراوي",
    foreignName: "Fatima Zahraoui",
    email: "fatima.z@email.com",
    phone: "+213 555 234 567",
    dateOfBirth: "1998-07-22",
    placeOfBirth: "وهران",
    occupation: "employee",
    language: "German",
    level: "A1",
    groupId: "de-a1-g1",
    groupName: "Group A",
    schedule: "Morning - Sun, Tue - 08:00-10:00",
    hasCertificate: true,
    status: "accepted",
    createdAt: "2025-01-08",
  },
  {
    id: "3",
    firstName: "محمد",
    lastName: "كريم",
    foreignName: "Mohamed Karim",
    email: "m.karim@email.com",
    phone: "+213 555 345 678",
    dateOfBirth: "2000-11-30",
    placeOfBirth: "قسنطينة",
    occupation: "student",
    language: "Spanish",
    level: "A1",
    groupId: "es-a1-g1",
    groupName: "Group A",
    schedule: "Evening - Mon, Wed - 17:00-19:00",
    hasCertificate: false,
    status: "pending",
    createdAt: "2025-01-12",
  },
  {
    id: "4",
    firstName: "سارة",
    lastName: "بوعلام",
    foreignName: "Sara Boualem",
    email: "sara.b@email.com",
    phone: "+213 555 456 789",
    dateOfBirth: "1992-05-18",
    placeOfBirth: "عنابة",
    occupation: "teacher",
    language: "Italian",
    level: "A1",
    groupId: "it-a1-g1",
    groupName: "Group A",
    schedule: "Morning - Tue, Thu - 09:00-11:00",
    hasCertificate: true,
    status: "rejected",
    createdAt: "2025-01-05",
  },
  {
    id: "5",
    firstName: "ياسين",
    lastName: "حمادي",
    foreignName: "Yacine Hamadi",
    email: "yacine.h@email.com",
    phone: "+213 555 567 890",
    dateOfBirth: "1997-09-08",
    placeOfBirth: "البليدة",
    occupation: "employee",
    language: "English",
    level: "A1",
    groupId: "en-a1-g1",
    groupName: "Group A",
    schedule: "Morning - Sun, Tue - 09:00-11:00",
    hasCertificate: false,
    status: "accepted",
    createdAt: "2025-01-09",
  },
  {
    id: "6",
    firstName: "نور",
    lastName: "سعيدي",
    foreignName: "Nour Saidi",
    email: "nour.s@email.com",
    phone: "+213 555 678 901",
    dateOfBirth: "1999-02-25",
    placeOfBirth: "سطيف",
    occupation: "student",
    language: "English",
    level: "A1",
    groupId: "en-a1-g2",
    groupName: "Group B",
    schedule: "Evening - Mon, Wed - 17:00-19:00",
    hasCertificate: false,
    status: "pending",
    createdAt: "2025-01-11",
  },
]

export const mockUser: User = {
  id: "user-1",
  firstName: "أحمد",
  lastName: "بن علي",
  foreignName: "Ahmed Ben Ali",
  email: "ahmed.benali@email.com",
  phone: "+213 555 123 456",
  dateOfBirth: "1995-03-15",
  placeOfBirth: "الجزائر العاصمة",
  occupation: "student",
  role: "student",
}

export const mockStudentRegistration: Registration = {
  id: "1",
  firstName: "أحمد",
  lastName: "بن علي",
  foreignName: "Ahmed Ben Ali",
  email: "ahmed.benali@email.com",
  phone: "+213 555 123 456",
  dateOfBirth: "1995-03-15",
  placeOfBirth: "الجزائر العاصمة",
  occupation: "student",
  language: "French",
  level: "A1",
  groupId: "fr-a1-g1",
  groupName: "Group A",
  schedule: "Morning - Mon, Wed - 10:00-12:00",
  hasCertificate: false,
  status: "pending",
  createdAt: "2025-01-10",
}
