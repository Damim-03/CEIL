import { useState, useMemo } from "react";
import {
  DoorOpen,
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Check,
  MapPin,
  Users,
  Calendar,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  CalendarClock,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  useAdminRooms,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
} from "../../../hooks/admin/useAdmin";

interface Room {
  room_id: string;
  name: string;
  capacity: number;
  location: string | null;
  is_active: boolean;
  created_at: string;
  _count: { sessions: number };
}

const RoomModal = ({
  initial,
  onClose,
}: {
  initial?: Room;
  onClose: () => void;
}) => {
  const isEdit = !!initial;
  const createMut = useCreateRoom();
  const updateMut = useUpdateRoom();
  const [name, setName] = useState(initial?.name || "");
  const [capacity, setCapacity] = useState(String(initial?.capacity ?? 30));
  const [location, setLocation] = useState(initial?.location || "");
  const isPending = createMut.isPending || updateMut.isPending;
  const handleSubmit = async () => {
    if (!name.trim()) return;
    if (isEdit && initial) {
      await updateMut.mutateAsync({
        roomId: initial.room_id,
        payload: {
          name,
          capacity: Number(capacity),
          location: location || undefined,
        },
      });
    } else {
      await createMut.mutateAsync({
        name,
        capacity: Number(capacity),
        location: location || undefined,
      });
    }
    onClose();
  };
  const inputCls =
    "w-full h-11 px-4 bg-[#FAFAF8] dark:bg-[#222222] border border-[#D8CDC0]/50 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] placeholder:text-[#BEB29E] dark:placeholder:text-[#555555] focus:outline-none focus:border-[#2B6F5E]/40 dark:focus:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E]/10 dark:focus:ring-[#4ADE80]/10";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A] shadow-2xl dark:shadow-black/50 w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CDC0]/25 dark:border-[#2A2A2A]">
          <h2 className="text-base font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {isEdit ? "تعديل القاعة" : "إضافة قاعة جديدة"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#D8CDC0]/20 dark:hover:bg-[#222222] flex items-center justify-center"
          >
            <X className="w-4 h-4 text-[#6B5D4F] dark:text-[#888888]" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#6B5D4F] dark:text-[#888888] mb-1.5">
              اسم القاعة *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: القاعة 3"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#6B5D4F] dark:text-[#888888] mb-1.5">
                السعة
              </label>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B5D4F] dark:text-[#888888] mb-1.5">
                الموقع
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="الطابق 2"
                className={inputCls}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#D8CDC0]/25 dark:border-[#2A2A2A] bg-[#FAFAF8]/50 dark:bg-[#0F0F0F]">
          <button
            onClick={onClose}
            className="h-10 px-5 text-sm font-medium text-[#6B5D4F] dark:text-[#AAAAAA] hover:bg-[#D8CDC0]/20 dark:hover:bg-[#222222] rounded-xl transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
            className="h-10 px-6 text-sm font-medium text-white bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 disabled:opacity-40 rounded-xl transition-colors flex items-center gap-2"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isEdit ? "حفظ" : "إنشاء"}
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteModal = ({
  roomId,
  roomName,
  onClose,
}: {
  roomId: string;
  roomName: string;
  onClose: () => void;
}) => {
  const deleteMut = useDeleteRoom();
  const handleDelete = async () => {
    await deleteMut.mutateAsync(roomId);
    onClose();
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A] shadow-2xl dark:shadow-black/50 w-full max-w-sm overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-500 dark:text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
            حذف القاعة
          </h3>
          <p className="text-sm text-[#6B5D4F]/70 dark:text-[#888888]">
            هل تريد حذف{" "}
            <span className="font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {roomName}
            </span>
            ؟
          </p>
          <p className="text-xs text-[#BEB29E] dark:text-[#666666] mt-1">
            إذا كانت مرتبطة بحصص سيتم تعطيلها فقط
          </p>
        </div>
        <div className="flex items-center gap-2 px-5 py-4 border-t border-[#D8CDC0]/25 dark:border-[#2A2A2A] bg-[#FAFAF8]/50 dark:bg-[#0F0F0F]">
          <button
            onClick={onClose}
            className="flex-1 h-10 text-sm font-medium text-[#6B5D4F] dark:text-[#AAAAAA] hover:bg-[#D8CDC0]/20 dark:hover:bg-[#222222] rounded-xl transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMut.isPending}
            className="flex-1 h-10 text-sm font-medium text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 disabled:opacity-40 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {deleteMut.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            حذف
          </button>
        </div>
      </div>
    </div>
  );
};

export default function RoomsPage() {
  const { data, isLoading, isError } = useAdminRooms({
    include_sessions: false,
  });
  const updateMut = useUpdateRoom();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null);
  const [showInactive, setShowInactive] = useState(true);
  const rooms: Room[] = Array.isArray(data) ? data : (data?.rooms ?? []);
  const filtered = useMemo(() => {
    let r = rooms;
    if (!showInactive) r = r.filter((x) => x.is_active);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter(
        (x) =>
          x.name.toLowerCase().includes(q) ||
          x.location?.toLowerCase().includes(q),
      );
    }
    return r;
  }, [rooms, search, showInactive]);
  const stats = useMemo(
    () => ({
      total: rooms.length,
      active: rooms.filter((r) => r.is_active).length,
      inactive: rooms.filter((r) => !r.is_active).length,
      totalCapacity: rooms
        .filter((r) => r.is_active)
        .reduce((s, r) => s + r.capacity, 0),
    }),
    [rooms],
  );
  const toggleActive = (room: Room) => {
    updateMut.mutate({
      roomId: room.room_id,
      payload: { is_active: !room.is_active },
    });
  };

  if (isLoading)
    return (
      <div className="space-y-6 animate-pulse" dir="rtl">
        <div className="h-8 w-40 bg-[#D8CDC0]/30 dark:bg-[#2A2A2A] rounded-lg" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[76px] bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A]"
            />
          ))}
        </div>
        <div className="h-[400px] bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A]" />
      </div>
    );
  if (isError)
    return (
      <div
        dir="rtl"
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
        <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
          حدث خطأ أثناء تحميل القاعات
        </h3>
      </div>
    );

  return (
    <div dir="rtl" className="space-y-6 pb-8">
      {(showCreate || editRoom) && (
        <RoomModal
          initial={editRoom ?? undefined}
          onClose={() => {
            setShowCreate(false);
            setEditRoom(null);
          }}
        />
      )}
      {deleteRoom && (
        <DeleteModal
          roomId={deleteRoom.room_id}
          roomName={deleteRoom.name}
          onClose={() => setDeleteRoom(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
            القاعات
          </h1>
          <p className="text-sm text-[#6B5D4F]/70 dark:text-[#666666] mt-0.5">
            إدارة قاعات التدريس
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/admin/rooms/timetable"
            className="h-10 px-4 text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 hover:bg-[#2B6F5E]/15 dark:hover:bg-[#4ADE80]/15 rounded-xl transition-colors flex items-center gap-2"
          >
            <CalendarClock className="w-4 h-4" />
            الجدول الزمني
          </Link>
          <button
            onClick={() => setShowCreate(true)}
            className="h-10 px-5 text-sm font-medium text-white bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 rounded-xl transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            قاعة جديدة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "إجمالي القاعات",
            value: stats.total,
            icon: DoorOpen,
            color: "teal" as const,
          },
          {
            label: "نشطة",
            value: stats.active,
            icon: Check,
            color: "green" as const,
          },
          {
            label: "معطّلة",
            value: stats.inactive,
            icon: ToggleLeft,
            color: "gold" as const,
          },
          {
            label: "السعة الإجمالية",
            value: stats.totalCapacity,
            icon: Users,
            color: "beige" as const,
          },
        ].map((s) => {
          const c = {
            teal: {
              bg: "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10",
              icon: "text-[#2B6F5E] dark:text-[#4ADE80]",
              val: "text-[#2B6F5E] dark:text-[#4ADE80]",
            },
            green: {
              bg: "bg-[#8DB896]/12 dark:bg-[#8DB896]/10",
              icon: "text-[#3D7A4A] dark:text-[#8DB896]",
              val: "text-[#3D7A4A] dark:text-[#8DB896]",
            },
            gold: {
              bg: "bg-[#C4A035]/8 dark:bg-[#D4A843]/10",
              icon: "text-[#C4A035] dark:text-[#D4A843]",
              val: "text-[#C4A035] dark:text-[#D4A843]",
            },
            beige: {
              bg: "bg-[#D8CDC0]/20 dark:bg-[#555555]/20",
              icon: "text-[#6B5D4F] dark:text-[#AAAAAA]",
              val: "text-[#6B5D4F] dark:text-[#AAAAAA]",
            },
          }[s.color];
          return (
            <div
              key={s.label}
              className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A] px-4 py-3 flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}
              >
                <s.icon className={`w-[18px] h-[18px] ${c.icon}`} />
              </div>
              <div>
                <p className={`text-xl font-bold leading-tight ${c.val}`}>
                  {s.value}
                </p>
                <p className="text-[11px] text-[#6B5D4F]/60 dark:text-[#666666]">
                  {s.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#666666] pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو الموقع..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pr-10 pl-4 bg-white dark:bg-[#222222] border border-[#D8CDC0]/50 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] placeholder:text-[#BEB29E] dark:placeholder:text-[#555555] focus:outline-none focus:border-[#2B6F5E]/40 dark:focus:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E]/10 dark:focus:ring-[#4ADE80]/10 transition-all"
          />
        </div>
        <button
          onClick={() => setShowInactive(!showInactive)}
          className={`h-11 px-4 text-xs font-medium rounded-xl border transition-colors flex items-center gap-2 shrink-0 ${showInactive ? "text-[#6B5D4F] dark:text-[#AAAAAA] bg-white dark:bg-[#1A1A1A] border-[#D8CDC0]/50 dark:border-[#2A2A2A] hover:bg-[#FAFAF8] dark:hover:bg-[#222222]" : "text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 border-[#2B6F5E]/20 dark:border-[#4ADE80]/15"}`}
        >
          {showInactive ? (
            <ToggleRight className="w-4 h-4" />
          ) : (
            <ToggleLeft className="w-4 h-4" />
          )}
          {showInactive ? "إخفاء المعطّلة" : "إظهار المعطّلة"}
        </button>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A] overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_100px_140px_100px_80px_100px] gap-3 px-5 py-3 bg-[#FAFAF8]/70 dark:bg-[#0F0F0F] border-b border-[#D8CDC0]/15 dark:border-[#2A2A2A] text-[10px] font-medium text-[#6B5D4F]/50 dark:text-[#666666] uppercase tracking-wider">
          <span>القاعة</span>
          <span className="text-center">السعة</span>
          <span>الموقع</span>
          <span className="text-center">الحصص</span>
          <span className="text-center">الحالة</span>
          <span className="text-center">إجراءات</span>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <DoorOpen className="w-10 h-10 text-[#BEB29E] dark:text-[#555555] mb-3" />
            <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {rooms.length === 0 ? "لا توجد قاعات" : "لا توجد نتائج"}
            </h3>
            {rooms.length === 0 && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-3 text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:underline"
              >
                إضافة أول قاعة
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#D8CDC0]/8 dark:divide-[#2A2A2A]">
            {filtered.map((room) => (
              <div
                key={room.room_id}
                className={`grid grid-cols-1 sm:grid-cols-[1fr_100px_140px_100px_80px_100px] gap-3 items-center px-5 py-3.5 hover:bg-[#FAFAF8] dark:hover:bg-[#222222] transition-colors ${!room.is_active ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${room.is_active ? "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10" : "bg-[#D8CDC0]/15 dark:bg-[#2A2A2A]"}`}
                  >
                    <DoorOpen
                      className={`w-5 h-5 ${room.is_active ? "text-[#2B6F5E] dark:text-[#4ADE80]" : "text-[#BEB29E] dark:text-[#666666]"}`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                      {room.name}
                    </p>
                    <p className="text-[10px] text-[#BEB29E] dark:text-[#666666]">
                      أُنشئت{" "}
                      {new Date(room.created_at).toLocaleDateString("ar-DZ", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                    <Users className="w-3.5 h-3.5 text-[#BEB29E] dark:text-[#666666]" />
                    {room.capacity}
                  </span>
                </div>
                <div>
                  {room.location ? (
                    <span className="inline-flex items-center gap-1 text-xs text-[#6B5D4F]/70 dark:text-[#888888]">
                      <MapPin className="w-3 h-3 text-[#BEB29E] dark:text-[#666666]" />
                      {room.location}
                    </span>
                  ) : (
                    <span className="text-xs text-[#BEB29E] dark:text-[#666666]">
                      —
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#6B5D4F] dark:text-[#AAAAAA]">
                    <Calendar className="w-3 h-3 text-[#BEB29E] dark:text-[#666666]" />
                    {room._count.sessions}
                  </span>
                </div>
                <div className="text-center">
                  <button
                    onClick={() => toggleActive(room)}
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${room.is_active ? "text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 hover:bg-[#2B6F5E]/20 dark:hover:bg-[#4ADE80]/15" : "text-[#C4A035] dark:text-[#D4A843] bg-[#C4A035]/10 dark:bg-[#D4A843]/10 hover:bg-[#C4A035]/20 dark:hover:bg-[#D4A843]/15"}`}
                    title={room.is_active ? "اضغط للتعطيل" : "اضغط للتفعيل"}
                  >
                    {room.is_active ? "نشطة" : "معطّلة"}
                  </button>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => setEditRoom(room)}
                    className="w-8 h-8 rounded-lg hover:bg-[#2B6F5E]/8 dark:hover:bg-[#4ADE80]/10 flex items-center justify-center transition-colors"
                    title="تعديل"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#2B6F5E] dark:text-[#4ADE80]" />
                  </button>
                  <button
                    onClick={() => setDeleteRoom(room)}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-[#D8CDC0]/15 dark:border-[#2A2A2A] bg-[#FAFAF8]/50 dark:bg-[#0F0F0F] text-[11px] text-[#BEB29E] dark:text-[#666666]">
            {filtered.length} قاعة
          </div>
        )}
      </div>
    </div>
  );
}
