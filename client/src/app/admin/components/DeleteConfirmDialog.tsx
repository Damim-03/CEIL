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
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-bold text-gray-900 mb-1">
                Delete Session
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Are you sure you want to delete this session?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Session Info */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{sessionInfo}</p>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs text-red-700 font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            This action cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Session"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;