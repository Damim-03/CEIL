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
  title = "Confirm Action",
  message,
  confirmText = "Yes",
  cancelText = "No",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteCardProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="card card-border bg-base-100 w-96 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-error">{title}</h2>

          <p className="text-sm text-gray-600">{message}</p>

          <div className="card-actions justify-end mt-4">
            <button
              className="btn btn-ghost"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelText}
            </button>

            <button
              className="btn btn-error"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteCard;
