import {
  CaseStatus,
  CaseTransitionRequest,
  TransitionValidationResult,
  VALID_STATUS_TRANSITIONS,
} from "./types";

export class InvalidStatusTransitionError extends Error {
  constructor(
    public readonly fromStatus: CaseStatus,
    public readonly toStatus: CaseStatus,
    public readonly reason: string
  ) {
    super(`Cannot transition case from '${fromStatus}' to '${toStatus}': ${reason}`);
    this.name = "InvalidStatusTransitionError";
  }
}

/**
 * Validates whether a requested case status transition is allowed and meets all business prerequisites.
 */
export function validateStatusTransition(
  currentStatus: CaseStatus,
  request: CaseTransitionRequest
): TransitionValidationResult {
  const { targetStatus, changedByRole, reasonOrNotes, outcomeType, isProviderConfirmed } = request;

  // 1. Role-based override: Admins can override any transition (for administrative dispute resolution)
  if (changedByRole === "admin") {
    return { isValid: true };
  }

  // 2. Prevent non-admins from claiming provider confirmation
  if (isProviderConfirmed && changedByRole === "user") {
    return {
      isValid: false,
      error: "User cannot self-certify provider confirmation. Provider verification requires provider signal or administrative audit.",
    };
  }

  // 3. Repeated contact attempts are allowed while in 'contacted'
  if (currentStatus === "contacted" && targetStatus === "contacted") {
    return { isValid: true };
  }

  // 4. Check state machine graph
  const allowedNextStatuses = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowedNextStatuses.includes(targetStatus)) {
    return {
      isValid: false,
      error: `Invalid transition from '${currentStatus}' to '${targetStatus}'. Allowed next states: ${allowedNextStatuses.join(", ") || "none (terminal state)"}.`,
    };
  }

  // 5. Completion prerequisites
  if (targetStatus === "completed") {
    if (!outcomeType) {
      return {
        isValid: false,
        error: "An outcome type (e.g. repaired, sold, donated, recycled) must be recorded when completing a recovery case.",
      };
    }
  }

  // 6. Rejection prerequisites
  if (targetStatus === "rejected_by_provider") {
    if (!reasonOrNotes || reasonOrNotes.trim().length === 0) {
      return {
        isValid: false,
        error: "A reason must be recorded when reporting provider rejection (e.g., in-person quote reduced, category not accepted, device failed boot test).",
      };
    }
  }

  // 7. Failure prerequisites
  if (targetStatus === "failed") {
    if (!reasonOrNotes || reasonOrNotes.trim().length === 0) {
      return {
        isValid: false,
        error: "A failure explanation must be provided (e.g., lost in transit, unrepairable board short, logistics cancelled).",
      };
    }
  }

  return { isValid: true };
}

/**
 * Determines the next recommended action string for the user based on the current state.
 */
export function getNextRecommendedAction(
  status: CaseStatus,
  providerName?: string,
  isProviderVerified?: boolean
): string {
  switch (status) {
    case "created":
      return providerName
        ? `Contact ${providerName} using the verified contact details below to confirm current intake and quote.`
        : "Select a verified recovery facility or review alternative local options.";
    case "contacted":
      return "Awaiting provider response. Once the provider confirms intake terms, mark as 'Accepted by Provider'.";
    case "accepted_by_provider":
      return "Provider has accepted. Schedule courier pickup or prepare device for physical drop-off at verified depot.";
    case "in_transit_or_scheduled":
      return "Logistics active. Confirm physical receipt with depot or await postal tracking delivery.";
    case "dropped_off_or_collected":
      return "Device handed over. Awaiting final inspection, data sanitisation, and completion documentation.";
    case "completed":
      return isProviderVerified
        ? "Case complete! Outcome confirmed by provider verification."
        : "Case complete (user reported). Submit receipt or proof of handover for accredited verification tier.";
    case "rejected_by_provider":
      return "Provider was unable to accept device. Switch to an alternative provider or explore a secondary pathway.";
    case "failed":
      return "Recovery attempt was unsuccessful. You can restart or explore an alternative certified recycling option.";
    case "cancelled":
      return "This case was closed by the user.";
    default:
      return "Review case history.";
  }
}
