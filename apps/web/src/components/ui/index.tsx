"use client";

export function ViewHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4 md:mb-[26px] md:gap-5">
      <div className="min-w-0 flex-1">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="font-display text-[24px] font-medium tracking-[-0.2px] text-[var(--ink)] sm:text-[28px] md:text-[30px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-[520px] text-[13px] text-[var(--ink-soft)] sm:text-sm">
            {description}
          </p>
        )}
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    none: "low",
    low: "low",
    moderate: "moderate",
    high: "high",
  };
  const cls = map[severity] || "low";
  const label = severity === "none" ? "healthy" : severity;
  return <span className={`badge badge-${cls}`}>{label}</span>;
}

export function RiskBadge({ level }: { level: string }) {
  const cls = level === "severe" ? "severe" : level;
  return <span className={`badge badge-${cls}`}>{level}</span>;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-4 py-10 text-center text-[var(--ink-soft)] sm:px-6 sm:py-14">
      <div className="mb-2.5 text-[34px]">{icon}</div>
      <h4 className="mb-1.5 font-display text-lg font-semibold text-[var(--ink)]">
        {title}
      </h4>
      <p className="mb-[18px] text-[13.5px]">{description}</p>
      {action}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs font-medium text-[var(--blight)]" role="alert">
      {message}
    </p>
  );
}

export function ErrorBanner({
  title,
  message,
  onRetry,
  onDismiss,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  return (
    <div
      className="mb-4 flex flex-col gap-3 rounded-[9px] border border-[var(--blight-soft)] bg-[var(--blight-soft)] px-4 py-3.5 text-[13.5px] text-[var(--blight)] sm:flex-row sm:items-center"
      role="alert"
    >
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{title || "Something went wrong"}</div>
        <div className="mt-0.5 opacity-90">{message}</div>
      </div>
      <div className="flex shrink-0 gap-2">
        {onRetry && (
          <button type="button" className="btn btn-primary px-3 py-2 text-xs" onClick={onRetry}>
            Try again
          </button>
        )}
        {onDismiss && (
          <button type="button" className="btn btn-ghost px-3 py-2 text-xs" onClick={onDismiss}>
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-5 font-mono text-[13px] text-[var(--ink-soft)]">
      <div className="spinner" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function PersistBadge({
  saving,
  persistOk,
}: {
  saving: boolean;
  persistOk: boolean;
}) {
  if (saving) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--parchment-2)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ink-soft)]">
        <span className="spinner !h-3 !w-3 !border-2" /> Saving…
      </span>
    );
  }
  if (!persistOk) {
    return (
      <span className="inline-flex items-center rounded-full bg-[var(--blight-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--blight)]">
        Not saved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--sprout-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--sprout)]">
      Saved locally
    </span>
  );
}
