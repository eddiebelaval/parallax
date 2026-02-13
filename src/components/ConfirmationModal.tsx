'use client';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isDangerous = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onCancel}
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-surface border border-border rounded-lg p-6 shadow-lg">
        <h3
          id="confirm-title"
          className="text-lg font-medium text-foreground"
        >
          {title}
        </h3>

        <p
          id="confirm-message"
          className="mt-2 text-sm text-muted"
        >
          {message}
        </p>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-border text-muted rounded-lg hover:bg-surface transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              isDangerous
                ? 'bg-ember-hot text-white hover:opacity-90'
                : 'bg-accent text-ember-dark hover:opacity-90'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
