import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zen Mutolaa — Bookify",
  description: "Diqqatni jamlab, tinch muhitda chalgʻimay mutolaa qiling.",
};

export default function ZenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
