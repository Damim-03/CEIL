// ================================================================
// 📦 src/services/document.service.ts
// ✅ Document review — shared between Admin & Owner
// 🔌 Socket.IO events included
// ================================================================

import { prisma } from "../../prisma/client";
import { DocumentStatus } from "../../../generated/prisma";
import { emitToAdminLevel, emitToUser } from "../socket.service";

const ALLOWED_STATUSES: DocumentStatus[] = [
  DocumentStatus.APPROVED,
  DocumentStatus.REJECTED,
];

// ─── REVIEW DOCUMENT ─────────────────────────────────────

export async function reviewDocument(
  documentId: string,
  status: DocumentStatus,
  reviewerId: string,
) {
  // Validate status
  if (!ALLOWED_STATUSES.includes(status)) {
    return { error: "invalid_status" as const };
  }

  // Check exists
  const document = await prisma.document.findUnique({
    where: { document_id: documentId },
  });

  if (!document) return { error: "not_found" as const };

  // Prevent re-review
  if (document.status !== DocumentStatus.PENDING) {
    return { error: "already_reviewed" as const };
  }

  // Update
  const updated = await prisma.document.update({
    where: { document_id: documentId },
    data: {
      status,
      reviewed_at: new Date(),
      reviewed_by: reviewerId,
    },
  });

  // 🔌 Socket
  const eventName =
    status === DocumentStatus.APPROVED
      ? "document:approved"
      : "document:rejected";

  emitToAdminLevel(eventName, {
    document_id: documentId,
    student_id: document.student_id,
  });

  const studentUser = await prisma.user.findFirst({
    where: { student_id: document.student_id },
    select: { user_id: true },
  });
  if (studentUser) {
    emitToUser(studentUser.user_id, eventName, {
      document_id: documentId,
      student_id: document.student_id,
    });
  }

  return { data: updated };
}