export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="mb-1.5 text-xs text-gray-500">{hint}</p>}
      {children}
    </div>
  );
}
