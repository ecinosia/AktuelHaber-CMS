const MAX_WIDTHS = {
  sm: "max-w-[900px]",
  md: "max-w-[1100px]",
  lg: "max-w-[1300px]",
  xl: "max-w-[2000px]",
} as const;

export function PageContainer({
  children,
  className = "",
  size = "xl",
}: {
  children: React.ReactNode;
  className?: string;
  size?: keyof typeof MAX_WIDTHS;
}) {
  return (
    <div className={`flex flex-col gap-5 ${MAX_WIDTHS[size]} ${className}`}>
      {children}
    </div>
  );
}
