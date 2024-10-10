import React, { useCallback } from "react";
import { useAuth } from "@/client/hooks/useAuth";
import { Button } from "@/client/shadcn/ui/button";
import { Skeleton } from "@/client/shadcn/ui/skeleton";
import { match } from "ts-pattern";

type AuthButtonProps = {
    onCloseMenu: () => void;
};

export const AuthButton = ({ onCloseMenu }: AuthButtonProps) => {
    const { session, handleSignIn, handleSignOut } = useAuth();

    const onSignoutClick = useCallback(() => {
        handleSignOut();
        onCloseMenu();
    }, [handleSignOut, onCloseMenu]);

    const onSigninClick = useCallback(() => {
        handleSignIn();
        onCloseMenu();
    }, [handleSignIn, onCloseMenu]);

    return match(session)
        .with({ status: "loading" }, () => <Skeleton className="h-10 w-20" />)
        .with({ status: "authenticated" }, ({ data }) => (
            <Button variant="default" onClick={onSignoutClick}>
                ({data.user.name}) Sign Out
            </Button>
        ))
        .otherwise(() => (
            <Button variant="outline" onClick={onSigninClick}>
                Sign In
            </Button>
        ));
};
