import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saqlangan — Bookify",
  description: "Sevimli va saqlab qoʻyilgan sara asarlaringiz.",
};

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
