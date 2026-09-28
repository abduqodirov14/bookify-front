import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil — Bookify",
  description: "Foydalanuvchi shaxsiy profili va mutolaa maʼlumotlari.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
