import { useTranslation } from "react-i18next";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDeleteCardProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteCard = ({
  open,
  title,
  message,
  confirmText,
  cancelText,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteCardProps) => {
  const { t } = useTranslation();

  if (!open) return null;

  const resolvedTitle = title || t("common.confirmAction", { defaultValue: "Confirm Action" });
  const resolvedConfirm = confirmText || t("common.yes", { defaultValue: "Yes" });
  const resolvedCancel = cancelText || t("common.no", { defaultValue: "No" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm mx-4 bg-white dark:bg-[#1A1A1A] border border-brand-beige/60 dark:border-[#2A2A2A] rounded-2xl shadow-2xl dark:shadow-black/50 overflow-hidden">
        {/* Red accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-red-500 to-red-600"></div>

        {/* Close button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-brand-brown dark:text-[#666666] hover:bg-brand-beige/15 dark:hover:bg-[#2A2A2A] hover:text-[#1B1B1B] dark:hover:text-[#E5E5E5] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Icon + Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {resolvedTitle}
            </h2>
          </div>

          {/* Message */}
          <p className="text-sm text-[#6B5D4F] dark:text-[#AAAAAA] leading-relaxed mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2.5 text-sm font-medium text-[#6B5D4F] dark:text-[#AAAAAA] bg-brand-beige/15 dark:bg-[#2A2A2A] hover:bg-brand-beige/25 dark:hover:bg-[#333333] rounded-xl transition-colors disabled:opacity-50"
            >
              {resolvedCancel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 rounded-xl transition-colors shadow-md shadow-red-500/20 dark:shadow-red-600/20 disabled:opacity-50"
            >
              {isLoading
                ? t("common.deleting", { defaultValue: "Deleting..." })
                : resolvedConfirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteCard;