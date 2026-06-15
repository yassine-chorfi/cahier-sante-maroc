import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: string[];
}

export function PageHeader({ title, description, actions, breadcrumb }: Props) {
  return (
    <div className="animate-fade-in flex flex-col gap-4 rounded-[1.35rem] border border-slate-200 bg-white/88 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] backdrop-blur md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 space-y-2">
        {breadcrumb && (
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">
            {breadcrumb.join(" / ")}
          </p>
        )}
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">{title}</h2>
        {description && <p className="max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
