import { useState } from "react";
import { signOut } from "../api";
import { announceSignOut } from "../session";
import { ApiError } from "@/lib/api-client";

export function useSignOut() {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit() {
        setIsPending(true);
        setError(null);
        
        try {
            await signOut()        
        } catch(err) {
            // A 401 means the cookie was already dead, so the server side is done anyway.
            // Anything else leaves the httpOnly cookie in place, and only the API can clear it.
            // Clearing memory alone would sign the user straight back in on the next page load.
            if (!(err instanceof ApiError && err.status === 401)) {
                setError("We couldn't sign you out. Check your connection and try again.");
                setIsPending(false);
                return;
            }
            }
            announceSignOut();
            // A full load wipes every in-memory trace of the user: token, query cache, stores
            window.location.replace("/login");
        }

    return { submit, error, isPending }

}