// ================================================================
// 📌 src/controllers/admin/Room.controller.ts
// ✅ Refactored: Uses RoomService (Socket.IO inside service)
// ================================================================

import { Request, Response } from "express";
import * as RoomService from "../../services/admin/Room.service";

/* ══════ CREATE ROOM ══════ */
export const createRoomController = async (req: Request, res: Response) => {
  try {
    const result = await RoomService.createRoom(req.body);
    if ("error" in result) {
      if (result.error === "name_required")
        return res.status(400).json({ message: "اسم القاعة مطلوب" });
      if (result.error === "duplicate_name")
        return res.status(409).json({ message: "يوجد قاعة بنفس الاسم" });
    }
    return res
      .status(201)
      .json({ message: "تم إنشاء القاعة بنجاح", room: result.data });
  } catch (error) {
    console.error("createRoom error:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء إنشاء القاعة" });
  }
};

/* ══════ GET ALL ROOMS ══════ */
export const getAllRoomsController = async (req: Request, res: Response) => {
  try {
    const rooms = await RoomService.listRooms({
      include_sessions: req.query.include_sessions === "true",
      active_only: req.query.active_only === "true",
    });
    return res.json(rooms);
  } catch (error) {
    console.error("getAllRooms error:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء جلب القاعات" });
  }
};

/* ══════ GET ROOM BY ID ══════ */
export const getRoomByIdController = async (req: Request, res: Response) => {
  try {
    const room = await RoomService.getRoomById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "القاعة غير موجودة" });
    return res.json(room);
  } catch (error) {
    console.error("getRoomById error:", error);
    return res
      .status(500)
      .json({ message: "حدث خطأ أثناء جلب بيانات القاعة" });
  }
};

/* ══════ UPDATE ROOM ══════ */
export const updateRoomController = async (req: Request, res: Response) => {
  try {
    const result = await RoomService.updateRoom(req.params.roomId, req.body);
    if ("error" in result) {
      if (result.error === "not_found")
        return res.status(404).json({ message: "القاعة غير موجودة" });
      if (result.error === "duplicate_name")
        return res
          .status(409)
          .json({ message: "يوجد قاعة أخرى بنفس الاسم" });
    }
    return res
      .json({ message: "تم تحديث القاعة بنجاح", room: result.data });
  } catch (error) {
    console.error("updateRoom error:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء تحديث القاعة" });
  }
};

/* ══════ DELETE ROOM ══════ */
export const deleteRoomController = async (req: Request, res: Response) => {
  try {
    const result = await RoomService.deleteRoom(req.params.roomId);
    if ("error" in result) {
      return res.status(404).json({ message: "القاعة غير موجودة" });
    }
    if (result.data === "deactivated") {
      return res.json({
        message: "القاعة مرتبطة بحصص سابقة، تم تعطيلها بدلاً من حذفها",
        deactivated: true,
      });
    }
    return res.json({ message: "تم حذف القاعة بنجاح" });
  } catch (error) {
    console.error("deleteRoom error:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء حذف القاعة" });
  }
};

/* ══════ GET ROOM SCHEDULE ══════ */
export const getRoomScheduleController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await RoomService.getRoomSchedule(
      req.params.roomId,
      req.query.from as string,
      req.query.to as string,
    );
    if ("error" in result) {
      return res.status(404).json({ message: "القاعة غير موجودة" });
    }
    return res.json(result.data);
  } catch (error) {
    console.error("getRoomSchedule error:", error);
    return res
      .status(500)
      .json({ message: "حدث خطأ أثناء جلب جدول القاعة" });
  }
};

/* ══════ ROOMS SCHEDULE OVERVIEW ══════ */
export const getRoomsScheduleOverviewController = async (
  req: Request,
  res: Response,
) => {
  try {
    const overview = await RoomService.getRoomsScheduleOverview(
      req.query.date as string,
    );
    return res.json(overview);
  } catch (error) {
    console.error("getRoomsOverview error:", error);
    return res
      .status(500)
      .json({ message: "حدث خطأ أثناء جلب ملخص القاعات" });
  }
};

/* ══════ CHECK ROOM AVAILABILITY ══════ */
export const checkRoomAvailabilityController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { date, end_time } = req.query;
    if (!date) {
      return res.status(400).json({ message: "التاريخ مطلوب" });
    }

    const result = await RoomService.checkRoomAvailability(
      req.params.roomId,
      date as string,
      end_time as string,
    );

    if ("error" in result) {
      return res.status(404).json({ message: "القاعة غير موجودة" });
    }

    return res.json(result.data);
  } catch (error) {
    console.error("checkAvailability error:", error);
    return res
      .status(500)
      .json({ message: "حدث خطأ أثناء التحقق من التوفر" });
  }
};