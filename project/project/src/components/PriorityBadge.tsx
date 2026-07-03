interface PriorityBadgeProps {
  value: string;
  onChange: (value: string) => void;
}

export function PriorityBadge({ value, onChange }: PriorityBadgeProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded bg-orange-50 px-2 py-1 text-xs text-orange-700 border border-orange-100"
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
  );
}
