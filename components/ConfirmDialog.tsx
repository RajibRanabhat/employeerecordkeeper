"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
};

export function ConfirmDialog({
  open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, onCancel, danger = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4">
      <div className="bg-card border border-line rounded-lg p-6 max-w-sm w-full shadow-lg">
        <h3 className="font-display text-lg font-semibold text-ink mb-2">{title}</h3>
        <p className="text-sm text-ink-soft mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="text-sm border border-line rounded-md px-4 py-2 text-ink-soft hover:text-ink hover:border-ink-soft transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`text-sm font-medium rounded-md px-4 py-2 text-paper transition-colors ${
              danger ? "bg-danger hover:bg-danger-hover" : "bg-ledger hover:bg-ledger-hover"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}