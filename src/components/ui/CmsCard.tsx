export function CmsCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-surface border border-line rounded-lg p-5 flex flex-col gap-3.5 ${className}`}>
      {title && (
        <h2 className="m-0 text-[14px] font-extrabold font-archivo text-ink">{title}</h2>
      )}
      {children}
    </div>
  );
}

export function CmsField({
  label,
  description,
  children,
  className = "",
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="cms-label">{label}</label>
      {description && (
        <p className="text-[12px] text-muted-2 m-0 -mt-1" style={{ fontFamily: "var(--font-public-sans)" }}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

export function CmsInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`cms-input ${props.className ?? ""}`} />;
}

export function CmsSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`cms-input ${props.className ?? ""}`}
    />
  );
}

export function CmsTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`cms-input resize-y ${props.className ?? ""}`}
    />
  );
}
