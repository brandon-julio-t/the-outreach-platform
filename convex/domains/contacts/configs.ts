export const contactFilterTypes = [
  "all",
  "in_progress",
  "goals_achieved",
  "ai_assistant_disabled",
] as const;

export const contactFilterTypeUiLabels: Record<
  (typeof contactFilterTypes)[number],
  string
> = {
  all: "All",
  in_progress: "In Progress",
  goals_achieved: "Goals Achieved",
  ai_assistant_disabled: "AI Assistant Disabled",
};
