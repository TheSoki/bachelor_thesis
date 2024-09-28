import { useSession, signIn, signOut } from "next-auth/react";
import { useCallback } from "react";

export const useAuth = () => {
    const session = useSession();

    const handleSignIn = useCallback(async () => {
        await signIn();
    }, []);

    const handleSignOut = useCallback(async () => {
        await signOut();
        await signIn();
    }, []);

    return {
        session,
        handleSignIn,
        handleSignOut,
    };
};
