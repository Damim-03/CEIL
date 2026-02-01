import * as React from "react";
import { X, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";

/* ================= TYPES ================= */

type AlertType = "success" | "error" | "warning" | "info" | "confirm";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
}

/* ================= ALERT DIALOG ================= */

export function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  confirmText = "Confirm",
  cancelText = "Cancel",
}: AlertDialogProps) {
  if (!isOpen) return null;

  const config = {
    info: {
      icon: Info,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      headerBg: "bg-gradient-to-r from-blue-50 to-indigo-50",
      accentColor: "border-blue-500",
    },
    success: {
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      headerBg: "bg-gradient-to-r from-green-50 to-emerald-50",
      accentColor: "border-green-500",
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      headerBg: "bg-gradient-to-r from-amber-50 to-yellow-50",
      accentColor: "border-amber-500",
    },
    error: {
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      headerBg: "bg-gradient-to-r from-red-50 to-rose-50",
      accentColor: "border-red-500",
    },
    confirm: {
      icon: AlertTriangle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      headerBg: "bg-gradient-to-r from-amber-50 to-yellow-50",
      accentColor: "border-amber-500",
    },
  };

  const { icon: Icon, iconBg, iconColor, headerBg } = config[type];
  const isConfirmType = type === "confirm";

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-xl shadow-2xl max-w-md w-full pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 border-t-4 ${accentColor}"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`${headerBg} px-6 py-5 rounded-t-xl border-b border-gray-100`}>
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <Icon className={`w-7 h-7 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              </div>
              {!isConfirmType && (
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <p className="text-gray-700 leading-relaxed text-base">{message}</p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100 flex items-center justify-end gap-3">
            {isConfirmType && (
              <Button onClick={onClose} variant="outline" className="min-w-24">
                {cancelText}
              </Button>
            )}
            <Button
              onClick={handleConfirm}
              variant={isConfirmType ? "destructive" : "default"}
              className="min-w-24"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================= HOOK FOR EASY USAGE ================= */

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
}

export function useAlert() {
  const [alertState, setAlertState] = React.useState<AlertState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const showAlert = (
    type: AlertType,
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setAlertState({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
    });
  };

  const hideAlert = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    alertState.onConfirm?.();
    hideAlert();
  };

  return {
    alertState,
    showAlert,
    hideAlert,
    handleConfirm,
    // Helper methods
    showSuccess: (title: string, message: string, onConfirm?: () => void) =>
      showAlert("success", title, message, onConfirm),
    showError: (title: string, message: string, onConfirm?: () => void) =>
      showAlert("error", title, message, onConfirm),
    showWarning: (title: string, message: string, onConfirm?: () => void) =>
      showAlert("warning", title, message, onConfirm),
    showInfo: (title: string, message: string, onConfirm?: () => void) =>
      showAlert("info", title, message, onConfirm),
    showConfirm: (title: string, message: string, onConfirm?: () => void) =>
      showAlert("confirm", title, message, onConfirm),
  };
}