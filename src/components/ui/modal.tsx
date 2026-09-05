"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          "relative z-50 w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh] sm:max-h-[90vh]",
          className
        )}
      >
        <div className="flex items-start justify-between p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/50 shrink-0 bg-surface">
          <div className="pr-3 sm:pr-4 min-w-0">
            <h2 className="font-serif text-base sm:text-lg font-semibold text-foreground leading-tight truncate sm:whitespace-normal">
              {title}
            </h2>
            {description && (
              <p className="text-xs sm:text-sm text-muted mt-0.5 sm:mt-1 leading-snug line-clamp-2 sm:line-clamp-none">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted hover:text-foreground hover:bg-surface-elevated transition-colors shrink-0"
            title="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
