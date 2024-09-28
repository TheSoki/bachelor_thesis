import { DefaultLayout } from "./DefaultLayout";
import { match } from "ts-pattern";
import { Skeleton } from "@/client/shadcn/ui/skeleton";
import type { ReactNode } from "react";
import { FullscreenError } from "@/client/components/FullscreenError";
import { useAuth } from "@/client/hooks/useAuth";

type AuthLayoutProps = {
    children: ReactNode;
};

export const AuthLayout = ({ children }: AuthLayoutProps) => {
    const { session } = useAuth();

    return (
        <DefaultLayout>
            {match(session)
                .with(
                    {
                        status: "loading",
                    },
                    () => (
                        <>
                            <Skeleton className="mb-2 h-10 w-1/2" />
                            <Skeleton className="mb-2 h-10 w-1/3" />
                            <Skeleton className="mb-2 h-10 w-2/4" />
                        </>
                    ),
                )
                .with(
                    {
                        status: "authenticated",
                    },
                    () => <>{children}</>,
                )
                .otherwise(() => (
                    <FullscreenError statusCode={401} title="Unauthorized" />
                ))}
        </DefaultLayout>
    );
};
