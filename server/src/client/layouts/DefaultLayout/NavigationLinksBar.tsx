import { useAuth } from "@/client/hooks/useAuth";
import { NavigationLink } from "./NavigationLink";
import { match } from "ts-pattern";
import { useCallback } from "react";
import { Button } from "@/client/shadcn/ui/button";
import { Skeleton } from "@/client/shadcn/ui/skeleton";

type NavigationLinksBarProps = {
    onLinkClick?: () => void;
    onCloseMenu: () => void;
};

export const NavigationLinksBar = ({ onLinkClick, onCloseMenu }: NavigationLinksBarProps) => {
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
            <>
                <NavigationLink href="/users" onLinkClick={onLinkClick}>
                    Users
                </NavigationLink>
                <NavigationLink href="/devices" onLinkClick={onLinkClick}>
                    Devices
                </NavigationLink>
                <NavigationLink href="/audit-logs" onLinkClick={onLinkClick}>
                    Audit Logs
                </NavigationLink>
                <Button
                    variant="default"
                    className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                    onClick={onSignoutClick}
                >
                    ({data.user.name}) Sign Out
                </Button>
            </>
        ))
        .otherwise(() => (
            <Button
                variant="default"
                className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                onClick={onSigninClick}
            >
                Sign In
            </Button>
        ));
};
