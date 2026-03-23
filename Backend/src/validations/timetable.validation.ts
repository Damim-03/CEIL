// src/validations/timetable.validation.ts

import { Request, Response, NextFunction } from "express";
import { VALID_LANGUAGES, VALID_LEVELS } from "../types/timetable.types";

function isValidTime(t: string): boolean {
  return /^\d{2}:\d{2}$/.test(t);
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function validateCreateEntry(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const {
    room_id,
    day_of_week,
    start_time,
    end_time,
    level,
    language,
    group_label,
  } = req.body;
  const errors: string[] = [];

  if (!room_id || typeof room_id !== "string") errors.push("room_id مطلوب");

  // ✅ إصلاح: نحول لـ number أولاً ثم نتحقق
  // day_of_week: 0 هو falsy لكن صالح!
  const dayNum = Number(day_of_week);
  if (
    day_of_week === undefined ||
    day_of_week === null ||
    day_of_week === "" ||
    isNaN(dayNum) ||
    dayNum < 0 ||
    dayNum > 5
  )
    errors.push("day_of_week يجب أن يكون رقمًا بين 0 (السبت) و 5 (الخميس)");
  else req.body.day_of_week = dayNum; // ← نضمن أنه number في الـ controller

  if (!start_time || !isValidTime(start_time))
    errors.push("start_time يجب أن يكون بصيغة HH:MM");

  if (!end_time || !isValidTime(end_time))
    errors.push("end_time يجب أن يكون بصيغة HH:MM");

  if (
    start_time &&
    end_time &&
    isValidTime(start_time) &&
    isValidTime(end_time)
  ) {
    if (timeToMinutes(start_time) >= timeToMinutes(end_time))
      errors.push("start_time يجب أن يكون قبل end_time");
  }

  if (!level || !(VALID_LEVELS as readonly string[]).includes(level))
    errors.push(`level غير صالح. القيم: ${VALID_LEVELS.join(", ")}`);

  if (!language || !(VALID_LANGUAGES as readonly string[]).includes(language))
    errors.push(`language غير صالح. القيم: ${VALID_LANGUAGES.join(", ")}`);

  if (!group_label || typeof group_label !== "string" || !group_label.trim())
    errors.push("group_label مطلوب");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

export function validateUpdateEntry(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { day_of_week, start_time, end_time, level, language } = req.body;
  const errors: string[] = [];

  if (day_of_week !== undefined && day_of_week !== null && day_of_week !== "") {
    const dayNum = Number(day_of_week);
    if (isNaN(dayNum) || dayNum < 0 || dayNum > 5)
      errors.push("day_of_week يجب أن يكون بين 0 و 5");
    else req.body.day_of_week = dayNum;
  }

  if (start_time !== undefined && !isValidTime(start_time))
    errors.push("start_time بصيغة HH:MM");

  if (end_time !== undefined && !isValidTime(end_time))
    errors.push("end_time بصيغة HH:MM");

  if (
    level !== undefined &&
    !(VALID_LEVELS as readonly string[]).includes(level)
  )
    errors.push("level غير صالح");

  if (
    language !== undefined &&
    !(VALID_LANGUAGES as readonly string[]).includes(language)
  )
    errors.push("language غير صالح");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}
