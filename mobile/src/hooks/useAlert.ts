// src/hooks/useAlert.ts
import { useRef } from "react";
import { AlertManager } from "../components/common/AlertModal";

export function useAlert() {
  const show = (
    type: "success" | "error" | "warning" | "info" | "confirm",
    title: string,
    message?: string,
    options?: {
      confirmText?: string;
      cancelText?: string;
      onConfirm?: () => void;
      onCancel?: () => void;
    },
  ) => {
    AlertManager.show({ type, title, message, ...options });
  };

  return {
    success: (title: string, message?: string, onConfirm?: () => void) =>
      show("success", title, message, { onConfirm }),

    error: (title: string, message?: string, onConfirm?: () => void) =>
      show("error", title, message, { onConfirm }),

    warning: (title: string, message?: string, onConfirm?: () => void) =>
      show("warning", title, message, { onConfirm }),

    info: (title: string, message?: string, onConfirm?: () => void) =>
      show("info", title, message, { onConfirm }),

    confirm: (
      title: string,
      message: string,
      onConfirm: () => void,
      options?: {
        confirmText?: string;
        cancelText?: string;
        onCancel?: () => void;
      },
    ) => show("confirm", title, message, { onConfirm, ...options }),
  };
}
