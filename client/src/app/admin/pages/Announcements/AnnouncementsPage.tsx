import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  ImageIcon,
  Globe,
  GlobeLock,
  Calendar,
  FileText,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  useAdminAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  usePublishAnnouncement,
  useUnpublishAnnouncement,
} from "../../../../hooks/admin/useAdmin";
import type {
  Announcement,
  CreateAnnouncementData,
  UpdateAnnouncementData,
} from "../../../../lib/api/admin/admin.api";

// ─── Category Config ───
const CATEGORY_VALUES = [
  "NEWS",
  "FORMATIONS",
  "EXAMS",
  "REGISTRATION",
  "EVENTS",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  NEWS: "bg-[#2B6F5E]/8 text-[#2B6F5E] border-[#2B6F5E]/20",
  FORMATIONS: "bg-[#8DB896]/12 text-[#3D7A4A] border-[#8DB896]/30",
  EXAMS: "bg-[#C4A035]/8 text-[#C4A035] border-[#C4A035]/20",
  REGISTRATION: "bg-[#D8CDC0]/20 text-[#6B5D4F] border-[#D8CDC0]/40",
  EVENTS: "bg-[#C4A035]/12 text-[#8B6914] border-[#C4A035]/25",
};

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  NEWS: "admin.announcements.catNews",
  FORMATIONS: "admin.announcements.catFormations",
  EXAMS: "admin.announcements.catExams",
  REGISTRATION: "admin.announcements.catRegistration",
  EVENTS: "admin.announcements.catEvents",
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ─── Dialog ───
function Dialog({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl mx-4 border border-[#D8CDC0]/60">
        {children}
      </div>
    </div>
  );
}

// ─── Create/Edit Form ───
function AnnouncementForm({
  announcement,
  onClose,
}: {
  announcement?: Announcement | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isEdit = !!announcement;

  const [title, setTitle] = useState(announcement?.title || "");
  const [titleAr, setTitleAr] = useState(announcement?.title_ar || "");
  const [content, setContent] = useState(announcement?.content || "");
  const [contentAr, setContentAr] = useState(announcement?.content_ar || "");
  const [excerpt, setExcerpt] = useState(announcement?.excerpt || "");
  const [excerptAr, setExcerptAr] = useState(announcement?.excerpt_ar || "");
  const [category, setCategory] = useState(announcement?.category || "");
  const [isPublished, setIsPublished] = useState(
    announcement?.is_published || false,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    announcement?.image_url || null,
  );

  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    if (isEdit && announcement) {
      const data: UpdateAnnouncementData = {
        title,
        title_ar: titleAr || undefined,
        content,
        content_ar: contentAr || undefined,
        excerpt: excerpt || undefined,
        excerpt_ar: excerptAr || undefined,
        category: category || undefined,
      };
      if (imageFile) data.image = imageFile;
      updateMutation.mutate(
        { id: announcement.announcement_id, data },
        { onSuccess: () => onClose() },
      );
    } else {
      const data: CreateAnnouncementData = {
        title,
        title_ar: titleAr || undefined,
        content,
        content_ar: contentAr || undefined,
        excerpt: excerpt || undefined,
        excerpt_ar: excerptAr || undefined,
        category: category || undefined,
        is_published: isPublished,
      };
      if (imageFile) data.image = imageFile;
      createMutation.mutate(data, { onSuccess: () => onClose() });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between p-6 border-b border-[#D8CDC0]/30">
        <h2 className="text-lg font-bold text-[#1B1B1B] flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-[#2B6F5E]" />
          {isEdit
            ? t("admin.announcements.editAnnouncement")
            : t("admin.announcements.createAnnouncement")}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-[#D8CDC0]/15 transition-colors"
        >
          <X className="w-5 h-5 text-[#BEB29E]" />
        </button>
      </div>

      <div className="p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#1B1B1B] mb-2">
            {t("admin.announcements.image")}
          </label>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden h-48 bg-[#D8CDC0]/10">
              <img
                src={imagePreview}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-[#D8CDC0]/60 hover:border-[#2B6F5E]/40 cursor-pointer transition-colors bg-[#D8CDC0]/5">
              <Upload className="w-8 h-8 text-[#BEB29E] mb-2" />
              <span className="text-sm text-[#BEB29E]">
                {t("admin.announcements.uploadImage")}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">
              {t("admin.announcements.titleFr")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("admin.announcements.titleFrPlaceholder")}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-2 focus:ring-[#2B6F5E]/20 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">
              {t("admin.announcements.titleAr")}
            </label>
            <input
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              placeholder={t("admin.announcements.titleArPlaceholder")}
              dir="rtl"
              className="w-full px-4 py-2.5 rounded-xl border border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-2 focus:ring-[#2B6F5E]/20 outline-none text-sm transition-all"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">
              {t("admin.announcements.excerptFr")}
            </label>
            <input
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder={t("admin.announcements.excerptFrPlaceholder")}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-2 focus:ring-[#2B6F5E]/20 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">
              {t("admin.announcements.excerptAr")}
            </label>
            <input
              value={excerptAr}
              onChange={(e) => setExcerptAr(e.target.value)}
              placeholder={t("admin.announcements.excerptArPlaceholder")}
              dir="rtl"
              className="w-full px-4 py-2.5 rounded-xl border border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-2 focus:ring-[#2B6F5E]/20 outline-none text-sm transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">
            {t("admin.announcements.contentFr")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("admin.announcements.contentFrPlaceholder")}
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-2 focus:ring-[#2B6F5E]/20 outline-none text-sm resize-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">
            {t("admin.announcements.contentAr")}
          </label>
          <textarea
            value={contentAr}
            onChange={(e) => setContentAr(e.target.value)}
            placeholder={t("admin.announcements.contentArPlaceholder")}
            rows={4}
            dir="rtl"
            className="w-full px-4 py-2.5 rounded-xl border border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-2 focus:ring-[#2B6F5E]/20 outline-none text-sm resize-none transition-all"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">
              {t("admin.announcements.category")}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-2 focus:ring-[#2B6F5E]/20 outline-none text-sm bg-white transition-all"
            >
              <option value="">{t("admin.announcements.noCategory")}</option>
              {CATEGORY_VALUES.map((val) => (
                <option key={val} value={val}>
                  {t(CATEGORY_LABEL_KEYS[val])}
                </option>
              ))}
            </select>
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">
                {t("admin.announcements.status")}
              </label>
              <div className="flex items-center gap-3 h-[42px]">
                <button
                  onClick={() => setIsPublished(!isPublished)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isPublished ? "bg-[#2B6F5E]" : "bg-[#D8CDC0]/60"}`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isPublished ? "left-[26px]" : "left-0.5"}`}
                  />
                </button>
                <span className="text-sm text-[#6B5D4F]">
                  {isPublished
                    ? t("admin.announcements.publishImmediately")
                    : t("admin.announcements.saveAsDraft")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 p-6 border-t border-[#D8CDC0]/30 bg-[#D8CDC0]/8 rounded-b-2xl">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-[#D8CDC0]/60 text-[#6B5D4F]"
        >
          {t("admin.announcements.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim() || isLoading}
          className="bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white border-0 gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isEdit ? (
            <Edit className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {isLoading
            ? t("admin.announcements.saving")
            : isEdit
              ? t("admin.announcements.saveChanges")
              : t("admin.announcements.create")}
        </Button>
      </div>
    </div>
  );
}

// ─── Delete Confirmation ───
function DeleteConfirm({
  announcement,
  onClose,
}: {
  announcement: Announcement;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteAnnouncement();
  const handleDelete = () => {
    deleteMutation.mutate(announcement.announcement_id, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <div className="p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-7 h-7 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-[#1B1B1B] mb-2">
        {t("admin.announcements.deleteAnnouncement")}
      </h3>
      <p className="text-sm text-[#6B5D4F] mb-1">
        {t("admin.announcements.deleteConfirm")}
      </p>
      <p className="text-sm font-medium text-[#1B1B1B] mb-6 line-clamp-1">
        "{announcement.title}"
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-[#D8CDC0]/60 text-[#6B5D4F]"
        >
          {t("admin.announcements.cancel")}
        </Button>
        <Button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="bg-red-500 hover:bg-red-600 text-white border-0"
        >
          {deleteMutation.isPending
            ? t("admin.announcements.deleting")
            : t("admin.announcements.yesDelete")}
        </Button>
      </div>
    </div>
  );
}

// ─── Announcement Row ───
function AnnouncementRow({
  announcement,
  onEdit,
  onDelete,
}: {
  announcement: Announcement;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const publishMutation = usePublishAnnouncement();
  const unpublishMutation = useUnpublishAnnouncement();

  const togglePublish = () => {
    if (announcement.is_published)
      unpublishMutation.mutate(announcement.announcement_id);
    else publishMutation.mutate(announcement.announcement_id);
  };

  const catClass =
    CATEGORY_COLORS[announcement.category || ""] ||
    "bg-[#D8CDC0]/15 text-[#6B5D4F] border-[#D8CDC0]/30";

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl border border-[#D8CDC0]/40 hover:border-[#2B6F5E]/20 hover:bg-[#D8CDC0]/8 transition-all">
      <div className="w-20 h-16 rounded-xl overflow-hidden bg-[#D8CDC0]/15 shrink-0">
        {announcement.image_url ? (
          <img
            src={announcement.image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-[#D8CDC0]" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${announcement.is_published ? "bg-[#8DB896]" : "bg-[#D8CDC0]"}`}
          />
          <h3 className="text-sm font-semibold text-[#1B1B1B] truncate">
            {announcement.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {announcement.category && (
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${catClass}`}
            >
              {t(CATEGORY_LABEL_KEYS[announcement.category] || "")}
            </span>
          )}
          <span className="text-xs text-[#BEB29E] flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(announcement.created_at)}
          </span>
          {announcement.is_published ? (
            <span className="text-xs text-[#2B6F5E] flex items-center gap-1">
              <Globe className="w-3 h-3" /> {t("admin.announcements.published")}
            </span>
          ) : (
            <span className="text-xs text-[#BEB29E] flex items-center gap-1">
              <GlobeLock className="w-3 h-3" /> {t("admin.announcements.draft")}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={togglePublish}
          disabled={publishMutation.isPending || unpublishMutation.isPending}
          className={`p-2 rounded-lg transition-colors ${announcement.is_published ? "hover:bg-[#C4A035]/10 text-[#C4A035]" : "hover:bg-[#8DB896]/15 text-[#2B6F5E]"}`}
          title={
            announcement.is_published
              ? t("admin.announcements.unpublish")
              : t("admin.announcements.publish")
          }
        >
          {announcement.is_published ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-[#C4A035]/10 text-[#C4A035] transition-colors"
          title={t("admin.announcements.edit")}
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
          title={t("admin.announcements.delete")}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───
const Announcements = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [publishFilter, setPublishFilter] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  const { data, isLoading } = useAdminAnnouncements({
    page,
    limit: 10,
    category: categoryFilter || undefined,
    is_published:
      publishFilter === "true"
        ? true
        : publishFilter === "false"
          ? false
          : undefined,
    search: search || undefined,
  });

  const announcements = data?.data || [];
  const pagination = data?.pagination;
  const totalCount = pagination?.total || 0;

  const openCreate = () => {
    setEditAnnouncement(null);
    setShowForm(true);
  };
  const openEdit = (a: Announcement) => {
    setEditAnnouncement(a);
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditAnnouncement(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-lg shadow-[#C4A035]/20">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B1B1B]">
                {t("admin.announcements.title")}
              </h1>
              <p className="text-sm text-[#BEB29E] mt-0.5">
                {t("admin.announcements.subtitle")}
              </p>
            </div>
          </div>
          <Button
            onClick={openCreate}
            className="bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white border-0 gap-2 shadow-md shadow-[#2B6F5E]/20 self-start"
          >
            <Plus className="w-4 h-4" />{" "}
            {t("admin.announcements.newAnnouncement")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            labelKey: "admin.announcements.total",
            value: totalCount,
            icon: FileText,
            color: "teal" as const,
          },
          {
            labelKey: "admin.announcements.published",
            value: announcements.filter((a) => a.is_published).length,
            icon: Globe,
            color: "green" as const,
          },
          {
            labelKey: "admin.announcements.draft",
            value: announcements.filter((a) => !a.is_published).length,
            icon: GlobeLock,
            color: "beige" as const,
          },
          {
            labelKey: "admin.announcements.withImages",
            value: announcements.filter((a) => a.image_url).length,
            icon: ImageIcon,
            color: "mustard" as const,
          },
        ].map((stat) => {
          const colors = {
            teal: {
              bar: "from-[#2B6F5E] to-[#2B6F5E]/70",
              bg: "bg-[#2B6F5E]/8",
              icon: "text-[#2B6F5E]",
            },
            green: {
              bar: "from-[#8DB896] to-[#8DB896]/70",
              bg: "bg-[#8DB896]/12",
              icon: "text-[#3D7A4A]",
            },
            beige: {
              bar: "from-[#BEB29E] to-[#BEB29E]/70",
              bg: "bg-[#D8CDC0]/20",
              icon: "text-[#6B5D4F]",
            },
            mustard: {
              bar: "from-[#C4A035] to-[#C4A035]/70",
              bg: "bg-[#C4A035]/8",
              icon: "text-[#C4A035]",
            },
          };
          const c = colors[stat.color];
          return (
            <div
              key={stat.labelKey}
              className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-5 overflow-hidden group hover:shadow-md transition-all"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${c.bar} opacity-60 group-hover:opacity-100 transition-opacity`}
              ></div>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}
                >
                  <stat.icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1B1B1B]">
                    {stat.value}
                  </p>
                  <p className="text-xs text-[#6B5D4F]">{t(stat.labelKey)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t("admin.announcements.search")}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-2 focus:ring-[#2B6F5E]/20 outline-none text-sm transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 rounded-xl border border-[#D8CDC0]/60 focus:border-[#2B6F5E] outline-none text-sm bg-white min-w-[140px]"
          >
            <option value="">{t("admin.announcements.all")}</option>
            {CATEGORY_VALUES.map((val) => (
              <option key={val} value={val}>
                {t(CATEGORY_LABEL_KEYS[val])}
              </option>
            ))}
          </select>
          <select
            value={publishFilter}
            onChange={(e) => {
              setPublishFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 rounded-xl border border-[#D8CDC0]/60 focus:border-[#2B6F5E] outline-none text-sm bg-white min-w-[120px]"
          >
            <option value="">{t("admin.announcements.allStatus")}</option>
            <option value="true">{t("admin.announcements.published")}</option>
            <option value="false">{t("admin.announcements.draft")}</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-[#2B6F5E]/20 border-t-[#2B6F5E] rounded-full animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#D8CDC0]/20 flex items-center justify-center mb-4">
              <Megaphone className="w-8 h-8 text-[#BEB29E]" />
            </div>
            <h3 className="text-base font-semibold text-[#1B1B1B] mb-1">
              {t("admin.announcements.noAnnouncements")}
            </h3>
            <p className="text-sm text-[#BEB29E] mb-4">
              {t("admin.announcements.noAnnouncementsDesc")}
            </p>
            <Button
              onClick={openCreate}
              className="bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white border-0 gap-2"
            >
              <Plus className="w-4 h-4" />{" "}
              {t("admin.announcements.newAnnouncement")}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {announcements.map((a) => (
              <AnnouncementRow
                key={a.announcement_id}
                announcement={a}
                onEdit={() => openEdit(a)}
                onDelete={() => setDeleteTarget(a)}
              />
            ))}
          </div>
        )}

        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#D8CDC0]/30">
            <p className="text-xs text-[#BEB29E]">
              {t("admin.announcements.page", {
                current: pagination.page,
                total: pagination.total_pages,
                count: pagination.total,
              })}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-[#D8CDC0]/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-[#6B5D4F]" />
              </button>
              {Array.from(
                { length: Math.min(pagination.total_pages, 5) },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? "bg-[#2B6F5E] text-white" : "hover:bg-[#D8CDC0]/15 text-[#6B5D4F]"}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.total_pages, p + 1))
                }
                disabled={page === pagination.total_pages}
                className="p-2 rounded-lg hover:bg-[#D8CDC0]/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-[#6B5D4F]" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showForm} onClose={closeForm}>
        <AnnouncementForm announcement={editAnnouncement} onClose={closeForm} />
      </Dialog>
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        {deleteTarget && (
          <DeleteConfirm
            announcement={deleteTarget}
            onClose={() => setDeleteTarget(null)}
          />
        )}
      </Dialog>
    </div>
  );
};

export default Announcements;
