// ================================================================
// 📦 src/utils/profileCompletion.ts
// ✅ حساب اكتمال حساب الطالب (معلومات + وثائق + تفعيل)
// ================================================================

import type { AdminStudent } from "../../types/Types";


export interface CompletionStep {
  key: string;
  labelAr: string;
  done: boolean;
  weight: number; // وزن هذه الخطوة من 100
}

export interface ProfileCompletion {
  percentage: number;        // 0-100
  isComplete: boolean;       // true إذا كل شيء مكتمل
  steps: CompletionStep[];
  infoScore: number;         // نسبة المعلومات الشخصية
  docsScore: number;         // نسبة الوثائق المعتمدة
  isActive: boolean;         // status === ACTIVE
}

export function getProfileCompletion(student: AdminStudent): ProfileCompletion {
  // ─── 1. المعلومات الشخصية (50%)
  const infoSteps: CompletionStep[] = [
    { key: "phone",     labelAr: "رقم الهاتف",    done: !!student.phone_number,     weight: 10 },
    { key: "dob",       labelAr: "تاريخ الميلاد", done: !!student.date_of_birth,    weight: 10 },
    { key: "gender",    labelAr: "الجنس",          done: !!student.gender,           weight: 5  },
    { key: "address",   labelAr: "العنوان",        done: !!student.address,          weight: 10 },
    { key: "education", labelAr: "المستوى التعليمي", done: !!student.education_level, weight: 10 },
    { key: "avatar",    labelAr: "الصورة الشخصية", done: !!student.avatar_url || !!student.user?.google_avatar, weight: 5 },
  ];

  // ─── 2. الوثائق (30%)
  const docs = student.documents ?? [];
  const approvedDocs = docs.filter((d) => d.status === "APPROVED").length;
  const hasAnyDocs = docs.length > 0;
  const hasApprovedDocs = approvedDocs > 0;

  const docSteps: CompletionStep[] = [
    { key: "docs_uploaded", labelAr: "رفع الوثائق",    done: hasAnyDocs,      weight: 15 },
    { key: "docs_approved", labelAr: "وثائق معتمدة",   done: hasApprovedDocs, weight: 15 },
  ];

  // ─── 3. تفعيل الحساب (20%)
  const isActive = student.status === "ACTIVE";
  const activeStep: CompletionStep = {
    key: "active",
    labelAr: "الحساب مفعّل",
    done: isActive,
    weight: 20,
  };

  const allSteps = [...infoSteps, ...docSteps, activeStep];

  // ─── حساب النسبة
  const totalWeight = allSteps.reduce((s, x) => s + x.weight, 0); // 100
  const earnedWeight = allSteps.filter((x) => x.done).reduce((s, x) => s + x.weight, 0);
  const percentage = Math.round((earnedWeight / totalWeight) * 100);

  const infoEarned = infoSteps.filter((x) => x.done).reduce((s, x) => s + x.weight, 0);
  const infoTotal  = infoSteps.reduce((s, x) => s + x.weight, 0);
  const docsEarned = docSteps.filter((x) => x.done).reduce((s, x) => s + x.weight, 0);
  const docsTotal  = docSteps.reduce((s, x) => s + x.weight, 0);

  return {
    percentage,
    isComplete: percentage === 100,
    steps: allSteps,
    infoScore: Math.round((infoEarned / infoTotal) * 100),
    docsScore: Math.round((docsEarned / docsTotal) * 100),
    isActive,
  };
}

// ─── لون وتسمية حسب النسبة
export function getCompletionColor(pct: number): string {
  if (pct === 100) return "#2B6F5E"; // تام — teal
  if (pct >= 70)   return "#C4A035"; // جيد — mustard
  if (pct >= 40)   return "#f97316"; // ناقص — orange
  return "#ef4444";                  // ضعيف — red
}

export function getCompletionLabel(pct: number): { ar: string; color: string } {
  if (pct === 100) return { ar: "مكتمل",  color: "#2B6F5E" };
  if (pct >= 70)   return { ar: "جيد",    color: "#C4A035" };
  if (pct >= 40)   return { ar: "ناقص",   color: "#f97316" };
  return                  { ar: "غير مكتمل", color: "#ef4444" };
}