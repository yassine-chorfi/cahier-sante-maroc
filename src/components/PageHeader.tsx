import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: string[];
}

export function PageHeader({ title, description, actions, breadcrumb }: Props) {
  return (
    <div className="flex flex-col gap-2 border-b pb-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1">
        {breadcrumb && <p className="text-xs text-muted-foreground">{breadcrumb.join(" / ")}</p>}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
