"use client";

import { Toast } from "@base-ui/react/toast";
import { CircleAlertIcon, CircleCheckIcon, XIcon } from "lucide-react";
import { dict } from "@/lib/dictionary";

/** Shared manager, so toasts can be queued from anywhere (event handlers, after actions). */
const manager = Toast.createToastManager();

export const toast = {
  success: (title: string) => manager.add({ title, type: "success", timeout: 3000 }),
  error: (title: string) => manager.add({ title, type: "error", priority: "high" }),
};

/** Stacked toasts in the bottom-right corner (bottom-centre on phones). */
export function Toaster({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider toastManager={manager} limit={3}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 z-[60] mx-auto sm:left-auto sm:w-90 md:right-6 md:bottom-6">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((item) => {
    const Icon = item.type === "error" ? CircleAlertIcon : CircleCheckIcon;
    return (
      <Toast.Root
        key={item.id}
        toast={item}
        className="absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] h-(--height) w-full origin-bottom rounded-2xl bg-popover text-popover-foreground shadow-xl ring-1 shadow-foreground/10 ring-foreground/10 select-none [--gap:0.625rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.625rem] [--scale:calc(max(0,1-(var(--toast-index)*0.08)))] [--shrink:calc(1-var(--scale))] [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_0.45s_cubic-bezier(0.22,1,0.36,1),opacity_0.45s,height_0.15s] after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full data-ending-style:opacity-0 data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))] data-limited:opacity-0 data-starting-style:[transform:translateY(150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)] data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]"
      >
        <Toast.Content className="flex items-center gap-3 overflow-hidden py-3 pr-2.5 pl-3.5 transition-opacity duration-200 data-behind:opacity-0 data-expanded:opacity-100">
          <Icon
            className={`size-5 shrink-0 ${item.type === "error" ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}
          />
          <Toast.Title className="min-w-0 flex-1 text-sm font-medium" />
          <Toast.Close
            aria-label={dict.common.close}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <XIcon className="size-4" />
          </Toast.Close>
        </Toast.Content>
      </Toast.Root>
    );
  });
}
