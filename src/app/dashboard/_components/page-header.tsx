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
    <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

/** Content column shared by dashboard pages. */
export function PageBody({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:gap-8 md:px-8 md:py-10">{children}</main>;
}

export function PageSkeleton() {
  return (
    <PageBody>
      <div className="flex animate-pulse flex-col gap-6">
        <div className="h-9 w-56 rounded-xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-28 rounded-3xl bg-muted" />
          ))}
        </div>
        <div className="h-72 rounded-3xl bg-muted" />
      </div>
    </PageBody>
  );
}
