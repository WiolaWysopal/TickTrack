interface StatusBadgeProps {
  value: string;
  onChange: (value: string) => void;
}

export function StatusBadge({ value, onChange }: StatusBadgeProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 border border-blue-100"
    >
      <option value="todo">To Do</option>
      <option value="in_progress">In Progress</option>
      <option value="done">Done</option>
    </select>
  );
}
