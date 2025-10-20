/**
 * Visual indicator for semantic similarity strength.
 * Fixed-width dot system ensures perfect alignment.
 */

interface RelatednessIndicatorProps {
  score: number;
  showPercentage?: boolean;
}

export function RelatednessIndicator({ score, showPercentage = false }: RelatednessIndicatorProps) {
  const scorePercentage = Math.round(score * 100);

  // Determine strength level and visual representation
  // Always 4 dots for consistent width - filled vs empty indicates strength
  const getStrengthLevel = (score: number) => {
    if (score >= 0.5)
      return { filled: 4, color: "text-green-600 dark:text-green-400", label: "Strong" };
    if (score >= 0.3)
      return { filled: 3, color: "text-amber-600 dark:text-amber-400", label: "Medium" };
    if (score >= 0.15) return { filled: 2, color: "text-text-secondary", label: "Weak" };
    return { filled: 1, color: "text-text-tertiary", label: "Very weak" };
  };

  const { filled, color, label } = getStrengthLevel(score);

  // Generate fixed-width dot indicator (always 4 characters)
  const filledDots = "●".repeat(filled);
  const emptyDots = "○".repeat(4 - filled);
  const dotString = filledDots + emptyDots;

  return (
    <div
      className="inline-flex items-center gap-1.5 group/indicator"
      title={`${scorePercentage}% similar · ${label} connection`}
    >
      <span className={`text-sm font-medium ${color} select-none tracking-tight`}>{dotString}</span>
      {showPercentage && (
        <span className="text-xs text-text-tertiary font-mono opacity-0 group-hover/indicator:opacity-100 transition-opacity">
          {scorePercentage}%
        </span>
      )}
    </div>
  );
}
