"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/command");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-muted">Redirecting to Command Center...</div>
    </div>
  );
}
