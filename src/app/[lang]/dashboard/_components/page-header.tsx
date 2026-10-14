export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

/** Content column shared by dashboard pages. */
export function PageBody({ children }: { children: React.ReactNode }) {
  return <main className="flex w-full flex-col gap-6 p-4 md:p-8">{children}</main>;
}

export function PageSkeleton() {
  return (
    <PageBody>
      <div className="flex animate-pulse flex-col gap-6">
        <div className="h-8 w-48 rounded-md bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-muted" />
      </div>
    </PageBody>
  );
}
