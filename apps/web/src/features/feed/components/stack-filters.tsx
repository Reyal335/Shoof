export const STACKS = ["React", "TypeScript", "Node.js", "Vue", "Next.js", "Tailwind", "HTML & CSS"];

type Props = {
  value: string | null;
  /** Called with null when the active chip is pressed again. */
  onChange: (stack: string | null) => void;
};

export function StackFilters({ value, onChange }: Props) {
  return (
    <div role="group" aria-labelledby="stack-label" className="flex flex-wrap items-center gap-2">
      <span id="stack-label" className="mr-1 text-sm font-semibold text-ink-muted">
        Stack
      </span>
      {STACKS.map((stack) => (
        <button
          key={stack}
          type="button"
          aria-pressed={stack === value}
          onClick={() => onChange(stack === value ? null : stack)}
          className="h-[34px] rounded-lg border-[1.5px] border-divider bg-white px-3.5 text-sm font-semibold text-navy aria-pressed:border-yellow aria-pressed:bg-tint"
        >
          {stack}
        </button>
      ))}
    </div>
  );
}
