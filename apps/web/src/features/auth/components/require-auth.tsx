"use client";
import React from "react";
import { useRouter } from "next/router";
import { useSession } from "../hooks/use-session";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "anonymous") router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }, [status, router, pathname])

    return status === "authenticated" ? children : 'some default page'
}