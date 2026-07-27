"use client";

import { useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorBanner, PersistBadge } from "@/components/ui";
import { Sidebar } from "@/components/layout/Sidebar";
import { getErrorMessage } from "@/lib/errors";
import { useApp } from "@/lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    toastMessage,
    clearToast,
    ready,
    loadError,
    reload,
    saving,
    persistOk,
    toast,
  } = useApp();

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(clearToast, 4200);
    return () => clearTimeout(t);
  }, [toastMessage, clearToast]);

  // Catch unhandled promise rejections from UI handlers
  useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      const message = getErrorMessage(
        event.reason,
        "Something went wrong. Please try that action again.",
      );
      toast(message, true);
    };
    const onError = (event: ErrorEvent) => {
      // Avoid noisy third-party script noise; still surface app errors
      if (!event.message) return;
      if (event.message.includes("ResizeObserver")) return;
      toast(
        getErrorMessage(event.error, "An unexpected error occurred."),
        true,
      );
    };
    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("error", onError);
    return () => {
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("error", onError);
    };
  }, [toast]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--parchment)] px-4 text-[var(--ink-soft)]">
        <div className="flex items-center gap-3 font-mono text-sm">
          <div className="spinner" /> Loading your workspace…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Sidebar />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto min-w-0 max-w-[1180px] flex-1 px-3.5 py-4 pb-24 sm:px-[18px] sm:py-[22px] md:px-[42px] md:py-[34px] md:pb-[60px]"
      >
        <div className="mb-3 flex justify-end md:mb-0">
          <PersistBadge saving={saving} persistOk={persistOk} />
        </div>
        {loadError && (
          <ErrorBanner
            title="Workspace load issue"
            message={loadError}
            onRetry={() => {
              void reload().catch((e) =>
                toast(getErrorMessage(e, "Could not reload workspace."), true),
              );
            }}
          />
        )}
        <div className="view-anim">
          <ErrorBoundary onError={(msg) => toast(msg, true)}>
            {children}
          </ErrorBoundary>
        </div>
      </main>
      {toastMessage && (
        <div className="fixed right-3 bottom-20 left-3 z-[200] flex justify-center md:right-[22px] md:bottom-[22px] md:left-auto md:justify-end">
          <div
            className={`w-full max-w-[360px] rounded-lg px-[18px] py-3 text-[13.5px] text-[var(--parchment)] shadow-[0_10px_30px_rgba(0,0,0,0.3)] md:w-auto ${
              toastMessage.error ? "bg-[var(--blight)]" : "bg-[var(--canopy)]"
            }`}
            style={{ animation: "toastIn 0.25s ease" }}
            role="status"
          >
            {toastMessage.msg}
          </div>
        </div>
      )}
    </div>
  );
}
