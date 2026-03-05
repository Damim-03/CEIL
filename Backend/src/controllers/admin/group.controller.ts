// ================================================================
// 📌 src/controllers/group.controller.ts
// ✅ Handles { error, data } from group.service
// ================================================================

import { Request, Response, NextFunction } from "express";
import * as GroupService from "../../services/admin/groupstatus.service";
import { GroupStatus, RegistrationStatus } from "../../../generated/prisma";

// ─── Error → HTTP status map ──────────────────────────────────

const ERROR_STATUS: Record<string, number> = {
  not_found: 404,
  from_group_not_found: 404,
  to_group_not_found: 404,
  teacher_not_found: 404,
  not_enrolled_in_source: 404,
  same_status: 400,
  same_group: 400,
  already_finished: 400,
  different_course: 400,
  target_finished: 400,
  target_full: 409,
  already_in_target: 409,
};

const ERROR_MESSAGE: Record<string, string> = {
  not_found: "Group not found",
  from_group_not_found: "Source group not found",
  to_group_not_found: "Target group not found",
  teacher_not_found: "Teacher not found",
  not_enrolled_in_source:
    "Student is not actively enrolled in the source group",
  same_status: "Group already has this status",
  same_group: "Source and target groups must be different",
  already_finished: "Cannot change status of a finished group",
  different_course: "Cannot transfer between different courses",
  target_finished: "Cannot transfer to a finished group",
  target_full: "Target group is full",
  already_in_target: "Student is already enrolled in the target group",
};

function handleError(res: Response, error: string) {
  const status = ERROR_STATUS[error] ?? 500;
  const message = ERROR_MESSAGE[error] ?? "Internal server error";
  res.status(status).json({ message, error });
}

function hasError(result: unknown): result is { error: string } {
  return (
    typeof result === "object" &&
    result !== null &&
    typeof (result as any).error === "string"
  );
}

// ─── GET /groups ──────────────────────────────────────────────

export async function getGroups(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      status,
      level,
      course_id,
      teacher_id,
      search,
      page = "1",
      limit = "20",
    } = req.query as Record<string, string>;

    const result = await GroupService.getGroups({
      status: status as GroupStatus | undefined,
      level,
      course_id,
      teacher_id,
      search,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ─── GET /groups/transfer-requests ───────────────────────────

export async function getTransferRequests(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await GroupService.getTransferRequests();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ─── GET /groups/:id ─────────────────────────────────────────

export async function getGroupById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const group = await GroupService.getGroupById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (err) {
    next(err);
  }
}

// ─── GET /groups/:id/students ────────────────────────────────

export async function getGroupStudents(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      status,
      page = "1",
      limit = "25",
    } = req.query as Record<string, string | undefined>;

    const VALID_STATUSES: RegistrationStatus[] = [
      "PENDING",
      "VALIDATED",
      "REJECTED",
      "PAID",
      "FINISHED",
    ];
    const resolvedStatus =
      status && VALID_STATUSES.includes(status as RegistrationStatus)
        ? (status as RegistrationStatus)
        : undefined;

    const result = await GroupService.getGroupStudents(req.params.groupId, {
      status: resolvedStatus,
      page: parseInt(page ?? "1"),
      limit: parseInt(limit ?? "25"),
    });

    if (hasError(result)) return handleError(res, result.error);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /groups/:id/status ────────────────────────────────

export async function changeGroupStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { status } = req.body as { status: GroupStatus };
    const changed_by: string = (req as any).user?.user_id ?? "";

    if (!status) return res.status(400).json({ message: "status is required" });

    const VALID: GroupStatus[] = ["OPEN", "FULL", "FINISHED"];
    if (!VALID.includes(status))
      return res
        .status(400)
        .json({ message: `status must be one of: ${VALID.join(", ")}` });

    const result = await GroupService.changeGroupStatus(
      req.params.groupId,
      status,
      changed_by,
    );
    if (hasError(result)) return handleError(res, result.error);

    res.json({ message: "Group status updated", group: result.data });
  } catch (err) {
    next(err);
  }
}

// ─── POST /groups/:id/transfer ───────────────────────────────

export async function transferStudent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { student_id, to_group_id } = req.body as {
      student_id: string;
      to_group_id: string;
    };
    const changed_by: string = (req as any).user?.user_id ?? "";

    if (!student_id || !to_group_id)
      return res
        .status(400)
        .json({ message: "student_id and to_group_id are required" });

    const result = await GroupService.transferStudent({
      student_id,
      from_group_id: req.params.groupId,
      to_group_id,
      changed_by,
    });

    if (hasError(result)) return handleError(res, result.error);
    res.json({ message: "Student transferred successfully", ...result.data });
  } catch (err) {
    next(err);
  }
}

// ─── GET /groups/:id/teacher ─────────────────────────────────

export async function getGroupTeacher(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await GroupService.getGroupTeacher(req.params.groupId);
    if (hasError(result)) return handleError(res, result.error);
    res.json(result.data);
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /groups/:id/teacher ───────────────────────────────

export async function assignTeacher(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { teacher_id } = req.body as { teacher_id?: string | null };

    if (
      teacher_id !== undefined &&
      teacher_id !== null &&
      typeof teacher_id !== "string"
    )
      return res
        .status(400)
        .json({ message: "teacher_id must be a string or null" });

    const resolvedId: string | null =
      typeof teacher_id === "string" ? teacher_id : null;
    const result = await GroupService.assignTeacher(
      req.params.groupId,
      resolvedId,
    );
    if (hasError(result)) return handleError(res, result.error);

    res.json({
      message: resolvedId ? "Teacher assigned" : "Teacher unassigned",
      group: result.data,
    });
  } catch (err) {
    next(err);
  }
}
