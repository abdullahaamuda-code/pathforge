"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
        return;
      }
      if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.push("/dashboard");
        return;
      }
      setChecking(false);
    }
  }, [user, loading]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center">
        <div className="w-7 h-7 bg-[#7F77DD] rounded-lg animate-pulse flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path d="M4 14 L9 4 L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 10.5 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

Also add to `.env.local` and Vercel:
```
NEXT_PUBLIC_ADMIN_EMAIL=youremail@gmail.com
