// ================================================================
// 🖨️ AttendancePrintView.tsx
// Generates a printable attendance sheet in a new browser window
// Supports Arabic RTL + French/English LTR
// ================================================================

import type { Session } from "../../../types/Types";

interface PrintableStudent {
  student_id: string;
  student_name: string;
  student_email: string;
  status: "PRESENT" | "ABSENT" | null;
  attended_at: string | null;
}

interface PrintOptions {
  session: Session;
  records: PrintableStudent[];
  locale: string;
  lang: "ar" | "fr" | "en";
}

// ─── Labels ───────────────────────────────────────────

const labels = {
  ar: {
    title: "كشف الحضور",
    institution: "مركز التعليم المكثف للغات",
    university: "جامعة قاصدي مرباح - ورقلة",
    course: "الدورة",
    group: "المجموعة",
    date: "التاريخ",
    time: "التوقيت",
    teacher: "الأستاذ(ة)",
    room: "القاعة",
    topic: "الموضوع",
    num: "الرقم",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    status: "الحالة",
    timeMarked: "وقت التسجيل",
    signature: "التوقيع",
    present: "حاضر",
    absent: "غائب",
    unmarked: "—",
    total: "الإجمالي",
    totalPresent: "الحاضرون",
    totalAbsent: "الغائبون",
    attendanceRate: "نسبة الحضور",
    teacherSignature: "توقيع الأستاذ(ة)",
    adminSignature: "توقيع الإدارة",
    printedAt: "طُبعت بتاريخ",
    level: "المستوى",
    noTeacher: "غير محدد",
    noRoom: "غير محددة",
    print: "طباعة",
    close: "إغلاق",
  },
  fr: {
    title: "Feuille de Présence",
    institution: "Centre d'Enseignement Intensif des Langues",
    university: "Université Kasdi Merbah - Ouargla",
    course: "Cours",
    group: "Groupe",
    date: "Date",
    time: "Heure",
    teacher: "Enseignant(e)",
    room: "Salle",
    topic: "Sujet",
    num: "N°",
    fullName: "Nom Complet",
    email: "E-mail",
    status: "Statut",
    timeMarked: "Heure marquée",
    signature: "Signature",
    present: "Présent",
    absent: "Absent",
    unmarked: "—",
    total: "Total",
    totalPresent: "Présents",
    totalAbsent: "Absents",
    attendanceRate: "Taux de présence",
    teacherSignature: "Signature de l'enseignant(e)",
    adminSignature: "Signature de l'administration",
    printedAt: "Imprimé le",
    level: "Niveau",
    noTeacher: "Non assigné",
    noRoom: "Non assignée",
    print: "Imprimer",
    close: "Fermer",
  },
  en: {
    title: "Attendance Sheet",
    institution: "Centre for Intensive Language Teaching",
    university: "Kasdi Merbah University - Ouargla",
    course: "Course",
    group: "Group",
    date: "Date",
    time: "Time",
    teacher: "Teacher",
    room: "Room",
    topic: "Topic",
    num: "#",
    fullName: "Full Name",
    email: "Email",
    status: "Status",
    timeMarked: "Time Marked",
    signature: "Signature",
    present: "Present",
    absent: "Absent",
    unmarked: "—",
    total: "Total",
    totalPresent: "Present",
    totalAbsent: "Absent",
    attendanceRate: "Attendance Rate",
    teacherSignature: "Teacher's Signature",
    adminSignature: "Administration Signature",
    printedAt: "Printed on",
    level: "Level",
    noTeacher: "Not assigned",
    noRoom: "Not assigned",
    print: "Print",
    close: "Close",
  },
};

// ─── Main ─────────────────────────────────────────────

export function printAttendanceSheet({
  session,
  records,
  locale,
  lang,
}: PrintOptions) {
  const l = labels[lang] || labels.ar;
  const isRTL = lang === "ar";
  const dir = isRTL ? "rtl" : "ltr";
  const textAlign = isRTL ? "right" : "left";

  // Session info
  const group = session.group;
  const courseName = group?.course?.course_name || "—";
  const groupName = group?.name || "—";
  const groupLevel = group?.level || "";
  const teacher = group?.teacher
    ? `${group.teacher.first_name} ${group.teacher.last_name}`
    : l.noTeacher;
  const roomName = (session as any).room?.name || l.noRoom;
  const topic = session.topic || "—";

  // Formatters
  const fmtDate = (ds: string) => {
    try {
      return new Date(ds).toLocaleDateString(locale, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return ds;
    }
  };
  const fmtTime = (ds: string) => {
    try {
      return new Date(ds).toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return ds;
    }
  };
  const fmtTimeShort = (ds: string | null) => {
    if (!ds) return "—";
    try {
      return new Date(ds).toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  // Stats
  const total = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  const statusText = (s: "PRESENT" | "ABSENT" | null) =>
    s === "PRESENT" ? l.present : s === "ABSENT" ? l.absent : l.unmarked;
  const statusClass = (s: "PRESENT" | "ABSENT" | null) =>
    s === "PRESENT"
      ? "st-present"
      : s === "ABSENT"
        ? "st-absent"
        : "st-unmarked";

  const now = new Date().toLocaleString(locale);
  const endTime = (session as any).end_time;

  // ─── Build rows ────────────────────────────────────
  const rows = records
    .map(
      (r, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td class="name">${r.student_name}</td>
      <td class="email">${r.student_email || "—"}</td>
      <td class="${statusClass(r.status)}">${statusText(r.status)}</td>
      <td class="time-col">${fmtTimeShort(r.attended_at)}</td>
      <td class="sig-cell"></td>
    </tr>`,
    )
    .join("");

  // ─── HTML ──────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8"/>
<title>${l.title} — ${groupName} — ${fmtDate(session.session_date)}</title>
<style>
@page { size:A4; margin:14mm 11mm; }
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;font-size:11px;color:#1B1B1B;direction:${dir};line-height:1.45;background:#fff}

/* ── Header ── */
.header{text-align:center;border-bottom:3px double #2B6F5E;padding-bottom:10px;margin-bottom:14px}
.header .inst{font-size:15px;font-weight:700;color:#2B6F5E}
.header .univ{font-size:11.5px;color:#6B5D4F;margin-bottom:6px}
.header .ttl{font-size:19px;font-weight:800;color:#1B1B1B;letter-spacing:.5px}

/* ── Info grid ── */
.info{display:grid;grid-template-columns:1fr 1fr;gap:5px 18px;margin-bottom:12px;padding:9px 12px;background:#F8F6F3;border:1px solid #E8E0D8;border-radius:5px}
.info-row{display:flex;gap:5px;font-size:11px}
.info-row.full{grid-column:span 2}
.lbl{font-weight:700;color:#2B6F5E;min-width:65px;white-space:nowrap}
.val{color:#1B1B1B}

/* ── Table ── */
table{width:100%;border-collapse:collapse;margin-bottom:12px}
thead th{background:#2B6F5E;color:#fff;padding:6px 5px;font-size:10px;font-weight:600;text-align:center;border:1px solid #1F5A4A}
tbody td{padding:5px;border:1px solid #D8CDC0;font-size:10.5px;text-align:center}
tbody tr:nth-child(even){background:#FAFAF8}
.num{width:30px;color:#6B5D4F}
.name{text-align:${textAlign};font-weight:500}
.email{text-align:${textAlign};color:#6B5D4F;font-size:9.5px;direction:ltr}
.time-col{font-size:9px;direction:ltr}
.sig-cell{width:75px;min-height:26px}

.st-present{color:#2B6F5E;font-weight:700}
.st-absent{color:#DC2626;font-weight:700}
.st-unmarked{color:#C4A035;font-style:italic}

/* ── Stats bar ── */
.stats{display:flex;justify-content:space-around;padding:9px 12px;background:#F8F6F3;border:1px solid #E8E0D8;border-radius:5px;margin-bottom:22px}
.stat{text-align:center}
.stat-v{font-size:17px;font-weight:700}
.stat-v.grn{color:#2B6F5E}.stat-v.red{color:#DC2626}.stat-v.blu{color:#2563EB}
.stat-l{font-size:8.5px;color:#6B5D4F;text-transform:uppercase;letter-spacing:.4px}

/* ── Signatures ── */
.sigs{display:flex;justify-content:space-between;margin-top:28px}
.sig-block{text-align:center;width:40%}
.sig-line{border-top:1px solid #1B1B1B;margin-top:48px;padding-top:5px;font-size:11px;font-weight:600;color:#2B6F5E}

/* ── Footer ── */
.footer{margin-top:18px;text-align:center;font-size:8.5px;color:#BEB29E;border-top:1px solid #E8E0D8;padding-top:6px}

/* ── Print bar ── */
.bar{text-align:center;padding:10px;background:#2B6F5E;position:sticky;top:0;z-index:10}
.bar button{border:none;padding:8px 22px;font-size:13px;font-weight:600;border-radius:5px;cursor:pointer;margin:0 4px}
.bar .pr{background:#fff;color:#2B6F5E}
.bar .cl{background:transparent;color:#fff;border:1px solid #fff}

@media print{
  body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .bar{display:none!important}
}
</style>
</head>
<body>

<!-- Print bar -->
<div class="bar">
  <button class="pr" onclick="window.print()">🖨️ ${l.print}</button>
  <button class="cl" onclick="window.close()">${l.close}</button>
</div>

<!-- Header -->
<div class="header">
  <div class="inst">${l.institution}</div>
  <div class="univ">${l.university}</div>
  <div class="ttl">${l.title}</div>
</div>

<!-- Session info -->
<div class="info">
  <div class="info-row"><span class="lbl">${l.course}:</span><span class="val">${courseName}</span></div>
  <div class="info-row"><span class="lbl">${l.group}:</span><span class="val">${groupName}${groupLevel ? ` (${l.level}: ${groupLevel})` : ""}</span></div>
  <div class="info-row"><span class="lbl">${l.date}:</span><span class="val">${fmtDate(session.session_date)}</span></div>
  <div class="info-row"><span class="lbl">${l.time}:</span><span class="val">${fmtTime(session.session_date)}${endTime ? ` → ${fmtTime(endTime)}` : ""}</span></div>
  <div class="info-row"><span class="lbl">${l.teacher}:</span><span class="val">${teacher}</span></div>
  <div class="info-row"><span class="lbl">${l.room}:</span><span class="val">${roomName}</span></div>
  ${topic !== "—" ? `<div class="info-row full"><span class="lbl">${l.topic}:</span><span class="val">${topic}</span></div>` : ""}
</div>

<!-- Table -->
<table>
  <thead>
    <tr>
      <th>${l.num}</th>
      <th>${l.fullName}</th>
      <th>${l.email}</th>
      <th style="width:60px">${l.status}</th>
      <th style="width:82px">${l.timeMarked}</th>
      <th style="width:75px">${l.signature}</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>

<!-- Stats -->
<div class="stats">
  <div class="stat"><div class="stat-v">${total}</div><div class="stat-l">${l.total}</div></div>
  <div class="stat"><div class="stat-v grn">${present}</div><div class="stat-l">${l.totalPresent}</div></div>
  <div class="stat"><div class="stat-v red">${absent}</div><div class="stat-l">${l.totalAbsent}</div></div>
  <div class="stat"><div class="stat-v blu">${rate}%</div><div class="stat-l">${l.attendanceRate}</div></div>
</div>

<!-- Signatures -->
<div class="sigs">
  <div class="sig-block"><div class="sig-line">${l.teacherSignature}</div></div>
  <div class="sig-block"><div class="sig-line">${l.adminSignature}</div></div>
</div>

<!-- Footer -->
<div class="footer">${l.printedAt}: ${now} &nbsp;|&nbsp; CEIL — ${l.university}</div>

</body>
</html>`;

  // ─── Open & print ──────────────────────────────────
  const w = window.open("", "_blank", "width=820,height=920");
  if (w) {
    w.document.write(html);
    w.document.close();
    w.onload = () => setTimeout(() => w.print(), 350);
  }
}
