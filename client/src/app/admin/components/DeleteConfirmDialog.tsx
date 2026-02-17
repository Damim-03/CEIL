import { useTranslation } from "react-i18next";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  sessionInfo: string;
}

const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  isDeleting,
  sessionInfo,
}: DeleteConfirmDialogProps) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-[#1A1A1A] border-[#D8CDC0]/60 dark:border-[#2A2A2A]">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
                {t("admin.deleteSessionDialog.deleteSession")}
              </DialogTitle>
              <DialogDescription className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                {t("admin.deleteSessionDialog.deleteConfirm")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="bg-[#D8CDC0]/8 dark:bg-[#222222] rounded-lg p-3 border border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
          <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {sessionInfo}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-lg p-3">
          <p className="text-xs text-red-700 dark:text-red-400 font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {t("admin.deleteSessionDialog.cannotUndo")}
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="border-[#D8CDC0]/60 dark:border-[#2A2A2A] text-[#6B5D4F] dark:text-[#AAAAAA] dark:hover:bg-[#222222]"
          >
            {t("admin.deleteSessionDialog.cancel")}
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-2 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("admin.deleteSessionDialog.deleting")}
              </>
            ) : (
              t("admin.deleteSessionDialog.deleteButton")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
