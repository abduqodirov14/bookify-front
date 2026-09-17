"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import AuthForm from "@/components/AuthForm";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={32} /></div>}>
      <AuthForm />
    </Suspense>
  );
}
