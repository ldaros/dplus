"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const cookies = Cookies.get("token");

    if (!cookies) {
      router.push("/login"); // Redirect to login if no token or cookie
    } else {
      router.push("/browse"); // Redirect to browse page if token or cookie exists
    }
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen text-white">
      <Loader2 className="animate-spin h-10 w-10" />
    </div>
  );
}
