"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const profile = params.get("profile");
    const error = params.get("error");

    if (error || !token) {
      router.replace("/?error=" + (error ?? "unknown"));
      return;
    }

    localStorage.setItem("token", token);
    if (profile) {
      try {
        localStorage.setItem("profile", profile);
      } catch {}
    }

    router.replace("/home");
  }, [params, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#eaf2f9]">
      <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
    </div>
  );
}
