
import { PropsWithChildren } from "react";

/** Wrap any content in a glass-morphism card that auto-sizes with padding */
export default function GlassCard({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={`glass-surface p-4 sm:p-6 ${className}`}>
      {children}
    </section>
  );
}
