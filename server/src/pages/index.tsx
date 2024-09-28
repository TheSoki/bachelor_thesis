import { useEffect, useRef } from "react";
import type { NextPageWithLayout } from "./_app";
import { useRouter } from "next/router";
import { useAuth } from "@/client/hooks/useAuth";

const Home: NextPageWithLayout = () => {
    const hasBeenRedirected = useRef(false);
    const router = useRouter();
    const { session, handleSignIn } = useAuth();

    useEffect(() => {
        if (session.status === "loading" || hasBeenRedirected.current) {
            return;
        }

        hasBeenRedirected.current = true;

        if (session.status === "authenticated") {
            router.push("/devices");
            return;
        }

        handleSignIn();
    }, [handleSignIn, router, session.status]);

    return <></>;
};

export default Home;
