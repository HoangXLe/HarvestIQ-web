"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  onError?: (message: string) => void;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message:
        error?.message?.trim() ||
        "This screen hit an unexpected error. Your saved data should still be intact.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("UI error boundary:", error, info.componentStack);
    try {
      this.props.onError?.(
        error?.message || "An unexpected error occurred on this page.",
      );
    } catch {
      /* ignore */
    }
  }

  private reset = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="card border-[var(--blight-soft)]"
        role="alert"
        style={{ borderColor: "var(--blight-soft)" }}
      >
        <h2 className="mb-2 font-display text-xl font-semibold text-[var(--ink)]">
          {this.props.fallbackTitle || "Something went wrong"}
        </h2>
        <p className="mb-4 text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
          {this.state.message}
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={this.reset}>
            Try this page again
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              try {
                window.location.href = "/";
              } catch {
                this.reset();
              }
            }}
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }
}
