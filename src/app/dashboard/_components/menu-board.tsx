"use client";

import { startTransition, useActionState, useId, useOptimistic, useState } from "react";
import Image from "next/image";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronRightIcon,
  GripVerticalIcon,
  ImageIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { cn } from "cn";
import { ActionMenu } from "@/components/ui/action-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import type { Product } from "@/db/schema";
import { dict, fill, plural } from "@/lib/dictionary";
import { formatPrice } from "@/lib/format";
import {
  createCategory,
  deleteCategory,
  reorderCategories,
  reorderProducts,
  setProductAvailability,
  updateCategory,
} from "../menu-actions";
import { ConfirmDelete } from "./confirm-delete";
import { ProductSheet, type ProductTarget } from "./product-sheet";

export type BoardCategory = { id: string; name: string; products: Product[] };

type Change =
  | { type: "categories"; ids: string[] }
  | { type: "products"; categoryId: string; ids: string[] }
  | { type: "availability"; productId: string; isAvailable: boolean };

function applyChange(categories: BoardCategory[], change: Change): BoardCategory[] {
  switch (change.type) {
    case "categories":
      return change.ids.map((id) => categories.find((c) => c.id === id)).filter((c) => c !== undefined);
    case "products":
      return categories.map((c) =>
        c.id === change.categoryId
          ? { ...c, products: change.ids.map((id) => c.products.find((p) => p.id === id)).filter((p) => p !== undefined) }
          : c,
      );
    case "availability":
      return categories.map((c) => ({
        ...c,
        products: c.products.map((p) => (p.id === change.productId ? { ...p, isAvailable: change.isAvailable } : p)),
      }));
  }
}

const t = dict.dashboard.menu;

/** Client side of the menu editor: ordering, search, inline category editing and the item sheet. */
export function MenuBoard({ categories: initial }: { categories: BoardCategory[] }) {
  const [categories, apply] = useOptimistic(initial, applyChange);
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<ProductTarget | null>(null);
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /** Applies a change on this frame and saves it; an error result shows a toast and React reverts. */
  function commit(change: Change, save: () => Promise<{ error?: string } | undefined>) {
    startTransition(async () => {
      apply(change);
      const result = await save();
      if (result?.error) toast.error(result.error);
    });
  }

  function moveCategory(from: number, to: number) {
    if (to < 0 || to >= categories.length) return;
    const ids = arrayMove(categories, from, to).map((c) => c.id);
    commit({ type: "categories", ids }, () => reorderCategories(ids));
  }

  function onCategoryDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    moveCategory(
      categories.findIndex((c) => c.id === active.id),
      categories.findIndex((c) => c.id === over.id),
    );
  }

  function setAvailability(product: Product, isAvailable: boolean) {
    commit({ type: "availability", productId: product.id, isAvailable }, async () => {
      const result = await setProductAvailability(product.id, isAvailable);
      if (result?.ok) toast.success(fill(isAvailable ? t.markedAvailable : t.markedSoldOut, { name: product.name }));
      return result;
    });
  }

  const productCount = categories.reduce((sum, c) => sum + c.products.length, 0);
  const search = query.trim().toLowerCase();
  const results = search
    ? categories
        .map((c) => ({
          ...c,
          products: c.products.filter(
            (p) => p.name.toLowerCase().includes(search) || p.description?.toLowerCase().includes(search),
          ),
        }))
        .filter((c) => c.products.length > 0)
    : null;

  const sheet = (
    <ProductSheet target={target} onClose={() => setTarget(null)} categories={categories.map(({ id, name }) => ({ id, name }))} />
  );

  if (categories.length === 0) {
    return <EmptyMenu />;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar: search, quick add and category jump links. Sticks below the page header while scrolling. */}
      <div className="sticky top-[3.4rem] z-20 -mx-4 flex flex-col gap-3 md:top-0 border-b border-transparent bg-background/85 px-4 py-3 backdrop-blur-xl md:-mx-8 md:px-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.search}
              aria-label={t.search}
              className="h-10 rounded-xl bg-card pl-9"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={dict.common.close}
                className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>
          <Button size="lg" className="h-10" onClick={() => setTarget({ mode: "create", categoryId: categories[0].id })}>
            <PlusIcon />
            <span className="max-sm:sr-only">{t.addProduct}</span>
          </Button>
        </div>
        {!results && categories.length > 1 && (
          <nav aria-label={t.jumpTo} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none]">
            {categories.map((c) => (
              <a
                key={c.id}
                href={`#category-${c.id}`}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-medium ring-1 ring-border/80 transition-colors hover:bg-accent"
              >
                {c.name}
                <span className="text-muted-foreground tabular-nums">{c.products.length}</span>
              </a>
            ))}
          </nav>
        )}
      </div>

      {results ? (
        results.length === 0 ? (
          <p className="rounded-3xl border-2 border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
            {fill(t.noResults, { query: query.trim() })}
          </p>
        ) : (
          results.map((c) => (
            <section key={c.id} className="overflow-hidden rounded-3xl bg-card ring-1 ring-border/70">
              <h2 className="border-b px-5 py-3 font-heading text-sm font-bold text-muted-foreground">{c.name}</h2>
              <ul className="divide-y">
                {c.products.map((p) => (
                  <ProductRow key={p.id} product={p} onEdit={() => setTarget({ mode: "edit", product: p })} onAvailability={setAvailability} />
                ))}
              </ul>
            </section>
          ))
        )
      ) : (
        <DndContext id={`${dndId}-categories`} sensors={sensors} collisionDetection={closestCorners} onDragEnd={onCategoryDragEnd}>
          <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-5">
              {categories.map((category, index) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  isFirst={index === 0}
                  isLast={index === categories.length - 1}
                  onMove={(delta) => moveCategory(index, index + delta)}
                  onAddProduct={() => setTarget({ mode: "create", categoryId: category.id })}
                  onEditProduct={(product) => setTarget({ mode: "edit", product })}
                  onAvailability={setAvailability}
                  onReorderProducts={(ids) => commit({ type: "products", categoryId: category.id, ids }, () => reorderProducts(category.id, ids))}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {!results && <AddCategory />}
      <p className="text-center text-xs text-muted-foreground">
        {fill(t.summary, { categories: plural(t.categoryCount, categories.length), products: plural(t.productCount, productCount) })}
      </p>

      {sheet}
    </div>
  );
}

function CategorySection({
  category,
  isFirst,
  isLast,
  onMove,
  onAddProduct,
  onEditProduct,
  onAvailability,
  onReorderProducts,
}: {
  category: BoardCategory;
  isFirst: boolean;
  isLast: boolean;
  onMove: (delta: number) => void;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onAvailability: (product: Product, isAvailable: boolean) => void;
  onReorderProducts: (ids: string[]) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });
  const [renaming, setRenaming] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const products = category.products;

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = products.findIndex((p) => p.id === active.id);
    const to = products.findIndex((p) => p.id === over.id);
    onReorderProducts(arrayMove(products, from, to).map((p) => p.id));
  }

  return (
    <section
      ref={setNodeRef}
      id={`category-${category.id}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "scroll-mt-36 overflow-hidden rounded-3xl bg-card ring-1 ring-border/70 transition-shadow",
        isDragging && "relative z-10 shadow-2xl ring-2 ring-primary/40",
      )}
    >
      <header className="flex items-center gap-1.5 border-b py-2.5 pr-2.5 pl-2">
        <button
          ref={setActivatorNodeRef}
          type="button"
          aria-label={t.dragToReorder}
          className="flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted-foreground/70 hover:bg-accent hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-4" />
        </button>

        {renaming ? (
          <RenameCategory id={category.id} name={category.name} onDone={() => setRenaming(false)} />
        ) : (
          <>
            <button
              type="button"
              onClick={() => setRenaming(true)}
              className="group/name flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-1 text-left hover:bg-accent"
            >
              <h2 className="truncate font-heading text-lg font-bold tracking-tight">{category.name}</h2>
              <PencilIcon className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/name:opacity-100" />
            </button>
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
              {products.length}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={onAddProduct} className="text-primary">
                <PlusIcon />
                <span className="max-sm:sr-only">{t.addProduct}</span>
              </Button>
              <ActionMenu
                label={category.name}
                items={[
                  { label: t.renameCategory, icon: PencilIcon, onClick: () => setRenaming(true) },
                  { label: t.moveUp, icon: ArrowUpIcon, onClick: () => onMove(-1), disabled: isFirst },
                  { label: t.moveDown, icon: ArrowDownIcon, onClick: () => onMove(1), disabled: isLast },
                  { label: t.deleteCategory, icon: Trash2Icon, onClick: () => setConfirmOpen(true), destructive: true, separated: true },
                ]}
              />
            </div>
          </>
        )}
      </header>

      {products.length > 0 ? (
        <DndContext id={dndId} sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
          <SortableContext items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <ul className="divide-y">
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  sortable
                  onEdit={() => onEditProduct(product)}
                  onAvailability={onAvailability}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="p-3">
          <button
            type="button"
            onClick={onAddProduct}
            className="flex w-full flex-col items-center gap-1 rounded-2xl border-2 border-dashed px-4 py-7 text-sm transition-colors hover:border-primary/40 hover:bg-brand-tint/50"
          >
            <span className="flex items-center gap-1.5 font-medium text-primary">
              <PlusIcon className="size-4" />
              {t.addFirstProduct}
            </span>
            <span className="text-xs text-muted-foreground">{t.noProducts}</span>
          </button>
        </div>
      )}

      <ConfirmDelete
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={fill(t.deleteTitle, { name: category.name })}
        description={products.length > 0 ? plural(t.deleteCategoryWithProducts, products.length) : t.cannotUndo}
        onConfirm={async () => {
          await deleteCategory(category.id);
          toast.success(t.categoryDeleted);
        }}
      />
    </section>
  );
}

function ProductRow({
  product,
  sortable = false,
  onEdit,
  onAvailability,
}: {
  product: Product;
  sortable?: boolean;
  onEdit: () => void;
  onAvailability: (product: Product, isAvailable: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
    disabled: !sortable,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group/row relative flex items-center gap-2 bg-card py-2.5 pr-3 pl-2 transition-colors hover:bg-muted/40",
        isDragging && "z-10 rounded-xl shadow-xl ring-2 ring-primary/40",
      )}
    >
      {sortable && (
        <button
          ref={setActivatorNodeRef}
          type="button"
          aria-label={t.dragToReorder}
          className="relative z-[1] flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted-foreground/50 hover:bg-accent hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-4" />
        </button>
      )}

      <div
        className={cn(
          "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted ring-1 ring-border/60",
          !sortable && "ml-2",
          !product.isAvailable && "opacity-50 grayscale",
        )}
      >
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt="" width={56} height={56} className="size-full object-cover" />
        ) : (
          <ImageIcon className="size-5 text-muted-foreground/60" />
        )}
      </div>

      {/* The whole text area opens the editor; the button stretches over the row behind the controls. */}
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left outline-none after:absolute after:inset-0 focus-visible:after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring/50">
        <span className="flex items-center gap-2">
          <span className={cn("truncate font-medium", !product.isAvailable && "text-muted-foreground line-through decoration-1")}>
            {product.name}
          </span>
          {!product.isAvailable && (
            <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
              {dict.common.soldOut}
            </span>
          )}
        </span>
        {product.description && <span className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{product.description}</span>}
      </button>

      <span className="shrink-0 font-semibold tabular-nums">{formatPrice(product.price)}</span>
      <Switch
        checked={product.isAvailable}
        onCheckedChange={(checked) => onAvailability(product, checked)}
        aria-label={`${product.name}: ${t.available}`}
        className="relative z-[1] ml-2"
      />
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover/row:translate-x-0.5 max-sm:hidden" />
    </li>
  );
}

function RenameCategory({ id, name, onDone }: { id: string; name: string; onDone: () => void }) {
  const [state, action, pending] = useActionState(async (_prev: { error?: string }, formData: FormData) => {
    if (String(formData.get("name")).trim() === name) {
      startTransition(onDone);
      return {};
    }
    const result = await updateCategory(id, undefined, formData);
    if (!result?.ok) return { error: result?.error };
    toast.success(t.categoryRenamed);
    startTransition(onDone);
    return {};
  }, {});

  return (
    <form action={action} className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex gap-2">
        <Input
          name="name"
          defaultValue={name}
          required
          maxLength={50}
          autoFocus
          aria-label={t.categoryName}
          onKeyDown={(e) => e.key === "Escape" && onDone()}
          onFocus={(e) => e.currentTarget.select()}
          className="h-9 font-heading text-base font-bold"
        />
        <Button type="submit" disabled={pending}>
          {dict.common.save}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          {dict.common.cancel}
        </Button>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}

/** Inline "add category" that stays open for the next one, so several can be added in a row. */
function AddCategory() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    async (prev: { key: number; error?: string }, formData: FormData) => {
      const result = await createCategory(undefined, formData);
      if (!result?.ok) return { key: prev.key, error: result?.error };
      toast.success(t.categoryAdded);
      return { key: prev.key + 1 };
    },
    { key: 0 },
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 rounded-3xl border-2 border-dashed py-5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-brand-tint/40 hover:text-primary"
      >
        <PlusIcon className="size-4" />
        {t.addCategory}
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2 rounded-3xl bg-card p-3 ring-2 ring-primary/30">
      <div className="flex gap-2">
        <Input
          key={state.key}
          name="name"
          required
          maxLength={50}
          autoFocus
          placeholder={t.newCategory}
          aria-label={t.categoryName}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          className="h-10"
        />
        <Button type="submit" size="lg" className="h-10" disabled={pending}>
          {t.addCategory}
        </Button>
        <Button type="button" variant="ghost" size="lg" className="h-10" onClick={() => setOpen(false)}>
          {dict.common.cancel}
        </Button>
      </div>
      {state.error && <p className="px-1 text-sm text-destructive">{state.error}</p>}
    </form>
  );
}

/** First-run state: one field plus one-tap suggestions. */
function EmptyMenu() {
  const [state, action, pending] = useActionState(
    async (prev: { key: number; error?: string }, formData: FormData) => {
      const suggestion = formData.get("suggestion");
      if (suggestion) formData.set("name", suggestion);
      const result = await createCategory(undefined, formData);
      if (!result?.ok) return { key: prev.key, error: result?.error };
      toast.success(t.categoryAdded);
      return { key: prev.key + 1 };
    },
    { key: 0 },
  );

  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] bg-card px-6 py-14 text-center ring-1 ring-border/70">
      <div className="absolute inset-0 -z-10 bg-dots opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-tint text-primary shadow-sm">
          <SparklesIcon className="size-6" />
        </span>
        <h2 className="font-heading text-3xl font-extrabold tracking-tight">{t.emptyTitle}</h2>
        <p className="text-muted-foreground">{t.emptyText}</p>

        <form action={action} className="mt-2 flex w-full flex-col gap-4">
          <div className="flex gap-2">
            <Input key={state.key} name="name" maxLength={50} placeholder={t.newCategory} aria-label={t.categoryName} className="h-11" />
            <Button type="submit" size="lg" className="h-11" disabled={pending}>
              {t.addCategory}
            </Button>
          </div>
          {/* A suggestion submits its own name with the same form. */}
          <div className="flex flex-wrap justify-center gap-2">
            {t.suggestions.map((name) => (
              <Button
                key={name}
                type="submit"
                name="suggestion"
                value={name}
                variant="secondary"
                size="sm"
                formNoValidate
                disabled={pending}
                className="rounded-full"
              >
                <PlusIcon />
                {name}
              </Button>
            ))}
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        </form>
      </div>
    </section>
  );
}
