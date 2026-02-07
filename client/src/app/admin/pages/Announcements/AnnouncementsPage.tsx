import { useState } from "react";
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
import { Card, CardContent } from "../../../../components/ui/card";
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
const CATEGORIES = [
  { value: "", label: "الكل", labelEn: "All" },
  { value: "NEWS", label: "أخبار", labelEn: "News" },
  { value: "FORMATIONS", label: "تكوينات", labelEn: "Formations" },
  { value: "EXAMS", label: "امتحانات", labelEn: "Exams" },
  { value: "REGISTRATION", label: "تسجيلات", labelEn: "Registration" },
  { value: "EVENTS", label: "فعاليات", labelEn: "Events" },
];

const CATEGORY_COLORS: Record<string, string> = {
  NEWS: "bg-blue-50 text-blue-700 border-blue-200",
  FORMATIONS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  EXAMS: "bg-amber-50 text-amber-700 border-amber-200",
  REGISTRATION: "bg-purple-50 text-purple-700 border-purple-200",
  EVENTS: "bg-rose-50 text-rose-700 border-rose-200",
};

// ─── Format Date ───
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ─── Dialog Component ───
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
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl mx-4">
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
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-brand-teal-dark" />
          {isEdit ? "تعديل الإعلان" : "إنشاء إعلان جديد"}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            صورة الإعلان
          </label>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden h-48 bg-gray-100">
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
            <label className="flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-teal/50 cursor-pointer transition-colors bg-gray-50">
              <Upload className="w-8 h-8 text-gray-300 mb-2" />
              <span className="text-sm text-gray-400">
                اضغط لرفع صورة
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

        {/* Title (FR + AR) */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              العنوان (فرنسية) <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de l'annonce"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              العنوان (عربية)
            </label>
            <input
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              placeholder="عنوان الإعلان"
              dir="rtl"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Excerpt (FR + AR) */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              المقتطف (فرنسية)
            </label>
            <input
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Résumé court..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              المقتطف (عربية)
            </label>
            <input
              value={excerptAr}
              onChange={(e) => setExcerptAr(e.target.value)}
              placeholder="ملخص قصير..."
              dir="rtl"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Content FR */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            المحتوى (فرنسية) <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Le contenu complet de l'annonce..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none text-sm resize-none transition-all"
          />
        </div>

        {/* Content AR */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            المحتوى (عربية)
          </label>
          <textarea
            value={contentAr}
            onChange={(e) => setContentAr(e.target.value)}
            placeholder="المحتوى الكامل للإعلان..."
            rows={4}
            dir="rtl"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none text-sm resize-none transition-all"
          />
        </div>

        {/* Category + Publish */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              التصنيف
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none text-sm bg-white transition-all"
            >
              <option value="">بدون تصنيف</option>
              {CATEGORIES.filter((c) => c.value).map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label} ({c.labelEn})
                </option>
              ))}
            </select>
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                الحالة
              </label>
              <div className="flex items-center gap-3 h-[42px]">
                <button
                  onClick={() => setIsPublished(!isPublished)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isPublished ? "bg-brand-teal-dark" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      isPublished ? "left-[26px]" : "left-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">
                  {isPublished ? "نشر فوري" : "مسودة"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-gray-200 text-gray-600"
        >
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim() || isLoading}
          className="bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white border-0 gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isEdit ? (
            <Edit className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {isLoading
            ? "جاري الحفظ..."
            : isEdit
              ? "حفظ التعديلات"
              : "إنشاء الإعلان"}
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
      <h3 className="text-lg font-bold text-gray-900 mb-2">حذف الإعلان</h3>
      <p className="text-sm text-gray-500 mb-1">
        هل أنت متأكد من حذف هذا الإعلان؟
      </p>
      <p className="text-sm font-medium text-gray-700 mb-6 line-clamp-1" dir="rtl">
        "{announcement.title_ar || announcement.title}"
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-gray-200"
        >
          إلغاء
        </Button>
        <Button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="bg-red-500 hover:bg-red-600 text-white border-0"
        >
          {deleteMutation.isPending ? "جاري الحذف..." : "نعم، احذف"}
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
  const [menuOpen, setMenuOpen] = useState(false);
  const publishMutation = usePublishAnnouncement();
  const unpublishMutation = useUnpublishAnnouncement();

  const togglePublish = () => {
    if (announcement.is_published) {
      unpublishMutation.mutate(announcement.announcement_id);
    } else {
      publishMutation.mutate(announcement.announcement_id);
    }
  };

  const catClass =
    CATEGORY_COLORS[announcement.category || ""] ||
    "bg-gray-50 text-gray-600 border-gray-200";

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-brand-teal/20 hover:bg-gray-50/50 transition-all">
      {/* Image */}
      <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {announcement.image_url ? (
          <img
            src={announcement.image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0" dir="rtl">
        <div className="flex items-center gap-2 mb-1">
          {/* Status dot */}
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              announcement.is_published ? "bg-emerald-500" : "bg-gray-300"
            }`}
          />
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {announcement.title_ar || announcement.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {announcement.category && (
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${catClass}`}
            >
              {CATEGORIES.find((c) => c.value === announcement.category)
                ?.label || announcement.category}
            </span>
          )}
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(announcement.created_at)}
          </span>
          {announcement.is_published ? (
            <span className="text-xs text-emerald-600 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              منشور
            </span>
          ) : (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <GlobeLock className="w-3 h-3" />
              مسودة
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={togglePublish}
          disabled={publishMutation.isPending || unpublishMutation.isPending}
          className={`p-2 rounded-lg transition-colors ${
            announcement.is_published
              ? "hover:bg-amber-50 text-amber-600"
              : "hover:bg-emerald-50 text-emerald-600"
          }`}
          title={announcement.is_published ? "إلغاء النشر" : "نشر"}
        >
          {announcement.is_published ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
          title="تعديل"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
          title="حذف"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───
const Announcements = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [publishFilter, setPublishFilter] = useState<string>("");

  // Dialogs
  const [showForm, setShowForm] = useState(false);
  const [editAnnouncement, setEditAnnouncement] =
    useState<Announcement | null>(null);
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

  // Stats
  const totalCount = pagination?.total || 0;

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-brand-teal-dark" />
            إدارة الإعلانات
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            إنشاء ونشر وإدارة إعلانات المركز
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white border-0 gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          إعلان جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-teal-dark/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-brand-teal-dark" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              <p className="text-xs text-gray-500">إجمالي</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {announcements.filter((a) => a.is_published).length}
              </p>
              <p className="text-xs text-gray-500">منشور</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <GlobeLock className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {announcements.filter((a) => !a.is_published).length}
              </p>
              <p className="text-xs text-gray-500">مسودة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-mustard/10 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-brand-mustard" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {announcements.filter((a) => a.image_url).length}
              </p>
              <p className="text-xs text-gray-500">بصور</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-gray-100 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="البحث عن إعلان..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none text-sm transition-all"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-teal outline-none text-sm bg-white min-w-[140px]"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Publish Filter */}
            <select
              value={publishFilter}
              onChange={(e) => {
                setPublishFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-teal outline-none text-sm bg-white min-w-[120px]"
            >
              <option value="">كل الحالات</option>
              <option value="true">منشور</option>
              <option value="false">مسودة</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="border-gray-100">
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-brand-teal/20 border-t-brand-teal-dark rounded-full animate-spin" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                <Megaphone className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">
                لا توجد إعلانات
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                ابدأ بإنشاء إعلان جديد
              </p>
              <Button
                onClick={openCreate}
                className="bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white border-0 gap-2"
              >
                <Plus className="w-4 h-4" />
                إعلان جديد
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

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                صفحة {pagination.page} من {pagination.total_pages} (
                {pagination.total} إعلان)
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {Array.from(
                  { length: Math.min(pagination.total_pages, 5) },
                  (_, i) => i + 1,
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === p
                        ? "bg-brand-teal-dark text-white"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.total_pages, p + 1))
                  }
                  disabled={page === pagination.total_pages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onClose={closeForm}>
        <AnnouncementForm
          announcement={editAnnouncement}
          onClose={closeForm}
        />
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
      >
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