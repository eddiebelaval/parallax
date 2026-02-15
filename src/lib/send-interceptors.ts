/**
 * Shared interceptors for handleSend callbacks across views.
 *
 * Both architect mode and profile concierge command handling are
 * identical across SoloView, RemoteView, and XRayGlanceView.
 * This module extracts the common logic.
 */

type FeedbackSetter = (msg: string | null) => void;
type SpeakFn = ((text: string) => void) | undefined;

interface ConfirmationModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  isDangerous?: boolean;
}

interface ProfileConcierge {
  isCommand: (content: string) => boolean;
  processCommand: (content: string) => Promise<{
    requires_confirmation?: boolean;
    confirmation_prompt?: string;
    success?: boolean;
    message?: string;
  }>;
  confirm: () => Promise<{ success: boolean; message: string }>;
}

/**
 * Send a message to the architect API and report feedback.
 * Returns true if the message was handled (caller should return early).
 */
export async function handleArchitectMessage(
  content: string,
  setFeedback: FeedbackSetter,
  speak?: SpeakFn,
): Promise<boolean> {
  setFeedback("Architect: Consulting architecture...");
  try {
    const res = await fetch("/api/architect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: content }),
    });

    if (!res.ok) {
      setFeedback("Error: Architect mode unavailable");
      return true;
    }

    const data = await res.json();
    setFeedback(`Architect: ${data.message}`);
    speak?.(data.message);
    setTimeout(() => setFeedback(null), 30000);
  } catch {
    setFeedback("Error: Architect mode connection failed");
  }
  return true;
}

/**
 * Process a profile concierge voice command.
 * Returns true if the message was handled (caller should return early).
 */
export async function handleProfileCommand(
  content: string,
  concierge: ProfileConcierge,
  setFeedback: FeedbackSetter,
  setConfirmationModal: (modal: ConfirmationModalState | null) => void,
  speak?: SpeakFn,
): Promise<boolean> {
  if (!concierge.isCommand(content)) return false;

  try {
    const response = await concierge.processCommand(content);

    if (response.requires_confirmation) {
      setConfirmationModal({
        isOpen: true,
        title: "Confirm Action",
        message: response.confirmation_prompt || "Are you sure?",
        isDangerous: content.toLowerCase().includes("delete"),
        onConfirm: async () => {
          const result = await concierge.confirm();
          setConfirmationModal(null);
          const msg = result.success
            ? `Success: ${result.message}`
            : `Error: ${result.message}`;
          setFeedback(msg);
          speak?.(result.message);
          setTimeout(() => setFeedback(null), 5000);
        },
      });
    } else {
      const msg = response.success
        ? `Success: ${response.message}`
        : `Error: ${response.message}`;
      setFeedback(msg);
      speak?.(response.message ?? "");
      setTimeout(() => setFeedback(null), 5000);
    }
  } catch {
    const errorMsg = "Error: Failed to process profile command";
    setFeedback(errorMsg);
    speak?.(errorMsg);
  }
  return true;
}
