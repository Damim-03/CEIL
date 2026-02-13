import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  DollarSign,
  Tag,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  BookOpen,
  Globe,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useCoursePricing } from "../../../hooks/student/Usestudent";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pricingId: string) => void; // ✅ Now sends pricing_id
  courseId: string | null;
  courseName: string;
  groupName: string;
  isEnrolling: boolean;
}

export const PricingModal = ({
  isOpen,
  onClose,
  onConfirm,
  courseId,
  groupName,
  isEnrolling,
}: PricingModalProps) => {
  const { data: profile, isLoading, isError } = useCoursePricing(courseId);

  // ✅ Track which pricing tier the student selected
  const [selectedPricingId, setSelectedPricingId] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleConfirm = () => {
    if (!selectedPricingId) {
      setShowWarning(true);
      return;
    }
    setShowWarning(false);
    onConfirm(selectedPricingId);
  };

  const handleClose = () => {
    setSelectedPricingId(null);
    setShowWarning(false);
    onClose();
  };

  const selectedPricing = profile?.pricing?.find(
    (p) => p.pricing_id === selectedPricingId,
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            📚 Course Pricing & Information
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Review the pricing details and{" "}
            <span className="font-semibold text-blue-600">
              select your category
            </span>{" "}
            before enrolling in{" "}
            <span className="font-semibold text-blue-600">{groupName}</span>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-600">Loading pricing information...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Unable to Load Pricing
            </h3>
            <p className="text-red-600 mb-4">
              We couldn't load the pricing information for this course.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Try Again
            </Button>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* ═══ Course Info Card ═══ */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-5">
                {profile.image_url && (
                  <div className="shrink-0">
                    <img
                      src={profile.image_url}
                      alt={profile.course.course_name}
                      className="w-28 h-28 rounded-xl object-cover border-4 border-white shadow-lg"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {profile.flag_emoji && (
                        <span className="mr-2 text-3xl">
                          {profile.flag_emoji}
                        </span>
                      )}
                      {profile.title_ar || profile.course.course_name}
                    </h3>
                    {profile.course.course_code && (
                      <p className="text-sm text-gray-500 font-mono">
                        Code: {profile.course.course_code}
                      </p>
                    )}
                  </div>

                  {(profile.description || profile.description_ar) && (
                    <div className="mb-4 p-3 bg-white/60 rounded-lg">
                      {profile.description && (
                        <p className="text-sm text-gray-700 leading-relaxed mb-2">
                          {profile.description}
                        </p>
                      )}
                      {profile.description_ar && (
                        <p className="text-sm text-gray-600 leading-relaxed text-right dir-rtl">
                          {profile.description_ar}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {profile.language && (
                      <Badge
                        variant="secondary"
                        className="bg-white/80 text-blue-700 border border-blue-200"
                      >
                        <Globe className="w-3 h-3 mr-1" />
                        {profile.language}
                      </Badge>
                    )}
                    {profile.level && (
                      <Badge
                        variant="secondary"
                        className="bg-white/80 text-purple-700 border border-purple-200"
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Level {profile.level}
                      </Badge>
                    )}
                    {profile.session_name && (
                      <Badge
                        variant="secondary"
                        className="bg-white/80 text-green-700 border border-green-200"
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        {profile.session_name}
                      </Badge>
                    )}
                  </div>

                  {(profile.start_date || profile.end_date) && (
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                      {profile.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Start: {formatDate(profile.start_date)}
                        </span>
                      )}
                      {profile.end_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          End: {formatDate(profile.end_date)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ═══ Pricing Selection ═══ */}
            {profile.pricing && profile.pricing.length > 0 ? (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-gray-900">
                      Select Your Category
                    </h4>
                    <p className="text-sm text-gray-600">
                      Choose the pricing tier that matches your status
                    </p>
                  </div>
                </div>

                {/* Warning if not selected */}
                {showWarning && (
                  <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 text-sm text-amber-800 animate-[shake_0.3s_ease-in-out]">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-medium">
                      Please select your pricing category before continuing
                    </span>
                  </div>
                )}

                <div className="grid gap-3">
                  {profile.pricing.map((pricing, index) => {
                    const isSelected = selectedPricingId === pricing.pricing_id;

                    return (
                      <button
                        key={pricing.pricing_id}
                        type="button"
                        onClick={() => {
                          setSelectedPricingId(pricing.pricing_id);
                          setShowWarning(false);
                        }}
                        className={`
                          relative w-full text-left border-2 rounded-xl p-5 transition-all duration-200
                          ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/70 shadow-lg shadow-blue-100 ring-2 ring-blue-200"
                              : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                          }
                        `}
                      >
                        {/* Selected indicator */}
                        {isSelected && (
                          <div className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            {/* Radio-style indicator */}
                            <div
                              className={`
                                shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                ${
                                  isSelected
                                    ? "border-blue-600 bg-blue-600"
                                    : "border-gray-300 bg-white"
                                }
                              `}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                              )}
                            </div>

                            {/* Number badge */}
                            <span
                              className={`
                                flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold shadow-md shrink-0
                                ${
                                  isSelected
                                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                                    : "bg-gray-100 text-gray-500"
                                }
                              `}
                            >
                              {index + 1}
                            </span>

                            {/* Labels */}
                            <div className="flex-1 min-w-0">
                              <h5
                                className={`font-bold text-lg ${isSelected ? "text-blue-900" : "text-gray-900"}`}
                              >
                                {pricing.status_fr}
                              </h5>
                              <div className="flex items-center gap-2 mt-0.5">
                                {pricing.status_ar && (
                                  <span className="text-sm text-gray-500">
                                    {pricing.status_ar}
                                  </span>
                                )}
                                {pricing.status_en && (
                                  <span className="text-xs text-gray-400 italic">
                                    ({pricing.status_en})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right shrink-0">
                            <p
                              className={`text-2xl font-bold ${
                                isSelected
                                  ? "text-blue-600"
                                  : "text-gray-700"
                              }`}
                            >
                              {formatCurrency(
                                Number(pricing.price),
                                pricing.currency,
                              )}
                            </p>
                            {pricing.discount &&
                              pricing.discount !== "Aucune" && (
                                <Badge
                                  variant="destructive"
                                  className="gap-1 bg-gradient-to-r from-red-500 to-rose-600 mt-1"
                                >
                                  <Tag className="w-3 h-3" />
                                  {pricing.discount}
                                </Badge>
                              )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* ═══ Selected Summary ═══ */}
                {selectedPricing && (
                  <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-900">
                          Selected:
                        </span>
                        <span className="text-green-800">
                          {selectedPricing.status_fr}
                          {selectedPricing.status_ar && (
                            <span className="text-green-600 mx-1">
                              ({selectedPricing.status_ar})
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="text-xl font-bold text-green-700">
                        {formatCurrency(
                          Number(selectedPricing.price),
                          selectedPricing.currency,
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  No Pricing Information Available
                </h3>
                <p className="text-yellow-700 max-w-md mx-auto">
                  Pricing details haven't been set for this course yet. Please
                  contact the administration for more information.
                </p>
              </div>
            )}

            {/* ═══ Important Notice ═══ */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="shrink-0 p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-blue-900 mb-1">
                    📝 Important Information
                  </h5>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    After enrolling, the following steps will apply:
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                    <li>
                      Your selected category will be reviewed by the
                      administration
                    </li>
                    <li>
                      The admin will validate your enrollment and confirm the
                      pricing
                    </li>
                    <li>
                      You will need to complete payment based on the confirmed
                      amount
                    </li>
                    <li>Upload payment receipt for verification</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isEnrolling}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isEnrolling || isLoading || isError || !profile?.pricing?.length}
            className={`
              w-full sm:w-auto order-1 sm:order-2 shadow-lg hover:shadow-xl transition-all
              ${
                selectedPricingId
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  : "bg-gray-400 cursor-not-allowed"
              }
            `}
          >
            {isEnrolling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {selectedPricingId
                  ? `Confirm Enrollment — ${formatCurrency(Number(selectedPricing?.price || 0), selectedPricing?.currency || "DA")}`
                  : "Select a category first"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};