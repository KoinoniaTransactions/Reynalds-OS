export const PERSONAL_FINANCE_AUTO_PRESELECT_CONFIDENCE =
  0.5;

export type PersonalFinanceReconciliationSuggestion = {
  targetKey: string;
  confidence: number;
};

export function recommendedPersonalFinanceTargetKey({
  suggestions,
  isAmbiguous
}: {
  suggestions: readonly PersonalFinanceReconciliationSuggestion[];
  isAmbiguous: boolean;
}): string | null {
  if (isAmbiguous) {
    return null;
  }

  return (
    suggestions.find(
      (suggestion) =>
        suggestion.confidence >=
        PERSONAL_FINANCE_AUTO_PRESELECT_CONFIDENCE
    )?.targetKey ?? null
  );
}
