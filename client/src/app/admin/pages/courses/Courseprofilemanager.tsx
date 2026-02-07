import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  ExternalLink,
  ImagePlus,
  X,
  GripVertical,
  ArrowLeft,
  Calendar,
  DollarSign,
  Tag,
  Languages,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Switch } from "../../../../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import {
  useAdminCourseProfile,
  useCreateOrUpdateCourseProfile,
  usePublishCourseProfile,
  useUnpublishCourseProfile,
  useAdminCoursePricing,
  useAddCoursePricing,
  useUpdateCoursePricing,
  useDeleteCoursePricing,
  useAdminCourse,
} from "../../../../hooks/admin/useAdmin";
import type {
  CreateCourseProfileData,
  CreateCoursePricingData,
  CoursePricing,
} from "../../../../lib/api/admin/admin.api";

interface PricingForm {
  status_fr: string;
  status_ar: string;
  status_en: string;
  price: string;
  currency: string;
  discount: string;
  sort_order: string;
}

const EMPTY_PRICING: PricingForm = {
  status_fr: "",
  status_ar: "",
  status_en: "",
  price: "0",
  currency: "DA",
  discount: "Aucune",
  sort_order: "0",
};

const FLAGS = [
  { emoji: "🇫🇷", label: "Français" },
  { emoji: "🇬🇧", label: "English" },
  { emoji: "🇪🇸", label: "Español" },
  { emoji: "🇩🇪", label: "Deutsch" },
  { emoji: "🇮🇹", label: "Italiano" },
  { emoji: "🇹🇷", label: "Türkçe" },
  { emoji: "🇨🇳", label: "中文" },
  { emoji: "🇯🇵", label: "日本語" },
  { emoji: "🇰🇷", label: "한국어" },
  { emoji: "🇷🇺", label: "Русский" },
  { emoji: "🇵🇹", label: "Português" },
];

// ─── Section Card ───
const SectionCard = ({
  icon: Icon,
  title,
  description,
  children,
  action,
}: {
  icon: any;
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
    <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
    <div className="p-6 space-y-5">{children}</div>
  </div>
);

// ─── Field Group ───
const FieldGroup = ({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">{label}</Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export default function CourseProfileManager() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { data: course } = useAdminCourse(courseId);
  const { data: profile, isLoading: profileLoading } =
    useAdminCourseProfile(courseId);
  const { data: pricingList, isLoading: pricingLoading } =
    useAdminCoursePricing(courseId);

  const saveProfile = useCreateOrUpdateCourseProfile();
  const publishProfile = usePublishCourseProfile();
  const unpublishProfile = useUnpublishCourseProfile();
  const addPricing = useAddCoursePricing();
  const updatePricing = useUpdateCoursePricing();
  const deletePricing = useDeleteCoursePricing();

  const [form, setForm] = useState<CreateCourseProfileData>({
    title_ar: "",
    description: "",
    description_ar: "",
    language: "",
    level: "",
    flag_emoji: "",
    price: 0,
    currency: "DZD",
    session_name: "",
    start_date: "",
    end_date: "",
    registration_open: true,
    is_published: false,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pricingDialog, setPricingDialog] = useState(false);
  const [editingPricing, setEditingPricing] = useState<CoursePricing | null>(
    null,
  );
  const [pricingForm, setPricingForm] = useState<PricingForm>(EMPTY_PRICING);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        title_ar: profile.title_ar || "",
        description: profile.description || "",
        description_ar: profile.description_ar || "",
        language: profile.language || "",
        level: profile.level || "",
        flag_emoji: profile.flag_emoji || "",
        price: profile.price ? Number(profile.price) : 0,
        currency: profile.currency || "DZD",
        session_name: profile.session_name || "",
        start_date: profile.start_date ? profile.start_date.split("T")[0] : "",
        end_date: profile.end_date ? profile.end_date.split("T")[0] : "",
        registration_open: profile.registration_open,
        is_published: profile.is_published,
      });
      if (profile.image_url) setImagePreview(profile.image_url);
    }
  }, [profile]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = () => {
    if (!courseId) return;
    saveProfile.mutate({ courseId, data: form });
  };

  const handleTogglePublish = () => {
    if (!courseId) return;
    if (profile?.is_published) {
      unpublishProfile.mutate(courseId);
    } else {
      publishProfile.mutate(courseId);
    }
  };

  const openAddPricing = () => {
    setEditingPricing(null);
    setPricingForm(EMPTY_PRICING);
    setPricingDialog(true);
  };

  const openEditPricing = (p: CoursePricing) => {
    setEditingPricing(p);
    setPricingForm({
      status_fr: p.status_fr,
      status_ar: p.status_ar || "",
      status_en: p.status_en || "",
      price: String(p.price),
      currency: p.currency,
      discount: p.discount || "Aucune",
      sort_order: String(p.sort_order),
    });
    setPricingDialog(true);
  };

  const handleSavePricing = () => {
    if (!courseId || !pricingForm.status_fr.trim()) return;
    const data: CreateCoursePricingData = {
      status_fr: pricingForm.status_fr,
      status_ar: pricingForm.status_ar || undefined,
      status_en: pricingForm.status_en || undefined,
      price: Number(pricingForm.price),
      currency: pricingForm.currency,
      discount: pricingForm.discount || undefined,
      sort_order: Number(pricingForm.sort_order),
    };
    if (editingPricing) {
      updatePricing.mutate(
        { courseId, pricingId: editingPricing.pricing_id, data },
        { onSuccess: () => setPricingDialog(false) },
      );
    } else {
      addPricing.mutate(
        { courseId, data },
        { onSuccess: () => setPricingDialog(false) },
      );
    }
  };

  const handleDeletePricing = (pricingId: string) => {
    if (!courseId) return;
    deletePricing.mutate(
      { courseId, pricingId },
      { onSuccess: () => setDeleteDialog(null) },
    );
  };

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-muted" />
          <Loader2 className="w-12 h-12 animate-spin text-primary absolute inset-0" />
        </div>
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* ─── Top Bar ─── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-10 w-10 shrink-0"
              onClick={() => navigate("/admin/formations")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                {profile
                  ? "Edit Formation Profile"
                  : "Create Formation Profile"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {course?.course_name || "..."}{" "}
                {form.flag_emoji && (
                  <span className="ml-1">{form.flag_emoji}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {profile && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2 rounded-lg"
              >
                <Link to={`/courses/${courseId}`} target="_blank">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Preview
                </Link>
              </Button>
            )}
            <Button
              variant={profile?.is_published ? "destructive" : "outline"}
              size="sm"
              onClick={handleTogglePublish}
              disabled={
                !profile ||
                publishProfile.isPending ||
                unpublishProfile.isPending
              }
              className="gap-2 rounded-lg"
            >
              {profile?.is_published ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  Publish
                </>
              )}
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={saveProfile.isPending}
              className="gap-2 rounded-lg shadow-sm"
            >
              {saveProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Profile
            </Button>
          </div>
        </div>

        {profile && (
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium ${
              profile.is_published
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
            }`}
          >
            {profile.is_published ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {profile.is_published
              ? "Published — Visible to website visitors"
              : "Draft — Not visible to the public yet"}
          </div>
        )}
      </div>

      {/* ═══ SECTION 1: Basic Information ═══ */}
      <SectionCard
        icon={Languages}
        title="Basic Information"
        description="Course identity, language, and description"
      >
        <FieldGroup label="Arabic Title" hint="Displayed on the public website">
          <Input
            value={form.title_ar}
            onChange={(e) => handleChange("title_ar", e.target.value)}
            placeholder="e.g. اللغة الفرنسية"
            dir="rtl"
            className="rounded-lg"
          />
        </FieldGroup>

        <div className="grid gap-5 md:grid-cols-2">
          <FieldGroup label="Arabic Description">
            <Textarea
              value={form.description_ar}
              onChange={(e) => handleChange("description_ar", e.target.value)}
              rows={4}
              dir="rtl"
              placeholder="وصف التكوين بالعربية..."
              className="rounded-lg resize-none"
            />
          </FieldGroup>
          <FieldGroup label="Description (FR / EN)">
            <Textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              dir="ltr"
              placeholder="Course description..."
              className="rounded-lg resize-none"
            />
          </FieldGroup>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <FieldGroup label="Language">
            <Input
              value={form.language}
              onChange={(e) => handleChange("language", e.target.value)}
              placeholder="Français, English..."
              dir="ltr"
              className="rounded-lg"
            />
          </FieldGroup>
          <FieldGroup label="Level">
            <Input
              value={form.level}
              onChange={(e) => handleChange("level", e.target.value)}
              placeholder="A1, A1-C1, All levels..."
              dir="ltr"
              className="rounded-lg"
            />
          </FieldGroup>
          <FieldGroup label="Flag">
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {FLAGS.map((f) => (
                <button
                  key={f.emoji}
                  type="button"
                  onClick={() => handleChange("flag_emoji", f.emoji)}
                  className={`text-xl p-1.5 rounded-lg border-2 transition-all duration-150 ${
                    form.flag_emoji === f.emoji
                      ? "border-primary bg-primary/10 scale-110 shadow-sm"
                      : "border-transparent hover:border-muted-foreground/20 hover:bg-muted/50"
                  }`}
                  title={f.label}
                >
                  {f.emoji}
                </button>
              ))}
            </div>
          </FieldGroup>
        </div>

        <FieldGroup
          label="Course Image"
          hint="Recommended: 800×450px, JPG or PNG"
        >
          <div className="flex items-start gap-4">
            {imagePreview ? (
              <div className="relative w-44 h-28 rounded-xl overflow-hidden border bg-muted group">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    handleChange("image", undefined);
                  }}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-44 h-28 rounded-xl border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                <ImagePlus className="w-6 h-6 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground mt-1.5 font-medium">
                  Upload Image
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
        </FieldGroup>
      </SectionCard>

      {/* ═══ SECTION 2: Session & Registration ═══ */}
      <SectionCard
        icon={Calendar}
        title="Session & Registration"
        description="Session dates, pricing, and enrollment settings"
      >
        <div className="grid gap-5 md:grid-cols-3">
          <FieldGroup label="Session Name" hint="e.g. Spring 2026">
            <Input
              value={form.session_name}
              onChange={(e) => handleChange("session_name", e.target.value)}
              placeholder="Spring 2026"
              dir="ltr"
              className="rounded-lg"
            />
          </FieldGroup>
          <FieldGroup label="Start Date">
            <Input
              type="date"
              value={form.start_date}
              onChange={(e) => handleChange("start_date", e.target.value)}
              className="rounded-lg"
            />
          </FieldGroup>
          <FieldGroup label="End Date">
            <Input
              type="date"
              value={form.end_date}
              onChange={(e) => handleChange("end_date", e.target.value)}
              className="rounded-lg"
            />
          </FieldGroup>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <FieldGroup label="Base Price">
            <Input
              type="number"
              value={form.price}
              onChange={(e) => handleChange("price", Number(e.target.value))}
              dir="ltr"
              className="rounded-lg"
            />
          </FieldGroup>
          <FieldGroup label="Currency">
            <Input
              value={form.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              placeholder="DZD"
              dir="ltr"
              className="rounded-lg"
            />
          </FieldGroup>
          <div className="flex items-end pb-1">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border w-full">
              <Switch
                checked={form.registration_open}
                onCheckedChange={(v) => handleChange("registration_open", v)}
              />
              <div>
                <p className="text-sm font-medium">
                  {form.registration_open ? "Open" : "Closed"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {form.registration_open
                    ? "Accepting registrations"
                    : "Registration disabled"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ═══ SECTION 3: Pricing Tiers ═══ */}
      <SectionCard
        icon={Tag}
        title="Pricing Tiers"
        description="Different prices based on applicant status"
        action={
          <Button
            size="sm"
            onClick={openAddPricing}
            className="gap-2 rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Tier
          </Button>
        }
      >
        {pricingLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !pricingList || pricingList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                No pricing tiers yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first tier to display on the course page
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground w-8">
                    #
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Status (FR)
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Arabic
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    English
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Price
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                    Discount
                  </th>
                  <th className="text-center px-6 py-3 font-medium text-muted-foreground w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {pricingList.map((p) => (
                  <tr
                    key={p.pricing_id}
                    className="group hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-3.5 text-muted-foreground">
                      <GripVertical className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-foreground">
                      {p.status_fr}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground" dir="rtl">
                      {p.status_ar || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {p.status_en || "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 font-bold text-foreground tabular-nums">
                        {Number(p.price).toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                        })}
                        <span className="text-xs font-medium text-muted-foreground ml-0.5">
                          {p.currency}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
                          !p.discount || p.discount === "Aucune"
                            ? "bg-muted/60 text-muted-foreground"
                            : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        }`}
                      >
                        {p.discount || "None"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => openEditPricing(p)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                          onClick={() => setDeleteDialog(p.pricing_id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* ═══ PRICING DIALOG ═══ */}
      <Dialog open={pricingDialog} onOpenChange={setPricingDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingPricing ? "Edit Pricing Tier" : "Add Pricing Tier"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FieldGroup label="Status (French) *">
              <Input
                value={pricingForm.status_fr}
                onChange={(e) =>
                  setPricingForm((p) => ({ ...p, status_fr: e.target.value }))
                }
                placeholder="Étudiant(e), Employé(e)..."
                dir="ltr"
                className="rounded-lg"
              />
            </FieldGroup>
            <div className="grid gap-4 grid-cols-2">
              <FieldGroup label="Arabic">
                <Input
                  value={pricingForm.status_ar}
                  onChange={(e) =>
                    setPricingForm((p) => ({
                      ...p,
                      status_ar: e.target.value,
                    }))
                  }
                  placeholder="طالب، موظف..."
                  dir="rtl"
                  className="rounded-lg"
                />
              </FieldGroup>
              <FieldGroup label="English">
                <Input
                  value={pricingForm.status_en}
                  onChange={(e) =>
                    setPricingForm((p) => ({
                      ...p,
                      status_en: e.target.value,
                    }))
                  }
                  placeholder="Student, Staff..."
                  dir="ltr"
                  className="rounded-lg"
                />
              </FieldGroup>
            </div>
            <div className="grid gap-4 grid-cols-3">
              <FieldGroup label="Price">
                <Input
                  type="number"
                  value={pricingForm.price}
                  onChange={(e) =>
                    setPricingForm((p) => ({ ...p, price: e.target.value }))
                  }
                  dir="ltr"
                  className="rounded-lg"
                />
              </FieldGroup>
              <FieldGroup label="Currency">
                <Input
                  value={pricingForm.currency}
                  onChange={(e) =>
                    setPricingForm((p) => ({
                      ...p,
                      currency: e.target.value,
                    }))
                  }
                  dir="ltr"
                  className="rounded-lg"
                />
              </FieldGroup>
              <FieldGroup label="Discount">
                <Input
                  value={pricingForm.discount}
                  onChange={(e) =>
                    setPricingForm((p) => ({
                      ...p,
                      discount: e.target.value,
                    }))
                  }
                  placeholder="None, 50%..."
                  dir="ltr"
                  className="rounded-lg"
                />
              </FieldGroup>
            </div>
            <FieldGroup label="Sort Order">
              <Input
                type="number"
                value={pricingForm.sort_order}
                onChange={(e) =>
                  setPricingForm((p) => ({
                    ...p,
                    sort_order: e.target.value,
                  }))
                }
                dir="ltr"
                className="w-28 rounded-lg"
              />
            </FieldGroup>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setPricingDialog(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePricing}
              disabled={
                !pricingForm.status_fr.trim() ||
                addPricing.isPending ||
                updatePricing.isPending
              }
              className="rounded-lg gap-2"
            >
              {(addPricing.isPending || updatePricing.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {editingPricing ? "Update" : "Add Tier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE DIALOG ═══ */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Pricing Tier</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            Are you sure you want to delete this pricing tier? This action
            cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(null)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog && handleDeletePricing(deleteDialog)}
              disabled={deletePricing.isPending}
              className="rounded-lg gap-2"
            >
              {deletePricing.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
