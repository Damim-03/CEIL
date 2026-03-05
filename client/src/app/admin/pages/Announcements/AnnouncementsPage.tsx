// ================================================================
// 📌 src/app/admin/pages/announcements/Announcements.tsx
// ✅ Full Dark / Light mode
// ✅ 📌 Pin/Unpin — pinned announcements appear first with visual indicator
// ✅ 📎 Attachment support (PDF, Word, PPT, images — max 20MB)
// ✅ Matches Layout: bg-[#FAFAF8] light / bg-[#0F0F0F] dark
// ✅ i18n via useTranslation
// ================================================================

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
  Pin,
  PinOff,
  Paperclip,
  FileDown,
  File,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  useAdminAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  usePublishAnnouncement,
  useUnpublishAnnouncement,
  usePinAnnouncement,
  useUnpinAnnouncement,
} from "../../../../hooks/admin/useAdmin";
import type {
  Announcement,
  CreateAnnouncementData,
  UpdateAnnouncementData,
} from "../../../../lib/api/admin/admin.api";

/* ───────────────────────────────────────────────────────── */
const S_CARD =
  "bg-white dark:bg-[#1A1A1A] border border-[#E8E5DE] dark:border-[#2A2A2A]";
const S_BORDER = "border-[#E8E5DE] dark:border-[#2A2A2A]";
const S_HOVER_ROW = "hover:bg-[#FAFAF8] dark:hover:bg-[#161616]";
const S_INPUT =
  "bg-white dark:bg-[#161616] border-[#E8E5DE] dark:border-[#2A2A2A] text-[#1B1B1B] dark:text-[#F0F0F0] placeholder:text-[#BEB29E] dark:placeholder:text-[#555]";
const T1 = "text-[#1B1B1B] dark:text-[#F0F0F0]";
const T2 = "text-[#6B5D4F] dark:text-[#A0A0A0]";
const T3 = "text-[#BEB29E] dark:text-[#666666]";
const T4 = "text-[#D8CDC0] dark:text-[#444444]";
const BRAND_GREEN = "text-[#2B6F5E] dark:text-[#5EAA8D]";
const BRAND_MUSTARD = "text-[#C4A035] dark:text-[#D4B040]";
const BORDER_B = "border-b border-[#F0EDE6] dark:border-[#222222]";

// ─── Category Config ───
const CATEGORY_VALUES = [
  "NEWS",
  "FORMATIONS",
  "EXAMS",
  "REGISTRATION",
  "EVENTS",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  NEWS: "bg-[#2B6F5E]/8 dark:bg-[#2B6F5E]/15 text-[#2B6F5E] dark:text-[#5EAA8D] border-[#2B6F5E]/20",
  FORMATIONS:
    "bg-[#8DB896]/12 dark:bg-[#8DB896]/15 text-[#3D7A4A] dark:text-[#8DB896] border-[#8DB896]/30",
  EXAMS:
    "bg-[#C4A035]/8 dark:bg-[#C4A035]/15 text-[#C4A035] dark:text-[#D4B040] border-[#C4A035]/20",
  REGISTRATION:
    "bg-[#D8CDC0]/20 dark:bg-[#D8CDC0]/10 text-[#6B5D4F] dark:text-[#A09080] border-[#D8CDC0]/40 dark:border-[#D8CDC0]/20",
  EVENTS:
    "bg-[#C4A035]/12 dark:bg-[#C4A035]/15 text-[#8B6914] dark:text-[#D4B040] border-[#C4A035]/25",
};

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  NEWS: "admin.announcements.catNews",
  FORMATIONS: "admin.announcements.catFormations",
  EXAMS: "admin.announcements.catExams",
  REGISTRATION: "admin.announcements.catRegistration",
  EVENTS: "admin.announcements.catEvents",
};

// ─── Attachment helpers ───────────────────────────────────
const ATTACHMENT_ACCEPT = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
].join(",");

function getAttachmentIcon(type: string | null | undefined) {
  if (!type) return <File className="w-4 h-4" />;
  if (type === "pdf") return <FileText className="w-4 h-4 text-red-500" />;
  if (type === "docx" || type === "doc")
    return <FileText className="w-4 h-4 text-blue-500" />;
  if (type === "pptx" || type === "ppt")
    return <FileText className="w-4 h-4 text-orange-500" />;
  if (type === "image") return <ImageIcon className="w-4 h-4 text-[#2B6F5E]" />;
  return <File className="w-4 h-4" />;
}

function getAttachmentLabel(type: string | null | undefined) {
  const labels: Record<string, string> = {
    pdf: "PDF",
    doc: "Word",
    docx: "Word",
    ppt: "PowerPoint",
    pptx: "PowerPoint",
    image: "Image",
  };
  return labels[type ?? ""] ?? (type ?? "File").toUpperCase();
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// ─── Attachment Upload Zone ───────────────────────────────
function AttachmentZone({
  file,
  existingUrl,
  existingName,
  existingType,
  onFileChange,
  onRemoveExisting,
  onRemoveNew,
}: {
  file: File | null;
  existingUrl: string | null | undefined;
  existingName: string | null | undefined;
  existingType: string | null | undefined;
  onFileChange: (f: File) => void;
  onRemoveExisting: () => void;
  onRemoveNew: () => void;
}) {
  const { t } = useTranslation();

  if (file) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-[#2B6F5E]/30 bg-[#2B6F5E]/5 dark:bg-[#2B6F5E]/10">
        <div className="w-9 h-9 rounded-lg bg-[#2B6F5E]/10 dark:bg-[#2B6F5E]/20 flex items-center justify-center shrink-0">
          <Paperclip className="w-4 h-4 text-[#2B6F5E] dark:text-[#5EAA8D]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${T1} truncate`}>{file.name}</p>
          <p className={`text-xs ${T3}`}>
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        <button
          onClick={onRemoveNew}
          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (existingUrl) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E8E5DE] dark:border-[#2A2A2A] bg-[#F3F1EC]/50 dark:bg-[#161616]">
        <div className="w-9 h-9 rounded-lg bg-[#E8E5DE] dark:bg-[#2A2A2A] flex items-center justify-center shrink-0">
          {getAttachmentIcon(existingType)}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${T1} truncate`}>
            {existingName || t("admin.announcements.attachment")}
          </p>
          <p className={`text-xs ${T3}`}>{getAttachmentLabel(existingType)}</p>
        </div>
        <a
          href={existingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-1.5 rounded-lg hover:bg-[#2B6F5E]/10 ${BRAND_GREEN} transition-colors`}
          title="Download"
        >
          <FileDown className="w-4 h-4" />
        </a>
        <button
          onClick={onRemoveExisting}
          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-[#E8E5DE] dark:border-[#2A2A2A] hover:border-[#2B6F5E]/40 cursor-pointer transition-colors bg-[#F3F1EC]/30 dark:bg-[#161616]">
      <div className="w-9 h-9 rounded-lg bg-[#E8E5DE] dark:bg-[#2A2A2A] flex items-center justify-center shrink-0">
        <Paperclip className={`w-4 h-4 ${T3}`} />
      </div>
      <div>
        <p className={`text-sm font-medium ${T2}`}>
          {t("admin.announcements.uploadAttachment")}
        </p>
        <p className={`text-xs ${T3}`}>
          PDF, Word, PowerPoint, images — max 20MB
        </p>
      </div>
      <input
        type="file"
        accept={ATTACHMENT_ACCEPT}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileChange(f);
        }}
        className="hidden"
      />
    </label>
  );
}

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
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl mx-4 ${S_CARD}`}
      >
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
  // ─── Attachment state ────────────────────────────────────
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const showExistingAttachment =
    !removeAttachment && !attachmentFile && !!announcement?.attachment_url;

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
      if (attachmentFile) data.attachment = attachmentFile;
      if (removeAttachment) data.remove_attachment = true;
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
      if (attachmentFile) data.attachment = attachmentFile;
      createMutation.mutate(data, { onSuccess: () => onClose() });
    }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl border ${S_INPUT} focus:border-[#2B6F5E] focus:ring-2 focus:ring-[#2B6F5E]/20 outline-none text-sm transition-all`;

  return (
    <div>
      <div className={`flex items-center justify-between p-6 ${BORDER_B}`}>
        <h2 className={`text-lg font-bold ${T1} flex items-center gap-2`}>
          <Megaphone className={`w-5 h-5 ${BRAND_GREEN}`} />
          {isEdit
            ? t("admin.announcements.editAnnouncement")
            : t("admin.announcements.createAnnouncement")}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-[#E8E5DE]/40 dark:hover:bg-[#2A2A2A] transition-colors"
        >
          <X className={`w-5 h-5 ${T3}`} />
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Cover Image */}
        <div>
          <label className={`block text-sm font-medium ${T1} mb-2`}>
            {t("admin.announcements.image")}
          </label>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden h-48 bg-[#F3F1EC] dark:bg-[#222222]">
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
            <label className="flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-[#E8E5DE] dark:border-[#2A2A2A] hover:border-[#2B6F5E]/40 cursor-pointer transition-colors bg-[#F3F1EC]/50 dark:bg-[#161616]">
              <Upload className={`w-8 h-8 ${T3} mb-2`} />
              <span className={`text-sm ${T3}`}>
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

        {/* 📎 Attachment */}
        <div>
          <label
            className={`flex items-center gap-1.5 text-sm font-medium ${T1} mb-2`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            {t("admin.announcements.attachment")}
            <span className={`text-xs font-normal ${T3}`}>
              ({t("admin.announcements.optional")})
            </span>
          </label>
          <AttachmentZone
            file={attachmentFile}
            existingUrl={
              showExistingAttachment ? announcement?.attachment_url : null
            }
            existingName={
              showExistingAttachment ? announcement?.attachment_name : null
            }
            existingType={
              showExistingAttachment ? announcement?.attachment_type : null
            }
            onFileChange={(f) => {
              setAttachmentFile(f);
              setRemoveAttachment(false);
            }}
            onRemoveExisting={() => setRemoveAttachment(true)}
            onRemoveNew={() => setAttachmentFile(null)}
          />
        </div>

        {/* Title */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={`block text-sm font-medium ${T1} mb-1.5`}>
              {t("admin.announcements.titleFr")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("admin.announcements.titleFrPlaceholder")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${T1} mb-1.5`}>
              {t("admin.announcements.titleAr")}
            </label>
            <input
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              placeholder={t("admin.announcements.titleArPlaceholder")}
              dir="rtl"
              className={inputClass}
            />
          </div>
        </div>

        {/* Excerpt */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={`block text-sm font-medium ${T1} mb-1.5`}>
              {t("admin.announcements.excerptFr")}
            </label>
            <input
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder={t("admin.announcements.excerptFrPlaceholder")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${T1} mb-1.5`}>
              {t("admin.announcements.excerptAr")}
            </label>
            <input
              value={excerptAr}
              onChange={(e) => setExcerptAr(e.target.value)}
              placeholder={t("admin.announcements.excerptArPlaceholder")}
              dir="rtl"
              className={inputClass}
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <label className={`block text-sm font-medium ${T1} mb-1.5`}>
            {t("admin.announcements.contentFr")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("admin.announcements.contentFrPlaceholder")}
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${T1} mb-1.5`}>
            {t("admin.announcements.contentAr")}
          </label>
          <textarea
            value={contentAr}
            onChange={(e) => setContentAr(e.target.value)}
            placeholder={t("admin.announcements.contentArPlaceholder")}
            rows={4}
            dir="rtl"
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Category & Status */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={`block text-sm font-medium ${T1} mb-1.5`}>
              {t("admin.announcements.category")}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${inputClass} cursor-pointer`}
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
              <label className={`block text-sm font-medium ${T1} mb-1.5`}>
                {t("admin.announcements.status")}
              </label>
              <div className="flex items-center gap-3 h-[42px]">
                <button
                  onClick={() => setIsPublished(!isPublished)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isPublished ? "bg-[#2B6F5E]" : "bg-[#E8E5DE] dark:bg-[#333]"}`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white dark:bg-[#F0F0F0] shadow transition-transform ${isPublished ? "left-[26px]" : "left-0.5"}`}
                  />
                </button>
                <span className={`text-sm ${T2}`}>
                  {isPublished
                    ? t("admin.announcements.publishImmediately")
                    : t("admin.announcements.saveAsDraft")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={`flex items-center justify-end gap-3 p-6 border-t ${S_BORDER} bg-[#F3F1EC]/50 dark:bg-[#161616] rounded-b-2xl`}
      >
        <Button
          variant="outline"
          onClick={onClose}
          className={`border-[#E8E5DE] dark:border-[#2A2A2A] ${T2} hover:bg-[#F3F1EC] dark:hover:bg-[#222]`}
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
      <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-7 h-7 text-red-500 dark:text-red-400" />
      </div>
      <h3 className={`text-lg font-bold ${T1} mb-2`}>
        {t("admin.announcements.deleteAnnouncement")}
      </h3>
      <p className={`text-sm ${T2} mb-1`}>
        {t("admin.announcements.deleteConfirm")}
      </p>
      <p className={`text-sm font-medium ${T1} mb-6 line-clamp-1`}>
        "{announcement.title}"
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          className={`border-[#E8E5DE] dark:border-[#2A2A2A] ${T2} hover:bg-[#F3F1EC] dark:hover:bg-[#222]`}
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
  const pinMutation = usePinAnnouncement();
  const unpinMutation = useUnpinAnnouncement();

  const togglePublish = () => {
    if (announcement.is_published)
      unpublishMutation.mutate(announcement.announcement_id);
    else publishMutation.mutate(announcement.announcement_id);
  };

  const togglePin = () => {
    if (announcement.is_pinned)
      unpinMutation.mutate(announcement.announcement_id);
    else pinMutation.mutate(announcement.announcement_id);
  };

  const isPinned = announcement.is_pinned;
  const catClass =
    CATEGORY_COLORS[announcement.category || ""] ||
    "bg-[#F3F1EC] dark:bg-[#222] text-[#6B5D4F] dark:text-[#999] border-[#E8E5DE] dark:border-[#2A2A2A]";

  return (
    <div
      className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all ${
        isPinned
          ? "border-amber-400/40 dark:border-amber-500/25 bg-amber-50/50 dark:bg-amber-500/[0.04]"
          : `${S_BORDER} ${S_HOVER_ROW} hover:border-[#2B6F5E]/20 dark:hover:border-[#5EAA8D]/20`
      }`}
    >
      {isPinned && (
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-gradient-to-b from-amber-400 to-amber-500" />
      )}

      {/* Thumbnail */}
      <div className="w-20 h-16 rounded-xl overflow-hidden bg-[#F3F1EC] dark:bg-[#222222] shrink-0">
        {announcement.image_url ? (
          <img
            src={announcement.image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className={`w-6 h-6 ${T4}`} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${announcement.is_published ? "bg-[#8DB896]" : "bg-[#D8CDC0] dark:bg-[#444]"}`}
          />
          {isPinned && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Pin className="w-2.5 h-2.5" />
              {t("admin.announcements.pinned")}
            </span>
          )}
          <h3 className={`text-sm font-semibold ${T1} truncate`}>
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
          <span className={`text-xs ${T3} flex items-center gap-1`}>
            <Calendar className="w-3 h-3" />
            {formatDate(announcement.created_at)}
          </span>
          {/* 📎 Attachment badge */}
          {announcement.attachment_url && (
            <a
              href={announcement.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1 text-xs ${BRAND_GREEN} hover:underline`}
              onClick={(e) => e.stopPropagation()}
            >
              {getAttachmentIcon(announcement.attachment_type)}
              {announcement.attachment_name ? (
                <span className="truncate max-w-[100px]">
                  {announcement.attachment_name}
                </span>
              ) : (
                <span>{getAttachmentLabel(announcement.attachment_type)}</span>
              )}
            </a>
          )}
          {announcement.is_published ? (
            <span className={`text-xs ${BRAND_GREEN} flex items-center gap-1`}>
              <Globe className="w-3 h-3" /> {t("admin.announcements.published")}
            </span>
          ) : (
            <span className={`text-xs ${T3} flex items-center gap-1`}>
              <GlobeLock className="w-3 h-3" /> {t("admin.announcements.draft")}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={togglePin}
          disabled={pinMutation.isPending || unpinMutation.isPending}
          className={`p-2 rounded-lg transition-colors ${
            isPinned
              ? "text-amber-500 dark:text-amber-400 hover:bg-amber-500/10 dark:hover:bg-amber-500/15"
              : `${T3} hover:text-amber-500 hover:bg-amber-500/10 dark:hover:bg-amber-500/15`
          }`}
          title={
            isPinned
              ? t("admin.announcements.unpin")
              : t("admin.announcements.pin")
          }
        >
          {isPinned ? (
            <PinOff className="w-4 h-4" />
          ) : (
            <Pin className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={togglePublish}
          disabled={publishMutation.isPending || unpublishMutation.isPending}
          className={`p-2 rounded-lg transition-colors ${
            announcement.is_published
              ? "hover:bg-[#C4A035]/10 dark:hover:bg-[#C4A035]/15 " +
                BRAND_MUSTARD
              : "hover:bg-[#8DB896]/15 dark:hover:bg-[#8DB896]/10 " +
                BRAND_GREEN
          }`}
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
          className={`p-2 rounded-lg hover:bg-[#C4A035]/10 dark:hover:bg-[#C4A035]/15 ${BRAND_MUSTARD} transition-colors`}
          title={t("admin.announcements.edit")}
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 dark:text-red-400 transition-colors"
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
  const pinnedCount = announcements.filter((a) => a.is_pinned).length;

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

  const selectClass = `px-4 py-2.5 rounded-xl border ${S_INPUT} focus:border-[#2B6F5E] outline-none text-sm cursor-pointer`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ═══ Header ═══ */}
      <div className={`relative ${S_CARD} rounded-2xl p-6 overflow-hidden`}>
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-lg shadow-[#C4A035]/20 dark:shadow-[#C4A035]/10">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${T1}`}>
                {t("admin.announcements.title")}
              </h1>
              <p className={`text-sm ${T3} mt-0.5`}>
                {t("admin.announcements.subtitle")}
              </p>
            </div>
          </div>
          <Button
            onClick={openCreate}
            className="bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white border-0 gap-2 shadow-md shadow-[#2B6F5E]/20 dark:shadow-[#2B6F5E]/10 self-start"
          >
            <Plus className="w-4 h-4" />{" "}
            {t("admin.announcements.newAnnouncement")}
          </Button>
        </div>
      </div>

      {/* ═══ Stats ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
            labelKey: "admin.announcements.pinnedCount",
            value: pinnedCount,
            icon: Pin,
            color: "amber" as const,
          },
          {
            labelKey: "admin.announcements.withAttachments",
            value: announcements.filter((a) => a.attachment_url).length,
            icon: Paperclip,
            color: "mustard" as const,
          },
        ].map((stat) => {
          const colors = {
            teal: {
              bar: "from-[#2B6F5E] to-[#2B6F5E]/70",
              bg: "bg-[#2B6F5E]/8 dark:bg-[#2B6F5E]/15",
              icon: "text-[#2B6F5E] dark:text-[#5EAA8D]",
            },
            green: {
              bar: "from-[#8DB896] to-[#8DB896]/70",
              bg: "bg-[#8DB896]/12 dark:bg-[#8DB896]/15",
              icon: "text-[#3D7A4A] dark:text-[#8DB896]",
            },
            beige: {
              bar: "from-[#BEB29E] to-[#BEB29E]/70",
              bg: "bg-[#D8CDC0]/20 dark:bg-[#D8CDC0]/10",
              icon: "text-[#6B5D4F] dark:text-[#A09080]",
            },
            amber: {
              bar: "from-amber-400 to-amber-500/70",
              bg: "bg-amber-500/8 dark:bg-amber-500/15",
              icon: "text-amber-600 dark:text-amber-400",
            },
            mustard: {
              bar: "from-[#C4A035] to-[#C4A035]/70",
              bg: "bg-[#C4A035]/8 dark:bg-[#C4A035]/15",
              icon: "text-[#C4A035] dark:text-[#D4B040]",
            },
          };
          const c = colors[stat.color];
          return (
            <div
              key={stat.labelKey}
              className={`relative ${S_CARD} rounded-2xl p-5 overflow-hidden group hover:shadow-md dark:hover:shadow-black/20 transition-all`}
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${c.bar} opacity-60 group-hover:opacity-100 transition-opacity`}
              />
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}
                >
                  <stat.icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${T1}`}>{stat.value}</p>
                  <p className={`text-xs ${T2}`}>{t(stat.labelKey)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Filters ═══ */}
      <div className={`${S_CARD} rounded-2xl p-5`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${T3}`}
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t("admin.announcements.search")}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${S_INPUT} focus:border-[#2B6F5E] focus:ring-2 focus:ring-[#2B6F5E]/20 outline-none text-sm transition-all`}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className={`${selectClass} min-w-[140px]`}
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
            className={`${selectClass} min-w-[120px]`}
          >
            <option value="">{t("admin.announcements.allStatus")}</option>
            <option value="true">{t("admin.announcements.published")}</option>
            <option value="false">{t("admin.announcements.draft")}</option>
          </select>
        </div>
      </div>

      {/* ═══ List ═══ */}
      <div className={`${S_CARD} rounded-2xl p-5`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-[#2B6F5E]/20 border-t-[#2B6F5E] rounded-full animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F3F1EC] dark:bg-[#222222] flex items-center justify-center mb-4">
              <Megaphone className={`w-8 h-8 ${T3}`} />
            </div>
            <h3 className={`text-base font-semibold ${T1} mb-1`}>
              {t("admin.announcements.noAnnouncements")}
            </h3>
            <p className={`text-sm ${T3} mb-4`}>
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
          <div
            className={`flex items-center justify-between pt-4 mt-4 border-t ${S_BORDER}`}
          >
            <p className={`text-xs ${T3}`}>
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
                className="p-2 rounded-lg hover:bg-[#F3F1EC] dark:hover:bg-[#222] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className={`w-4 h-4 ${T2}`} />
              </button>
              {Array.from(
                { length: Math.min(pagination.total_pages, 5) },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? "bg-[#2B6F5E] text-white" : `hover:bg-[#F3F1EC] dark:hover:bg-[#222] ${T2}`}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.total_pages, p + 1))
                }
                disabled={page === pagination.total_pages}
                className="p-2 rounded-lg hover:bg-[#F3F1EC] dark:hover:bg-[#222] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className={`w-4 h-4 ${T2}`} />
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
